import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { createRequire } from 'module';
import { ProviderFactory } from './api/providers/factory.ts';
import { supabase, getUserBalance, getCreditHistory, addCreditTransaction, hasEnoughCredits } from './api/supabaseClient.js';
import { calculateCreditsNeeded } from './api/creditCalculator.js';
import { metricsHandler, timelineHandler, providersHandler } from './api/metricsHandlers.js';
import { trackEvent } from './api/analyticsService.js';
import { optimizePrompt, getImprovementsSummary } from './api/promptOptimizer.js';
import { formatDesignAnswersForGeneration, logDesignAnswers } from './api/designAnswerFormatter.js';
import { getStatusMessage, createStatusUpdateEvent } from './api/statusMessageService.js';

const require = createRequire(import.meta.url);
const { sendPaymentConfirmation } = require('./emailService.cjs');

const PORT = process.env.API_PORT || 5178;

// ========================
// SECURITY: CORS WHITELIST
// ========================
const ALLOWED_ORIGINS = [
  'http://localhost:5173',        // Local dev
  'http://localhost:5174',        // Alternative local
  'http://localhost:3000',        // Next.js dev
  process.env.FRONTEND_URL,       // Production frontend
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// ========================
// SECURITY: RATE LIMITING
// ========================
const generateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,        // 1 minute window
  max: 10,                         // 10 requests per minute per IP
  message: 'Too many generation requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,        // 15 minute window
  max: 100,                        // 100 requests per 15 minutes
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// ========================
// SECURITY: INPUT VALIDATION
// ========================
const GenerateRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt required').max(5000, 'Prompt too long'),
  type: z.enum(['generate', 'refine']).optional().default('generate'),
  template: z.enum(['landing', 'saas', 'ecommerce', 'admin']).optional(),
  provider: z.enum(['anthropic', 'gemini', 'llama', 'openai']).optional().default('anthropic'),
  model: z.string().optional(),
  appType: z.enum(['web', 'mobile']).optional().default('web'),
  currentFiles: z.array(z.object({
    path: z.string(),
    content: z.string(),
    language: z.string(),
  })).optional(),
  // Design system answers from adaptive workflow
  designAnswers: z.object({
    colorPalette: z.object({
      id: z.string(),
      name: z.string(),
      primary: z.string(),
      secondary: z.string(),
      accent: z.string(),
    }).optional(),
    typography: z.object({
      id: z.string(),
      name: z.string(),
      heading: z.string(),
      body: z.string(),
    }).optional(),
    layoutDirection: z.object({
      id: z.string(),
      name: z.string(),
      layout: z.string(),
    }).optional(),
    designMockup: z.object({
      id: z.string(),
      name: z.string(),
      vibe: z.string(),
    }).optional(),
  }).optional(),
});

const InlineEditRequestSchema = z.object({
  selectedText: z.string().min(1, 'Selected text required').max(2000),
  instruction: z.string().min(1, 'Instruction required').max(1000),
  filePath: z.string().optional(),
});

// ========================
// HELPER FUNCTIONS
// ========================
function sendEvent(res, obj) {
  res.write(`data: ${JSON.stringify(obj)}\n\n`);
}

function extractJson(rawText) {
  const match = rawText.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error('No valid JSON found in response');
  }
  return JSON.parse(match[0]);
}

/**
 * Middleware: Verify JWT token from Supabase
 * Extracts user_id from token and adds to req.user
 */
async function verifyJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  try {
    // ✅ TODO: Verify token with Supabase public key
    // For now, just decode the JWT (verify on Supabase side later)
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    // Decode payload (base64url)
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    
    if (!payload.sub) {
      throw new Error('Invalid token: missing sub (user ID)');
    }

    // Attach user to request
    req.user = {
      id: payload.sub,
      email: payload.email,
    };

    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    res.status(401).json({ error: 'Unauthorized', details: error.message });
  }
}

// ========================
// SETUP EXPRESS & MIDDLEWARE
// ========================
const app = express();

// Middleware order is important!
app.use(express.json({ limit: '1mb' }));  // Limit request size
app.use(express.text({ limit: '10mb' })); // For streaming responses
app.use(cors(corsOptions));
app.use(globalLimiter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err.message.includes('CORS policy')) {
    res.status(403).json({ error: 'CORS policy violation', details: err.message });
  } else if (err instanceof SyntaxError && err.status === 400) {
    res.status(400).json({ error: 'Invalid JSON in request body' });
  } else {
    res.status(500).json({ error: 'Internal server error', details: process.env.NODE_ENV === 'development' ? err.message : undefined });
  }
});

// ========================
// API ENDPOINTS
// ========================

/**
 * POST /api/config
 * Public endpoint to get safe configuration
 * Frontend uses this to know what providers are available
 */
app.get('/api/config', (req, res) => {
  res.json({
    providers: ['anthropic', 'gemini', 'llama'],
    templates: ['landing', 'saas', 'ecommerce', 'admin'],
    platforms: ['web', 'mobile'],
  });
});

/**
 * POST /api/deploy
 * Deploy generated app to Vercel (backend handles token securely)
 */
app.post('/api/deploy', globalLimiter, async (req, res) => {
  try {
    const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
    if (!VERCEL_TOKEN) {
      return res.status(500).json({ error: 'Vercel deployment not configured' });
    }

    const { file, projectName, framework } = req.body;
    if (!file) {
      return res.status(400).json({ error: 'File required' });
    }

    // Deploy to Vercel using backend token
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.message || 'Vercel deployment failed' });
    }

    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('Deploy error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Deployment failed' });
  }
});

/**
 * GET /api/deploy/status/:deploymentId
 * Check deployment status
 */
app.get('/api/deploy/status/:deploymentId', globalLimiter, async (req, res) => {
  try {
    const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
    if (!VERCEL_TOKEN) {
      return res.status(500).json({ error: 'Vercel deployment not configured' });
    }

    const { deploymentId } = req.params;
    const response = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to check deployment status' });
    }

    res.json(await response.json());
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Status check failed' });
  }
});

/**
 * POST /api/generate
 * Main code generation endpoint with streaming
 * Requires: Authorization Bearer token
 */
app.post('/api/generate', generateLimiter, verifyJWT, async (req, res) => {
  try {
    // Validate request
    const validated = GenerateRequestSchema.parse(req.body);
    
    const userId = req.user?.id;
    const provider = validated.provider || 'anthropic';
    const template = validated.template || 'landing';
    const appType = validated.appType || 'web';
    const designAnswers = validated.designAnswers;

    // ✨ OPTIMIZE THE PROMPT AUTOMATICALLY
    const optimizationResult = optimizePrompt(validated.prompt);
    const improvementsSummary = getImprovementsSummary(optimizationResult);
    
    console.log(`[Optimize] Prompt optimized with ${optimizationResult.improvements.length} improvements`);
    
    // 🎨 ENHANCE PROMPT WITH DESIGN SYSTEM DECISIONS
    let enhancedPrompt = optimizationResult.optimized;
    const designFormatted = formatDesignAnswersForGeneration(designAnswers);
    if (designFormatted) {
      enhancedPrompt += designFormatted;
      console.log(`[Design] Prompt enhanced with design system: ${designAnswers.colorPalette?.name || 'none'}`);
    }
    
    // Use the enhanced prompt for generation
    validated.prompt = enhancedPrompt;

    // Calculate credits needed
    const creditsNeeded = calculateCreditsNeeded(template, provider, appType);
    
    console.log(`[Generate] User: ${userId}, Provider: ${provider}, Template: ${template}, AppType: ${appType}, Credits: ${creditsNeeded}`);

    // Check if user has enough credits
    const hasCredits = await hasEnoughCredits(userId, creditsNeeded);
    if (!hasCredits) {
      const balance = await getUserBalance(userId);
      return res.status(402).json({
        error: 'Insufficient credits',
        required: creditsNeeded,
        available: balance,
      });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Delegate to provider
    const providerService = ProviderFactory.getProvider(provider);
    const apiKey = getProviderApiKey(provider);
    
    if (!apiKey) {
      throw new Error(`${provider} API key not configured`);
    }

    // Generate application
    let generationId;
    let generationSuccess = false;
    let generationStartTime = Date.now();
    let statusIntervalId;
    
    try {
      // Create a generation ID for tracking
      generationId = crypto.randomUUID?.() || Date.now().toString();

      // Send design system info to client
      if (designFormatted) {
        sendEvent(res, {
          type: 'design_system_applied',
          design: {
            colorPalette: designAnswers?.colorPalette?.name || null,
            typography: designAnswers?.typography?.name || null,
            layout: designAnswers?.layoutDirection?.name || null,
            direction: designAnswers?.designMockup?.name || null,
          },
          message: `Applying design system to generated code...`,
        });
      }

      // Start status message streaming
      sendEvent(res, {
        type: 'status_update',
        message: '⚙️  Analyzing requirements...',
        progress: 5,
      });

      // Send status updates every 1.5 seconds
      statusIntervalId = setInterval(() => {
        const elapsedMs = Date.now() - generationStartTime;
        const statusEvent = createStatusUpdateEvent(elapsedMs, designAnswers);
        sendEvent(res, statusEvent);
      }, 1500);

      // Generate the app
      await providerService.generate(validated, apiKey, (chunk) => {
        sendEvent(res, { chunk });
      });

      // Clear status interval
      if (statusIntervalId) clearInterval(statusIntervalId);

      generationSuccess = true;
      
      // Final status message
      sendEvent(res, {
        type: 'status_update',
        message: '✨ Finalizing...',
        progress: 95,
      });

      sendEvent(res, { 
        status: 'generation_complete', 
        message: 'App generated successfully',
        progress: 100,
      });

      // Send optimizations info
      if (improvementsSummary.hasImprovements) {
        sendEvent(res, {
          type: 'prompt_optimized',
          improvements: improvementsSummary.summary,
          count: improvementsSummary.count,
          message: `✨ Prompt enhanced with ${improvementsSummary.count} improvements`
        });
      }

      // Deduct credits after successful generation
      try {
        const newBalance = await addCreditTransaction(userId, -creditsNeeded, 'generation', {
          generation_id: generationId,
          description: `Generated ${template} app with ${provider}`,
          design_system: designAnswers ? logDesignAnswers(userId, designAnswers, validated.prompt) : null,
        });
        
        console.log(`✅ Deducted ${creditsNeeded} credits from user ${userId}, new balance: ${newBalance}`);
        sendEvent(res, { 
          type: 'credits_deducted',
          creditsDeducted: creditsNeeded, 
          newBalance,
          message: `Credits deducted. Remaining: ${newBalance}`
        });
      } catch (creditError) {
        console.error('Error deducting credits:', creditError);
        sendEvent(res, { 
          type: 'credits_deduction_error',
          error: 'Failed to deduct credits',
          message: 'Credits will be deducted shortly. Please refresh to see updates.'
        });
      }
    } catch (generationError) {
      // Clear status interval on error
      if (statusIntervalId) clearInterval(statusIntervalId);
      
      console.error('Generation error:', generationError);
      sendEvent(res, { 
        type: 'generation_error',
        error: generationError.message || 'Generation failed',
        message: 'Failed to generate app. Please try again.'
      });
    }

    res.end();
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Validation error
      sendEvent(res, { error: 'Validation error', details: error.errors });
    } else {
      // Other errors
      console.error('Generation error:', error);
      sendEvent(res, { error: error instanceof Error ? error.message : 'Generation failed' });
    }
    res.end();
  }
});

/**
 * POST /api/validate-design
 * Validates generated code against design system choices
 */
app.post('/api/validate-design', globalLimiter, async (req, res) => {
  try {
    const { generatedHTML, designAnswers } = req.body;

    if (!generatedHTML || !designAnswers) {
      return res.status(400).json({
        error: 'Missing required fields: generatedHTML, designAnswers',
      });
    }

    // Dynamic import of validation function
    const { validateDesignConsistency } = await import('./src/services/designValidation.ts');

    // Validate design consistency
    const validationResult = await validateDesignConsistency(generatedHTML, designAnswers);

    // Log validation result
    console.log('Design Validation Complete:', {
      score: validationResult.overallScore,
      allValid: validationResult.allValid,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      validation: validationResult,
    });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      error: 'Validation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/ai/inline-edit
 * AI-assisted code editing
 */
app.post('/api/ai/inline-edit', globalLimiter, async (req, res) => {
  try {
    const validated = InlineEditRequestSchema.parse(req.body);
    
    const systemPrompt = `You are a helpful code editor assistant. Return ONLY the modified code, no commentary.`;
    const userContent = `File: ${validated.filePath || 'unknown'}\nInstruction: ${validated.instruction}\n\nCode:\n${validated.selectedText}`;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{ role: 'user', content: userContent }],
      system: systemPrompt,
    });

    const modified = message.content[0].type === 'text' ? message.content[0].text : '';
    res.json({ modified: modified.replace(/```(json|tsx?|jsx?)?/g, '').replace(/```/g, '').trim() });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      console.error('Inline edit error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Inline edit failed' });
    }
  }
});

/**
 * POST /api/stripe/checkout
 * Create Stripe checkout session for credit purchase
 * Requires: Authorization Bearer token
 */
app.post('/api/stripe/checkout', generateLimiter, verifyJWT, async (req, res) => {
  try {
    const { creditsPackage } = req.body;

    if (!creditsPackage || !['starter', 'pro', 'enterprise'].includes(creditsPackage)) {
      return res.status(400).json({ error: 'Invalid credit package' });
    }

    // Define package details with amounts in cents
    const packages = {
      starter: { credits: 100, amount: 999 },    // $9.99
      pro: { credits: 500, amount: 3999 },       // $39.99
      enterprise: { credits: 2000, amount: 11999 } // $119.99
    };

    const pkg = packages[creditsPackage];
    const { stripe } = await import('./api/stripe.ts');

    // Create checkout session with amount-based pricing
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: req.user.email,
      client_reference_id: req.user.id,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `VibeCoder ${creditsPackage.charAt(0).toUpperCase() + creditsPackage.slice(1)} Package`,
              description: `${pkg.credits} credits for code generation`
            },
            unit_amount: pkg.amount
          },
          quantity: 1
        }
      ],
      success_url: `${process.env.FRONTEND_URL}/billing?status=success&credits=${pkg.credits}`,
      cancel_url: `${process.env.FRONTEND_URL}/billing?status=cancelled`,
      metadata: {
        userId: req.user.id,
        creditsPackage,
        credits: pkg.credits.toString()
      }
    });

    res.json({ sessionUrl: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Checkout failed' });
  }
});

/** * GET /api/user/info
 * Get current user info (user ID, email)
 * Requires: Authorization Bearer token
 */
app.get('/api/user/info', verifyJWT, (req, res) => {
  res.json({
    userId: req.user.id,
    email: req.user.email
  });
});

/** * GET /api/user/credits
 * Get user's current credit balance
 * Requires: Authorization Bearer token
 */
app.get('/api/user/credits', verifyJWT, async (req, res) => {
  try {
    console.log(`📊 Fetching credits for user: ${req.user.id}`);
    
    // Check if user exists in user_credits table
    const { data: existingUser, error: checkError } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', req.user.id)
      .single();

    // If user doesn't exist, create entry with 0 balance
    if (checkError?.code === 'PGRST116') {
      console.log(`📝 Creating new user credits entry for: ${req.user.id}`);
      const { error: insertError } = await supabase
        .from('user_credits')
        .insert({
          user_id: req.user.id,
          balance: 0,
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        });

      if (insertError) {
        throw new Error(`Failed to create user credits: ${insertError.message}`);
      }
      console.log(`✅ New user credits entry created with 0 balance`);
      res.json({ credits: 0, userId: req.user.id });
    } else if (checkError) {
      throw checkError;
    } else {
      // User exists, return balance
      console.log(`✅ Balance fetched: ${existingUser.balance}`);
      res.json({ credits: existingUser.balance, userId: req.user.id });
    }
  } catch (error) {
    console.error('❌ Credits fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch credits', details: error.message });
  }
});

/**
 * POST /api/stripe/webhook/test
 * Test webhook endpoint (no signature verification)
 * Used for local testing of webhook functionality
 */
app.post('/api/stripe/webhook/test', express.json(), async (req, res) => {
  try {
    const event = req.body;
    
    console.log('🧪 TEST WEBHOOK received:', event.type);
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.client_reference_id;
      
      if (!userId) {
        return res.status(400).json({ error: 'Missing userId in session' });
      }

      const creditsPackage = session.metadata?.creditsPackage;
      let creditsToAdd = 0;

      if (creditsPackage === 'starter') {
        creditsToAdd = 100;
      } else if (creditsPackage === 'pro') {
        creditsToAdd = 500;
      } else if (creditsPackage === 'enterprise') {
        creditsToAdd = 2000;
      }

      if (creditsToAdd > 0) {
        try {
          await addCreditTransaction(userId, creditsToAdd, 'stripe_payment', {
            stripe_session_id: session.id,
            description: `Purchased ${creditsPackage} package`,
          });
          console.log(`✅ [TEST] Added ${creditsToAdd} credits to user ${userId} from ${creditsPackage} purchase`);

          // ===== NEW: Send confirmation email (TEST) =====
          try {
            const { data: userData } = await supabase.auth.admin.getUserById(userId);
            const userEmail = userData?.user?.email;

            if (userEmail) {
              console.log(`📧 [TEST] Sending confirmation email to ${userEmail}...`);
              const emailSent = await sendPaymentConfirmation(
                userEmail,
                session.amount_total || (creditsPackage === 'starter' ? 999 : creditsPackage === 'pro' ? 3999 : 11999),
                creditsToAdd,
                creditsPackage
              );

              if (emailSent) {
                console.log(`✅ [TEST] Confirmation email sent to ${userEmail}`);
              } else {
                console.warn(`⚠️ [TEST] Email send failed for ${userEmail}`);
              }
            }
          } catch (emailError) {
            console.error('❌ [TEST] Email error:', emailError.message);
          }
          // ===== END: Email integration (TEST) =====
        } catch (updateError) {
          console.error('Error updating credits:', updateError);
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Test webhook error:', error);
    res.status(400).json({ error: 'Test webhook processing failed' });
  }
});

/**
 * GET /api/user/credits/history
 * Get user's credit transaction history
 * Requires: Authorization Bearer token
 */
app.get('/api/user/credits/history', verifyJWT, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    console.log(`📋 Fetching credit history for user: ${req.user.id} (limit: ${limit})`);
    const history = await getCreditHistory(req.user.id, limit);
    console.log(`✅ History fetched: ${history.length} entries`);
    res.json(history);
  } catch (error) {
    console.error('❌ History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch history', details: error.message });
  }
});


/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events (payment success, etc)
 */
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    if (!sig) {
      return res.status(400).json({ error: 'Missing stripe signature' });
    }

    const { stripe } = await import('./api/stripe.ts');
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    // Handle specific events
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.client_reference_id;
      
      if (!userId) {
        return res.status(400).json({ error: 'Missing userId in session' });
      }

      // Get credits amount from metadata
      const creditsPackage = session.metadata?.creditsPackage;
      let creditsToAdd = 0;

      if (creditsPackage === 'starter') {
        creditsToAdd = 100;
      } else if (creditsPackage === 'pro') {
        creditsToAdd = 500;
      } else if (creditsPackage === 'enterprise') {
        creditsToAdd = 2000;
      }

      if (creditsToAdd > 0) {
        try {
          await addCreditTransaction(userId, creditsToAdd, 'stripe_payment', {
            stripe_session_id: session.id,
            description: `Purchased ${creditsPackage} package`,
          });
          console.log(`✅ Added ${creditsToAdd} credits to user ${userId} from ${creditsPackage} purchase`);

          // ===== NEW: Send confirmation email =====
          try {
            // Get user email from Supabase Auth
            const { data: userData } = await supabase.auth.admin.getUserById(userId);
            const userEmail = userData?.user?.email;

            if (userEmail) {
              console.log(`📧 Sending confirmation email to ${userEmail}...`);
              const emailSent = await sendPaymentConfirmation(
                userEmail,
                session.amount_total,
                creditsToAdd,
                creditsPackage
              );

              if (emailSent) {
                console.log(`✅ Confirmation email sent to ${userEmail}`);
              } else {
                console.warn(`⚠️ Email send failed for ${userEmail} (but credits were added)`);
              }
            } else {
              console.warn('⚠️ No user email found for sending confirmation');
            }
          } catch (emailError) {
            console.error('❌ Email service error:', emailError.message);
            // Don't fail the webhook if email fails - credits are already added
          }
          // ===== END: Email integration =====
        } catch (updateError) {
          console.error('Error updating credits:', updateError);
          // Still return 200 to Stripe so it doesn't retry
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

/**
 * Metrics Endpoints - Dashboard data
 */
app.get('/api/metrics/summary', verifyJWT, async (req, res) => {
  await metricsHandler(req, res, supabase);
});

app.get('/api/metrics/timeline', verifyJWT, async (req, res) => {
  await timelineHandler(req, res, supabase);
});

app.get('/api/metrics/providers', verifyJWT, async (req, res) => {
  await providersHandler(req, res, supabase);
});

/**
 * Analytics Endpoints
 */
app.post('/api/analytics/track', verifyJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventName, eventType, data, sessionId } = req.body;

    const { data: result, error } = await supabase
      .from('analytics_events')
      .insert([
        {
          user_id: userId,
          event_name: eventName,
          event_type: eventType,
          data: data || {},
          session_id: sessionId,
          metadata: data?.metadata || {},
          timestamp: new Date().toISOString(),
        },
      ]);

    if (error) throw error;

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/analytics/summary', verifyJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 30;

    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    // Aggregate stats
    const stats = {
      totalEvents: data?.length || 0,
      pageViews: data?.filter(e => e.event_type === 'page_view').length || 0,
      interactions: data?.filter(e => e.event_type === 'interaction').length || 0,
      generations: data?.filter(e => e.event_type === 'generation').length || 0,
      errors: data?.filter(e => e.event_type === 'error').length || 0,
      conversions: data?.filter(e => e.event_type === 'conversion').length || 0,
    };

    // Calculate conversion rate
    stats.conversionRate = stats.pageViews > 0 ? (stats.conversions / stats.pageViews) * 100 : 0;

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// ========================
// HELPER: GET API KEY BY PROVIDER
// ========================
function getProviderApiKey(provider) {
  switch (provider) {
    case 'anthropic':
      return process.env.ANTHROPIC_API_KEY;
    case 'gemini':
      return process.env.GOOGLE_API_KEY;
    case 'llama':
      return process.env.TOGETHER_API_KEY;
    case 'openai':
      return process.env.OPENAI_API_KEY;
    default:
      return null;
  }
}

// ========================
// START SERVER
// ========================
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🚀 VibeCoder API Server (PRODUCTION)  ║
╚════════════════════════════════════════╝

✅ Port: ${PORT}
✅ CORS: ${ALLOWED_ORIGINS.filter(Boolean).join(', ')}
✅ Rate Limiting: Enabled
✅ Input Validation: Enabled
✅ Security Headers: Enabled

Endpoints:
  • GET  /api/health          - Health check
  • GET  /api/config          - Safe configuration
  • POST /api/generate        - Code generation (10 req/min)
  • POST /api/ai/inline-edit  - Code editing (100 req/15min)

Docs: https://github.com/vibecoder/api-docs
  `);
});
