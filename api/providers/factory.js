import { AnthropicProvider } from './anthropic.js';
import { GeminiProvider } from './gemini.js';
import { LlamaProvider } from './llama.js';
import { OpenAIProvider } from './openai.js';

export class ProviderFactory {
  static providers = new Map();

  static initialize() {
    this.providers.set('anthropic', new AnthropicProvider());
    this.providers.set('gemini', new GeminiProvider());
    this.providers.set('llama', new LlamaProvider());
    this.providers.set('openai', new OpenAIProvider());
  }

  static getProvider(name) {
    if (!this.providers.has(name)) {
      this.initialize();
    }

    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider ${name} not found`);
    }

    if (!provider.isConfigured()) {
      throw new Error(`Provider ${name} is not configured. Missing API key.`);
    }

    return provider;
  }

  static getAvailableProviders() {
    if (this.providers.size === 0) {
      this.initialize();
    }

    const available = [];

    if (process.env.ANTHROPIC_API_KEY) available.push('anthropic');
    if (process.env.GOOGLE_API_KEY) available.push('gemini');
    if (process.env.TOGETHER_API_KEY) available.push('llama');
    if (process.env.OPENAI_API_KEY) available.push('openai');

    return available;
  }

  static getDefaultProvider() {
    const available = this.getAvailableProviders();
    if (available.length === 0) {
      throw new Error('No providers configured');
    }
    // Priority: Claude > Gemini > Llama
    if (available.includes('anthropic')) return 'anthropic';
    if (available.includes('gemini')) return 'gemini';
    return available[0];
  }
}
