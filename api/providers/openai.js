import OpenAI from 'openai';

export class OpenAIProvider {
  constructor(apiKey) {
    this.name = 'openai';
    this.model = 'gpt-4-turbo';
    this.client = new OpenAI({ apiKey: apiKey || process.env.OPENAI_API_KEY });
  }

  isConfigured() {
    return !!process.env.OPENAI_API_KEY;
  }

  async generate(prompt, systemPrompt, onStream) {
    return this.callOpenAIAPI(prompt, systemPrompt, onStream);
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

    return this.callOpenAIAPI(refinedPrompt, systemPrompt, onStream);
  }

  async callOpenAIAPI(userPrompt, systemPrompt, onStream) {
    let fullResponse = '';

    const stream = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: 16384,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk?.choices?.[0]?.delta;
      if (delta?.content) {
        fullResponse += delta.content;
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
