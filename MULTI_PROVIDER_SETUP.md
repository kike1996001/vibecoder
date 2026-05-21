# Multi-Provider Setup Guide

## Environment Variables

Add these to your `.env.local` file to enable each provider:

```bash
# Claude 3.5 Sonnet (via Anthropic)
ANTHROPIC_API_KEY=sk-ant-...

# Google Gemini 2.0 Flash
GOOGLE_API_KEY=AIza...

# Meta Llama 2 (via Together API)
TOGETHER_API_KEY=...
```

## How to Get API Keys

### Anthropic (Claude)
1. Go to https://console.anthropic.com
2. Sign in and get your API key
3. Copy to ANTHROPIC_API_KEY

### Google (Gemini)
1. Go to https://ai.google.dev
2. Click "Get API Key"
3. Create/select a project
4. Copy the API key to GOOGLE_API_KEY

### Together (Llama)
1. Go to https://api.together.xyz
2. Sign up and generate API key
3. Copy to TOGETHER_API_KEY

## Usage

### In Home Page
- Select your preferred provider from the dropdown (bottom right of input)
- The provider selection is passed to Workspace

### In Workspace
- Provider is automatically used for all generation/refinement
- Switch by going back to Home and selecting a different one

## Available Providers

| Provider | Model | Speed | Quality | Cost |
|----------|-------|-------|---------|------|
| **Claude** | 3.5 Sonnet | Slow | Excellent | $$ |
| **Gemini** | 2.0 Flash | Fast | Good | $ |
| **Llama** | Meta Llama 2 | Medium | Good | $ |

## Fallback Behavior

If a provider's API key is missing:
- The provider won't show in the selector
- ProviderFactory.getDefaultProvider() picks the first available one
- Priority: Anthropic > Gemini > Llama

## Debugging

Check which providers are available:
```bash
curl http://localhost:5173/api/providers
```

Response example:
```json
{
  "available": ["anthropic", "gemini"],
  "default": "anthropic"
}
```

## Stream Format

All providers stream responses in the same format:
```
data: {"chunk":"...accumulated response..."}

data: {"done":true,"result":{files:[...],dependencies:[...]}}
```

This ensures the UI treats all providers uniformly.
