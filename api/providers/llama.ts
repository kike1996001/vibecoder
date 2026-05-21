import { IProvider, ProviderResponse } from './types';

export class LlamaProvider implements IProvider {
  name: 'llama' = 'llama';
  private apiKey: string;
  private model: string = 'meta-llama/Llama-2-70b-chat-hf';
  private endpoint: string = 'https://api.together.xyz/inference';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.TOGETHER_API_KEY || '';
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async generate(prompt: string, systemPrompt: string, onStream: (text: string) => void): Promise<ProviderResponse> {
    return this.callLlamaAPI(prompt, systemPrompt, onStream);
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

    return this.callLlamaAPI(refinedPrompt, systemPrompt, onStream);
  }

  private async callLlamaAPI(userPrompt: string, systemPrompt: string, onStream: (text: string) => void): Promise<ProviderResponse> {
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 16384,
        prompt: fullPrompt,
        temperature: 0.7,
        top_p: 0.9,
        stop: ['<|im_end|>'],
      }),
    });

    if (!response.ok) {
      throw new Error(`Llama API error: ${response.statusText}`);
    }

    const data = await response.json();
    const fullResponse = data.output?.choices?.[0]?.text || '';

    onStream(fullResponse);

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
