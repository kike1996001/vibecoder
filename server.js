import 'dotenv/config';
import express from 'express';

// Railway sets PORT environment variable, fallback to API_PORT or 5178
const PORT = process.env.PORT || process.env.API_PORT || 5178;
const app = express();

// Minimal middleware
app.use(express.json());

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simple providers endpoint
app.get('/api/providers', (req, res) => {
  res.json({
    available: ['anthropic', 'openai'],
    default: 'anthropic'
  });
});

// Simple config endpoint
app.get('/api/config', (req, res) => {
  res.json({
    providers: ['anthropic', 'gemini', 'llama', 'openai'],
    templates: ['landing', 'saas', 'ecommerce', 'admin'],
    platforms: ['web', 'mobile'],
  });
});

// Start server
console.log('[STARTUP] Starting server on port', PORT);
app.listen(PORT, () => {
  console.log('[STARTUP] ✅ Server running on port', PORT);
  setInterval(() => {
    console.log('[ALIVE]', new Date().toISOString());
  }, 30000);
});

// Graceful shutdown
process.on('SIGTERM', () => console.log('[SHUTDOWN] SIGTERM'));
process.on('SIGINT', () => console.log('[SHUTDOWN] SIGINT'));
process.on('uncaughtException', (err) => console.error('[ERROR] Uncaught:', err));
process.on('unhandledRejection', (err) => console.error('[ERROR] Unhandled:', err));
