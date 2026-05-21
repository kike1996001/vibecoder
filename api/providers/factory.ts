import { IProvider, ProviderType } from './types';
import { AnthropicProvider } from './anthropic';
import { GeminiProvider } from './gemini';
import { LlamaProvider } from './llama';

export class ProviderFactory {
  private static providers: Map<ProviderType, IProvider> = new Map();

  static initialize() {
    this.providers.set('anthropic', new AnthropicProvider());
    this.providers.set('gemini', new GeminiProvider());
    this.providers.set('llama', new LlamaProvider());
  }

  static getProvider(name: ProviderType): IProvider {
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

  static getAvailableProviders(): ProviderType[] {
    if (this.providers.size === 0) {
      this.initialize();
    }

    const available: ProviderType[] = [];

    if (process.env.ANTHROPIC_API_KEY) available.push('anthropic');
    if (process.env.GOOGLE_API_KEY) available.push('gemini');
    if (process.env.TOGETHER_API_KEY) available.push('llama');

    return available;
  }

  static getDefaultProvider(): ProviderType {
    const available = this.getAvailableProviders();
    if (available.length === 0) {
      throw new Error('No providers configured');
    }
    // Prioridad: Claude > Gemini > Llama
    if (available.includes('anthropic')) return 'anthropic';
    if (available.includes('gemini')) return 'gemini';
    return available[0];
  }
}
