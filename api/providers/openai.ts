import OpenAI from 'openai';
import { IProvider, ProviderResponse } from './types.ts';

export class OpenAIProvider implements IProvider {
  name: 'openai' = 'openai';
  private client: OpenAI;
  private model: string = 'gpt-4-turbo';

  constructor(apiKey?: string) {
    this.client = new OpenAI({ apiKey: apiKey || process.env.OPENAI_API_KEY });
  }

  isConfigured(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  async generate(prompt: string, systemPrompt: string, onStream: (text: string) => void): Promise<ProviderResponse> {
    return this.callOpenAIAPI(prompt, systemPrompt, onStream);
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

    return this.callOpenAIAPI(refinedPrompt, systemPrompt, onStream);
  }

  private async callOpenAIAPI(userPrompt: string, systemPrompt: string, onStream: (text: string) => void): Promise<ProviderResponse> {
    let fullResponse = '';

    const stream = await this.client.messages.create({
      model: this.model,
      max_tokens: 16384,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      stream: true,
    } as any);

    for await (const chunk of stream as any) {
      const delta = chunk?.delta;
      if (chunk.type === 'content_block_delta' && delta?.type === 'text') {
        fullResponse += delta.text;
        onStream(fullResponse);
      }
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
