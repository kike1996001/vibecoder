import 'dotenv/config';
import { z } from 'zod';
import { ProviderFactory } from './providers/factory.ts';
import { 
  supabase, 
  hasEnoughCredits, 
  addCreditTransaction, 
  getUserBalance 
} from './supabaseClient.js';
import { calculateCreditsNeeded } from './creditCalculator.js';
import { getStatusMessage, createStatusUpdateEvent } from './statusMessageService.js';
import { optimizePrompt, getImprovementsSummary } from './promptOptimizer.js';
import { formatDesignAnswersForGeneration, logDesignAnswers } from './designAnswerFormatter.js';

// ========================
// SCHEMA VALIDATION
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

// ========================
// HELPER FUNCTIONS
// ========================
function sendEvent(writer, obj) {
  writer.write(`data: ${JSON.stringify(obj)}\n\n`);
}

function getProviderApiKey(provider) {
  const keys = {
    anthropic: process.env.ANTHROPIC_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    gemini: process.env.GOOGLE_API_KEY,
    llama: process.env.TOGETHER_API_KEY,
  };
  return keys[provider];
}

// ========================
// VERCEL FUNCTION: /api/generate
// ========================
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse and validate request
    const validated = GenerateRequestSchema.parse(req.body);
    
    const provider = validated.provider || 'anthropic';
    const template = validated.template || 'landing';
    const appType = validated.appType || 'web';
    const designAnswers = validated.designAnswers;

    // For development/testing - allow missing auth
    let userId = null;
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
          userId = payload.sub;
        }
      } catch (err) {
        console.warn('Token parsing failed:', err);
      }
    }

    // ✨ OPTIMIZE THE PROMPT
    const optimizationResult = optimizePrompt(validated.prompt);
    const improvementsSummary = getImprovementsSummary(optimizationResult);
    console.log(`[Optimize] Prompt optimized with ${optimizationResult.improvements.length} improvements`);

    // 🎨 ENHANCE PROMPT WITH DESIGN SYSTEM
    let enhancedPrompt = optimizationResult.optimized;
    const designFormatted = formatDesignAnswersForGeneration(designAnswers);
    if (designFormatted) {
      enhancedPrompt += designFormatted;
      console.log(`[Design] Prompt enhanced with design system`);
    }

    validated.prompt = enhancedPrompt;

    // Calculate credits
    const creditsNeeded = calculateCreditsNeeded(template, provider, appType);
    
    // Check credits if userId available
    if (userId) {
      const hasCredits = await hasEnoughCredits(userId, creditsNeeded);
      if (!hasCredits) {
        const balance = await getUserBalance(userId);
        return res.status(402).json({
          error: 'Insufficient credits',
          required: creditsNeeded,
          available: balance,
        });
      }
    }

    // Set streaming headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Get provider and API key
    const providerService = ProviderFactory.getProvider(provider);
    const apiKey = getProviderApiKey(provider);

    if (!apiKey) {
      sendEvent(res, { 
        error: `${provider} API key not configured`,
        message: 'Provider not available'
      });
      return res.end();
    }

    let generationId = crypto.randomUUID?.() || Date.now().toString();
    let generationStartTime = Date.now();
    let statusIntervalId;

    try {
      // Send design system info
      if (designFormatted) {
        sendEvent(res, {
          type: 'design_system_applied',
          design: {
            colorPalette: designAnswers?.colorPalette?.name || null,
            typography: designAnswers?.typography?.name || null,
            layout: designAnswers?.layoutDirection?.name || null,
            direction: designAnswers?.designMockup?.name || null,
          },
          message: `Applying design system...`,
        });
      }

      // Initial status
      sendEvent(res, {
        type: 'status_update',
        message: '⚙️ Analyzing requirements...',
        progress: 5,
      });

      // Status updates every 1.5s
      statusIntervalId = setInterval(() => {
        const elapsedMs = Date.now() - generationStartTime;
        const statusEvent = createStatusUpdateEvent(elapsedMs, designAnswers);
        sendEvent(res, statusEvent);
      }, 1500);

      // Generate with provider
      await providerService.generate(validated, apiKey, (chunk) => {
        sendEvent(res, { chunk });
      });

      // Clear interval
      if (statusIntervalId) clearInterval(statusIntervalId);

      // Final status
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

      // Send optimizations
      if (improvementsSummary.hasImprovements) {
        sendEvent(res, {
          type: 'prompt_optimized',
          improvements: improvementsSummary.summary,
          count: improvementsSummary.count,
        });
      }

      // Deduct credits if userId available
      if (userId) {
        try {
          const newBalance = await addCreditTransaction(userId, -creditsNeeded, 'generation', {
            generation_id: generationId,
            description: `Generated ${template} app with ${provider}`,
          });
          
          console.log(`✅ Credits deducted from ${userId}, new balance: ${newBalance}`);
          sendEvent(res, { 
            type: 'credits_deducted',
            creditsDeducted: creditsNeeded, 
            newBalance,
          });
        } catch (creditError) {
          console.error('Credit error:', creditError);
          sendEvent(res, { 
            type: 'credits_deduction_error',
            error: 'Failed to deduct credits',
          });
        }
      }

    } catch (generationError) {
      if (statusIntervalId) clearInterval(statusIntervalId);
      console.error('Generation error:', generationError);
      sendEvent(res, { 
        type: 'generation_error',
        error: generationError.message || 'Generation failed',
        message: 'Failed to generate app. Please try again.',
      });
    }

    res.end();

  } catch (error) {
    console.error('Handler error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Generation failed' 
    });
  }
}
