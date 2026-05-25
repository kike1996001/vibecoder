import { GoogleGenerativeAI } from '@google/generative-ai';
import { IProvider, ProviderResponse } from './types.js';

export class GeminiProvider implements IProvider {
  name: 'gemini' = 'gemini';
  private client: GoogleGenerativeAI;
  private model: string = 'gemini-2.0-flash';

  constructor(apiKey?: string) {
    this.client = new GoogleGenerativeAI(apiKey || process.env.GOOGLE_API_KEY);
  }

  isConfigured(): boolean {
    return !!process.env.GOOGLE_API_KEY;
  }

  async generate(prompt: string, systemPrompt: string, onStream: (text: string) => void): Promise<ProviderResponse> {
    return this.callGeminiAPI(prompt, systemPrompt, onStream);
  }

  async refine(prompt: string, currentFiles: any[], systemPrompt: string, onStream: (text: string) => void): Promise<ProviderResponse> {
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

  private async callGeminiAPI(userPrompt: string, systemPrompt: string, onStream: (text: string) => void): Promise<ProviderResponse> {
    const model = this.client.getGenerativeModel({
      model: this.model,
      systemInstruction: systemPrompt,
    });

    let fullResponse = '';

    const stream = await model.generateContentStream(userPrompt);

    for await (const chunk of stream.stream) {
      const text = chunk.text();
      fullResponse += text;
      onStream(fullResponse);
    }

    const result = this.extractJson(fullResponse);
    return result as ProviderResponse;
  }

  private extractJson(rawText: string): ProviderResponse {
    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error('No valid JSON found in response');
    }
    return JSON.parse(match[0]);
  }
}
