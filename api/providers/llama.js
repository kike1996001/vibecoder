// Llama provider via Together API
// Note: Requires TOGETHER_API_KEY environment variable

export class LlamaProvider {
  constructor(apiKey) {
    this.name = 'llama';
    this.model = 'meta-llama/Llama-3-70b-chat-hf';
    this.apiKey = apiKey || process.env.TOGETHER_API_KEY;
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
    if (!this.apiKey) {
      throw new Error('Together API key not configured');
    }

    try {
      let fullResponse = '';

      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 16384,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Together API error: ${response.statusText}`);
      }

      const data = await response.json();
      fullResponse = data.choices?.[0]?.message?.content || '';
      onStream(fullResponse);

      const result = this.extractJson(fullResponse);
      return result;
    } catch (error) {
      console.error('Together API call failed:', error);
      throw error;
    }
  }

  extractJson(rawText) {
    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error('No valid JSON found in response');
    }
    return JSON.parse(match[0]);
  }
}
