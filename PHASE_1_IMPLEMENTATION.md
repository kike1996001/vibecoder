# 📋 FASE 1: PLAN DE IMPLEMENTACIÓN DETALLADO
## Dashboard Empresarial + Logging + Validation (1-2 semanas)

---

## 🎯 OBJETIVO PRINCIPAL
Convertir VibeCoder de una "herramienta pastime" a una **plataforma empresarial seria** con:
- Visibilidad total de uso y ROI
- Manejo robusto de errores
- Seguridad mejorada
- UX profesional

---

## 📌 TAREA 1.1: Dashboard de Métricas
**Responsable**: Frontend  
**Tiempo**: 3-4 días  
**Impacto**: Alto (users ven valor de suscripción)

### 1.1.1 Backend Endpoints
```typescript
// GET /api/metrics/summary
// Response:
{
  userId: string;
  period: 'today' | 'month' | 'year';
  metrics: {
    totalGenerations: number;
    totalCreditsUsed: number;
    totalCreditsSpent: number;        // $ value
    averageGenerationTime: number;    // seconds
    successRate: number;              // percentage
    costPerGeneration: number;        // average
    creditsRemaining: number;
    nextRefillDate?: string;
  };
  breakdown: {
    byTemplate: Record<string, number>;
    byProvider: Record<string, number>;
    byAppType: Record<string, number>;
  };
  timeline: Array<{
    date: string;                     // YYYY-MM-DD
    count: number;                    // generations that day
    credits: number;
  }>;
}
```

**Implementation**:
```typescript
// api/metrics.ts
export async function getMetricsSummary(userId: string, period: 'today' | 'month' | 'year') {
  // 1. Query credit_ledger table
  const ledger = await supabase
    .from('credit_ledger')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', getDateRange(period))
    .order('created_at', { ascending: false });

  // 2. Calculate aggregates
  const totalUsed = ledger
    .filter(l => l.source === 'generation')
    .reduce((sum, l) => sum + Math.abs(l.amount), 0);

  // 3. Get current balance
  const balance = await getUserBalance(userId);

  // 4. Return metrics object
  return {
    totalGenerations: ledger.filter(l => l.source === 'generation').length,
    totalCreditsUsed: totalUsed,
    // ... more calculations
  };
}
```

**Frontend Components**:
```typescript
// src/pages/Dashboard.tsx - New file
- StatsCard (shows 4 main metrics with icons)
- TimelineChart (Recharts line chart)
- BreakdownCards (template, provider, appType distribution)
- ROICalculator (what's the $ value you got?)
- QuickActions (generate, buy credits, view history)
```

---

## 📌 TAREA 1.2: Error Tracking & Logging
**Responsable**: Backend  
**Tiempo**: 2-3 días  
**Impacto**: Alto (understand failures, improve reliability)

### 1.2.1 Database Schema
```sql
-- Create error_logs table
CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES user_credits(user_id),
  error_type TEXT NOT NULL,     -- 'timeout', 'api_error', 'invalid_input', etc
  error_message TEXT NOT NULL,
  error_stack TEXT,
  
  -- Context
  provider TEXT,                 -- which AI provider
  template TEXT,
  app_type TEXT,
  prompt_length INT,
  
  -- Performance
  response_time_ms INT,
  
  -- Request ID for debugging
  request_id TEXT UNIQUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX(user_id, created_at),
  INDEX(error_type, created_at)
);

-- Create error_stats for aggregates (faster queries)
CREATE TABLE error_stats (
  date DATE PRIMARY KEY,
  total_errors INT,
  error_rate_percent FLOAT,        -- total errors / total requests
  most_common_error TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 1.2.2 Backend Logging
```typescript
// api/errorLogger.ts - New file
export async function logError(error: Error, context: {
  userId?: string;
  provider?: string;
  template?: string;
  appType?: string;
  promptLength?: number;
  responseTimeMs?: number;
  requestId?: string;
}) {
  const errorLog = {
    error_type: classifyError(error),
    error_message: error.message,
    error_stack: error.stack,
    ...context,
  };

  await supabase.from('error_logs').insert([errorLog]);

  // Also log to console for debugging
  console.error('[Error]', {
    requestId: context.requestId,
    message: error.message,
    ...context,
  });

  // Send alert if error rate is high
  const errorStats = await getErrorStatsToday();
  if (errorStats.error_rate > 5) {
    await sendAdminAlert(`Error rate too high: ${errorStats.error_rate}%`);
  }
}

function classifyError(error: Error): string {
  if (error.message.includes('timeout')) return 'timeout';
  if (error.message.includes('API')) return 'api_error';
  if (error.message.includes('invalid')) return 'invalid_input';
  if (error.message.includes('rate')) return 'rate_limit';
  if (error.message.includes('credits')) return 'insufficient_credits';
  return 'unknown';
}
```

### 1.2.3 Integration
```typescript
// Update server.js - wrap all routes with error logging
app.post('/api/generate', generateLimiter, verifyJWT, async (req, res) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  const startTime = Date.now();
  
  try {
    // ... existing logic
  } catch (error) {
    await logError(error, {
      userId: req.user?.id,
      provider: req.body.provider,
      template: req.body.template,
      appType: req.body.appType,
      promptLength: req.body.prompt?.length,
      responseTimeMs: Date.now() - startTime,
      requestId,
    });
    
    res.status(500).json({ error: error.message, requestId });
  }
});
```

### 1.2.4 Admin Dashboard
```typescript
// src/pages/AdminDashboard.tsx - New file (protected route)
- ErrorsChart (timeline of errors)
- TopErrors (most common errors)
- ErrorDetail (click to see full stack)
- ErrorRate (% of failed requests)
- UserErrorCount (which users have most errors)
```

---

## 📌 TAREA 1.3: Input Validation & Sanitization
**Responsable**: Backend  
**Tiempo**: 1-2 días  
**Impacto**: Medium (security + UX)

### 1.3.1 Validation Schema
```typescript
// api/validation.ts - New file
import { z } from 'zod';

export const GenerateRequestSchema = z.object({
  prompt: z
    .string()
    .min(10, 'Prompt must be at least 10 characters')
    .max(5000, 'Prompt must be less than 5000 characters')
    .refine(
      (prompt) => !hasMaliciousPatterns(prompt),
      'Prompt contains suspicious patterns'
    ),
  
  provider: z
    .enum(['anthropic', 'openai', 'gemini', 'together', 'llama'])
    .default('anthropic'),
  
  template: z
    .enum(['landing', 'saas', 'ecommerce', 'admin'])
    .default('landing'),
  
  appType: z
    .enum(['web', 'mobile'])
    .default('web'),
});

function hasMaliciousPatterns(text: string): boolean {
  const maliciousPatterns = [
    /ALTER TABLE/i,
    /DROP TABLE/i,
    /DELETE FROM/i,
    /<script>/i,
    /javascript:/i,
    /onerror=/i,
    /onclick=/i,
  ];

  return maliciousPatterns.some(pattern => pattern.test(text));
}

export function sanitizePrompt(prompt: string): string {
  return prompt
    .trim()
    .replace(/\s+/g, ' ')  // Remove extra spaces
    .substring(0, 5000);   // Max length
}
```

### 1.3.2 Frontend Validation
```typescript
// src/hooks/usePromptValidation.ts - New file
export function usePromptValidation() {
  const validate = (prompt: string) => {
    const errors: string[] = [];

    if (prompt.length < 10) {
      errors.push('Prompt too short (min 10 chars)');
    }
    if (prompt.length > 5000) {
      errors.push('Prompt too long (max 5000 chars)');
    }
    if (prompt.trim().length === 0) {
      errors.push('Prompt cannot be empty');
    }

    return { valid: errors.length === 0, errors };
  };

  return { validate };
}

// Use in ChatPanel.tsx
const { validate } = usePromptValidation();
const { valid, errors } = validate(prompt);

if (!valid) {
  return (
    <div className="text-red-400 text-sm">
      {errors.map(e => <p key={e}>{e}</p>)}
    </div>
  );
}
```

---

## 📌 TAREA 1.4: Rate Limiting Mejorado
**Responsable**: Backend  
**Tiempo**: 1 día  
**Impacto**: Medium (protección + feedback)

### 1.4.1 Enhanced Rate Limiting
```typescript
// api/rateLimiter.ts - New file
import RedisStore from 'rate-limit-redis';  // or in-memory for now

export const generateLimiter = rateLimit({
  store: new MemoryStore(),  // TODO: upgrade to Redis in production
  
  // Per user: 10 requests per hour
  keyGenerator: (req) => req.user?.id || req.ip,
  skip: (req) => req.user?.tier === 'enterprise',  // Enterprise users unlimited
  
  max: (req) => {
    switch (req.user?.tier) {
      case 'free': return 3;           // 3 per hour
      case 'starter': return 20;
      case 'pro': return 100;
      case 'enterprise': return 0;     // unlimited
      default: return 3;
    }
  },
  
  windowMs: 60 * 60 * 1000,  // 1 hour
  message: 'Too many generations, please wait',
  
  handler: (req, res) => {
    const resetTime = req.rateLimit?.resetTime;
    res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: resetTime,
      upgradeUrl: '/billing',
    });
  },
  
  skip: (req) => req.path === '/health',  // Don't limit health checks
});

// Also add per-IP limit for security
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute
  max: 100,                  // 100 requests per minute per IP
  message: 'Too many requests, please slow down',
});
```

### 1.4.2 Response Headers
```typescript
// Middleware to add rate limit headers
app.use((req, res, next) => {
  const limit = req.rateLimit;
  
  res.set({
    'X-RateLimit-Limit': limit.limit,
    'X-RateLimit-Remaining': limit.current - 1,
    'X-RateLimit-Reset': new Date(limit.resetTime).toISOString(),
  });
  
  next();
});
```

### 1.4.3 Frontend Display
```typescript
// src/components/RateLimitIndicator.tsx - New file
export function RateLimitIndicator() {
  const [limit, setLimit] = useState(null);

  useEffect(() => {
    // Read from response headers
    const remaining = response.headers['x-ratelimit-remaining'];
    const total = response.headers['x-ratelimit-limit'];
    
    setLimit({ remaining: parseInt(remaining), total: parseInt(total) });
  }, []);

  if (!limit) return null;

  return (
    <div className="text-sm text-slate-400">
      <progress value={limit.remaining} max={limit.total} />
      {limit.remaining} / {limit.total} requests remaining
    </div>
  );
}
```

---

## 📌 TAREA 1.5: Analytics Tracking
**Responsable**: Frontend + Backend  
**Tiempo**: 2 días  
**Impact**: Medium (understand user behavior)

### 1.5.1 Events to Track
```typescript
interface AnalyticsEvent {
  eventName: string;
  userId: string;
  timestamp: string;
  properties: Record<string, any>;
}

// Events:
- 'app_generated' → { template, provider, appType, timeMs, success }
- 'credits_purchased' → { package, amount, price }
- 'dashboard_visited' → {}
- 'billing_page_viewed' → {}
- 'prompt_submitted' → { promptLength, template }
- 'generation_failed' → { errorType, provider }
- 'user_signed_up' → { source }
- 'user_logged_in' → {}
```

### 1.5.2 Tracking Implementation
```typescript
// src/services/analyticsService.ts - New file
export async function trackEvent(eventName: string, properties?: any) {
  const userId = await getCurrentUserId();
  
  const event = {
    eventName,
    userId,
    timestamp: new Date().toISOString(),
    properties,
  };

  // Send to backend
  await fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });

  // Also send to Mixpanel/Segment for external analytics
  if (window.mixpanel) {
    window.mixpanel.track(eventName, properties);
  }
}

// In components:
import { trackEvent } from '@/services/analyticsService';

export function ChatPanel() {
  const handleGenerate = async () => {
    const startTime = Date.now();
    
    try {
      await generateApp(prompt);
      
      trackEvent('app_generated', {
        template,
        provider,
        appType,
        timeMs: Date.now() - startTime,
        success: true,
      });
    } catch (error) {
      trackEvent('generation_failed', {
        errorType: error.type,
        provider,
        success: false,
      });
    }
  };
}
```

---

## 📌 TAREA 1.6: Feature Flags
**Responsable**: Backend  
**Tiempo**: 1 day  
**Impact**: Low (but enables safe rollouts)

```typescript
// api/featureFlags.ts - New file
export const FEATURE_FLAGS = {
  DASHBOARD_ANALYTICS: {
    enabled: true,
    rolloutPercent: 100,  // 100% of users get it
    whitelistedUsers: [],
  },
  ADVANCED_TEMPLATES: {
    enabled: true,
    rolloutPercent: 50,   // 50/50 A/B test
  },
  API_ACCESS: {
    enabled: false,       // Coming soon
    rolloutPercent: 10,   // Early access program
    whitelistedUsers: ['user123', 'user456'],
  },
};

export function isFeatureEnabled(featureName: string, userId: string): boolean {
  const flag = FEATURE_FLAGS[featureName];
  if (!flag?.enabled) return false;
  
  if (flag.whitelistedUsers?.includes(userId)) return true;
  
  const hashValue = hashUserId(userId) % 100;
  return hashValue < flag.rolloutPercent;
}

// Use in frontend:
{isFeatureEnabled('DASHBOARD_ANALYTICS', userId) && (
  <Dashboard />
)}
```

---

## 📊 IMPLEMENTATION TIMELINE

| Week | Task | Owner | Status |
|------|------|-------|--------|
| 1    | 1.1 Dashboard metrics (backend) | Backend | TODO |
| 1    | 1.2 Error logging (backend) | Backend | TODO |
| 1    | 1.3 Input validation | Backend | TODO |
| 1-2  | 1.1 Dashboard UI (frontend) | Frontend | TODO |
| 1-2  | 1.4 Rate limiting | Backend | TODO |
| 2    | 1.5 Analytics tracking | Full-stack | TODO |
| 2    | 1.6 Feature flags | Backend | TODO |
| 2    | Testing + Deployment | QA | TODO |

---

## ✅ Success Metrics

After PHASE 1 completion:
- [ ] Users see metrics dashboard
- [ ] 99%+ errors are logged with context
- [ ] Malicious prompts are blocked
- [ ] Rate limiting is enforced per tier
- [ ] Admin can see error trends
- [ ] Feature rollouts are safe
- [ ] User engagement is tracked

---

## 🚀 Next Steps

1. **THIS WEEK**: Choose which task to start first
2. **Decision**: Backend tasks first (metrics API) or Frontend (dashboard UI)?
3. **Resources**: Any need external API keys (Mixpanel, Sentry)?
4. **Deployment**: Plan staging environment for testing

