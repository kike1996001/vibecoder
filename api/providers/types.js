// Type definitions as commented interfaces for reference
// ProviderType: 'anthropic' | 'gemini' | 'llama' | 'openai'
// 
// ProviderConfig: {
//   apiKey: string,
//   model: string,
//   maxTokens: number
// }
//
// ProviderResponse: {
//   title: string,
//   description: string,
//   files: Array<{ path, content, language }>,
//   dependencies: Record<string, string>,
//   devDependencies: Record<string, string>,
//   designTokens: any
// }
//
// ProviderMessage: {
//   role: 'user' | 'assistant',
//   content: string
// }
//
// IProvider: {
//   name: ProviderType,
//   isConfigured(): boolean,
//   generate(prompt, systemPrompt, onStream): Promise<ProviderResponse>,
//   refine(prompt, currentFiles, systemPrompt, onStream): Promise<ProviderResponse>
// }

export const PROVIDER_TYPES = ['anthropic', 'gemini', 'llama', 'openai'];
