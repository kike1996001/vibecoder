export async function getAvailableProviders(): Promise<string[]> {
  try {
    const response = await fetch('/api/providers');
    if (!response.ok) {
      throw new Error('Failed to fetch providers');
    }
    const data = await response.json();
    return data.available || ['anthropic'];
  } catch (error) {
    console.warn('Failed to fetch providers, defaulting to anthropic:', error);
    return ['anthropic'];
  }
}
