import { useToast } from '../components/ui/toast-notification';

export interface GenerationOptions {
  template: string;
  provider: string;
  appType: string;
}

export function useGeneration() {
  const { success, error, warning } = useToast();

  const generateApp = async (options: GenerationOptions, authToken: string) => {
    try {
      success('🚀 Starting app generation...');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Generation failed');
      }

      // Handle server-sent events
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let generationComplete = false;
      let creditsDeducted = false;
      let hasError = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.replace('data: ', ''));

            // Handle different event types
            if (data.type === 'generation_complete') {
              success('✅ App generated successfully!');
              generationComplete = true;
            } else if (data.type === 'credits_deducted') {
              success(`💳 ${data.creditsDeducted} credits deducted. Remaining: ${data.newBalance}`);
              creditsDeducted = true;
            } else if (data.type === 'generation_error') {
              error(`❌ Generation failed: ${data.message}`);
              hasError = true;
            } else if (data.type === 'credits_deduction_error') {
              warning(`⚠️ ${data.message}`);
            } else if (data.error) {
              error(`Error: ${data.error}`);
              hasError = true;
            } else if (data.chunk) {
              // Silently handle code chunks
              console.log('Generated chunk received');
            }
          } catch (parseError) {
            console.log('Non-JSON event:', line);
          }
        }
      }

      return {
        success: !hasError,
        generationComplete,
        creditsDeducted,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      error(`❌ ${message}`);
      console.error('Generation error:', err);
      return {
        success: false,
        generationComplete: false,
        creditsDeducted: false,
      };
    }
  };

  return { generateApp };
}
