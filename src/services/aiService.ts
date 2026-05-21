const API_URL = import.meta.env.VITE_API_URL || '/api';

export const BACKEND_API = API_URL;

export type LLMProvider = 'anthropic' | 'gemini' | 'llama' | 'openai';

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
    border: string;
  };
  typography: {
    heading: string;
    body: string;
    mono: string;
    scale: number[];
  };
  spacing: {
    unit: number;
    scale: number[];
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

export interface GenerationResponse {
  title: string;
  description: string;
  files: GeneratedFile[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  designTokens: DesignTokens;
}

export interface AIRequestOptions {
  provider?: string;
  model?: string;
  template?: 'landing' | 'saas' | 'ecommerce' | 'admin';
  appType?: 'web' | 'mobile';
  authToken?: string;  // ✅ NEW: JWT token
}

async function streamResponse(
  response: Response,
  onStream: (text: string) => void,
  onEvent?: (eventType: string, data: any) => void
): Promise<GenerationResponse> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body available');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let result: GenerationResponse | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed.startsWith('data:')) continue;

      try {
        const data = JSON.parse(trimmed.slice(5).trim());
        
        // Handle text chunks for code generation
        if (data.chunk) {
          onStream(data.chunk);
        }

        // Handle special events (credits_deducted, generation_error, etc.)
        if (data.event) {
          onEvent?.(data.event, data);
        }

        if (data.error) {
          throw new Error(data.error);
        }

        if (data.done && data.result) {
          result = data.result;
        }
      } catch (e) {
        // Continue on parse errors
      }
    }
  }

  if (!result) {
    throw new Error('No result received from the AI proxy');
  }

  return result;
}

export async function generateApp(
  prompt: string,
  onStream: (text: string) => void,
  options?: AIRequestOptions & { onEvent?: (eventType: string, data: any) => void }
): Promise<GenerationResponse> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  
  // Add auth token if provided
  if (options?.authToken) {
    headers['Authorization'] = `Bearer ${options.authToken}`;
  }

  const response = await fetch(`${API_URL}/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      prompt,
      type: 'generate',
      template: options?.template,
      provider: options?.provider || 'anthropic',
      model: options?.model,
      appType: options?.appType || 'web',
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  return streamResponse(response, onStream, options?.onEvent);
}

export async function refineApp(
  prompt: string,
  currentFiles: GeneratedFile[],
  onStream: (text: string) => void,
  options?: AIRequestOptions & { onEvent?: (eventType: string, data: any) => void }
): Promise<GenerationResponse> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  
  // Add auth token if provided
  if (options?.authToken) {
    headers['Authorization'] = `Bearer ${options.authToken}`;
  }

  const response = await fetch(`${API_URL}/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      prompt,
      type: 'refine',
      currentFiles,
      template: options?.template,
      provider: options?.provider || 'anthropic',
      model: options?.model,
      appType: options?.appType || 'web',
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  return streamResponse(response, onStream, options?.onEvent);
}

export const aiService = {
  generateApp,
  refineApp,
};
