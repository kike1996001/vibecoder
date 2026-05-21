export type ProviderType = 'anthropic' | 'gemini' | 'llama' | 'openai';

export interface ProviderConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
}

export interface ProviderResponse {
  title: string;
  description: string;
  files: Array<{
    path: string;
    content: string;
    language: string;
  }>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  designTokens: any;
}

export interface ProviderMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface IProvider {
  name: ProviderType;
  isConfigured(): boolean;
  generate(prompt: string, systemPrompt: string, onStream: (text: string) => void): Promise<ProviderResponse>;
  refine(prompt: string, currentFiles: any[], systemPrompt: string, onStream: (text: string) => void): Promise<ProviderResponse>;
}
