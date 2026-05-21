import 'dotenv/config';
import http from 'http';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const PORT = process.env.API_PORT || 5178;
const AI_PROVIDER = (process.env.AI_PROVIDER || 'anthropic').toLowerCase();
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;"},{ 

const SYSTEM_PROMPT = `You are an expert full-stack developer and UI/UX designer. You generate complete, production-ready React applications using Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

CRITICAL RULES:
1. Generate ONLY valid, runnable code. No placeholders, no TODOs.
2. Use TypeScript strictly. No 'any' types.
3. Use Tailwind CSS for all styling. No inline styles.
4. Use shadcn/ui components when appropriate.
5. Create a complete Design System with tokens.
6. Generate responsive, accessible, beautiful code.
7. Use Framer Motion for animations.
8. Use Lucide React for icons.
9. The app MUST look premium — like a $50k agency built it.
`;

if (AI_PROVIDER === 'anthropic' && !ANTHROPIC_API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY environment variable.');
  process.exit(1);
}

if (AI_PROVIDER !== 'anthropic' && !OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY environment variable for GPT-4 provider.');
  process.exit(1);
}

const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJSON(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

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

function buildGeneratePrompt(prompt, type, currentFiles) {
  if (type === 'refine' && Array.isArray(currentFiles)) {
    const filesContext = currentFiles
      .map((file) => `### ${file.path}\n\`\`\`\n${file.content}\n\`\`\``)
      .join('\n\n');

    return `Current files:\n\n${filesContext}\n\nChanges: ${prompt}\n\nReturn COMPLETE updated files.`;
  }

  return `Create a complete, production-ready web application for: ${prompt}\n\nGenerate ALL necessary files. Make it ABSOLUTELY STUNNING.`;
}

async function streamOpenAICompletion(messages, res, modelName = OPENAI_MODEL) {
  const completion = await openai.chat.completions.create({
    model: modelName,
    messages,
    stream: true,
  });

  let fullResponse = '';
  for await (const event of completion) {
    if (event.type === 'response.delta') {
      const text = event.delta?.content ?? '';
      fullResponse += text;
      sendEvent(res, { chunk: fullResponse });
    }
    if (event.type === 'response.error') {
      throw new Error(event.error?.message || 'OpenAI stream error');
    }
  }

  return fullResponse;
}

async function handleGenerate(req, res) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
  }

  const payload = JSON.parse(body || '{}');
  const prompt = payload.prompt || '';
  const type = payload.type || 'generate';
  const currentFiles = Array.isArray(payload.currentFiles) ? payload.currentFiles : undefined;
  const provider = (payload.provider || AI_PROVIDER).toLowerCase();
  const requestedModel = payload.model || OPENAI_MODEL;
  const anthropicModel = payload.anthropicModel || 'claude-3-5-sonnet-20241022';
  const geminiModel = payload.geminiModel || 'gemini-2.5-pro-preview-05-06';
  const userContent = buildGeneratePrompt(prompt, type, currentFiles);

  let fullResponse = '';
  if (provider === 'anthropic') {
    if (!anthropic) {
      throw new Error('Anthropic API key is not configured.');
    }

    const stream = await anthropic.messages.create({
      model: anthropicModel,
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk?.delta;
      if (chunk.type === 'content_block_delta' && delta?.type === 'text') {
        fullResponse += delta.text;
        sendEvent(res, { chunk: fullResponse });
      }
    }
  } else if (provider === 'gemini') {
    if (!GEMINI_API_KEY) {
      throw new Error('Missing GEMINI_API_KEY environment variable.');
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const client = new GoogleGenerativeAI({ apiKey: GEMINI_API_KEY });
    const model = client.getGenerativeModel({ model: geminiModel });
    const chat = model.startChat();
    const response = await chat.sendMessageStream({
      content: userContent,
      conversation: [],
    });

    for await (const event of response) {
      if (event.type === 'message') {
        fullResponse += event.message?.content?.[0]?.text || '';
        sendEvent(res, { chunk: fullResponse });
      }
    }
  } else {
    if (!openai) {
      throw new Error('OpenAI API key is not configured.');
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userContent },
    ];
    fullResponse = await streamOpenAICompletion(messages, res, requestedModel);
  }

  const result = extractJson(fullResponse);
  sendEvent(res, { done: true, result });
  res.end();
}

async function handleInlineEdit(req, res) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
  }

  const payload = JSON.parse(body || '{}');
  const selectedText = payload.selectedText || '';
  const instruction = payload.instruction || '';
  const filePath = payload.filePath || '';

  const systemPrompt = `You are a helpful code editor assistant. The user will provide a selected code fragment and an instruction. Return ONLY the modified code fragment, with no surrounding commentary or markdown.`;
  const userContent = `File: ${filePath}\nInstruction: ${instruction}\nSelected code:\n\n${selectedText}`;

  let fullResponse = '';

  if (AI_PROVIDER === 'anthropic') {
    const stream = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk?.delta;
      if (chunk.type === 'content_block_delta' && delta?.type === 'text') {
        fullResponse += delta.text;
      }
    }
  } else {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ];
    fullResponse = await streamOpenAICompletion(messages, res);
  }

  const modified = fullResponse.replace(/```(json|tsx?|jsx?)?/g, '').replace(/```/g, '').trim();
  sendJSON(res, 200, { modified });
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/api/generate' && req.method === 'POST') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    try {
      await handleGenerate(req, res);
    } catch (error) {
      sendEvent(res, { error: error instanceof Error ? error.message : 'Internal server error' });
      res.end();
    }
    return;
  }

  if (req.url === '/api/ai/inline-edit' && req.method === 'POST') {
    try {
      await handleInlineEdit(req, res);
    } catch (error) {
      sendJSON(res, 500, { error: error instanceof Error ? error.message : 'Internal server error' });
    }
    return;
  }

  sendJSON(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
  console.log('Endpoints: POST /api/generate and POST /api/ai/inline-edit');
});
