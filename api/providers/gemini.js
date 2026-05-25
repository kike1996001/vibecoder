import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiProvider {
  constructor(apiKey) {
    this.name = 'gemini';
    this.model = 'gemini-pro';
    this.client = new GoogleGenerativeAI(apiKey || process.env.GOOGLE_API_KEY);
  }

  isConfigured() {
    return !!process.env.GOOGLE_API_KEY;
  }

  async generate(prompt, systemPrompt, onStream) {
    return this.callGeminiAPI(prompt, systemPrompt, onStream);
  }

  async refine(prompt, currentFiles, systemPrompt, onStream) {
    const filesContext = currentFiles
      .map((file) => `### ${file.path}\n\`\`\`${file.language}\n${file.content}\n\`\`\``)
      .join('\n\n');

    const refinedPrompt = `You are refining an existing application.

## CURRENT APPLICATION:
${filesContext}

## REFINEMENT REQUEST:
${prompt}

## INSTRUCTIONS:
- Return COMPLETE updated files
- Maintain existing functionality unless explicitly changed
- Keep all imports and dependencies
- Improve code quality if possible
- Make incremental, focused improvements
- Return ONLY modified or new files
- Ensure app remains fully functional

Return valid JSON with "files" array containing only changed/new files.`;

    return this.callGeminiAPI(refinedPrompt, systemPrompt, onStream);
  }

  async callGeminiAPI(userPrompt, systemPrompt, onStream) {
    const model = this.client.getGenerativeModel({ model: this.model });
    let fullResponse = '';

    const result = await model.generateContentStream([
      { text: `${systemPrompt}\n\n${userPrompt}` },
    ]);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      fullResponse += text;
      onStream(fullResponse);
    }

    const parsed = this.extractJson(fullResponse);
    return parsed;
  }

  extractJson(rawText) {
    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error('No valid JSON found in response');
    }
    return JSON.parse(match[0]);
  }
}
