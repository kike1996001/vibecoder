import { ProviderFactory } from './providers/factory';

export default function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const available = ProviderFactory.getAvailableProviders();
    const defaultProvider = ProviderFactory.getDefaultProvider();

    res.status(200).json({
      available,
      default: defaultProvider,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
}
