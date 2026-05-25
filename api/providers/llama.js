import Together from 'together-ai';

export class LlamaProvider {
  constructor(apiKey) {
    this.name = 'llama';
    this.model = 'meta-llama/Llama-3-70b-chat-hf';
    this.client = new Together({ apiKey: apiKey || process.env.TOGETHER_API_KEY });
  }

  isConfigured() {
    return !!process.env.TOGETHER_API_KEY;
  }

  async generate(prompt, systemPrompt, onStream) {
    return this.callTogetherAPI(prompt, systemPrompt, onStream);
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

    return this.callTogetherAPI(refinedPrompt, systemPrompt, onStream);
  }

  async callTogetherAPI(userPrompt, systemPrompt, onStream) {
    let fullResponse = '';

    const stream = await this.client.messages.stream({
      model: this.model,
      max_tokens: 16384,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    for await (const chunk of stream) {
      if (chunk.choices?.[0]?.delta?.content) {
        fullResponse += chunk.choices[0].delta.content;
        onStream(fullResponse);
      }
    }

    const result = this.extractJson(fullResponse);
    return result;
  }

  extractJson(rawText) {
    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error('No valid JSON found in response');
    }
    return JSON.parse(match[0]);
  }
}
