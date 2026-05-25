export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only GET allowed
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const available = [];
    
    if (process.env.ANTHROPIC_API_KEY) available.push('anthropic');
    if (process.env.OPENAI_API_KEY) available.push('openai');
    if (process.env.GOOGLE_API_KEY) available.push('gemini');
    if (process.env.TOGETHER_API_KEY) available.push('llama');

    // Default to anthropic if no providers
    if (available.length === 0) available.push('anthropic');

    res.status(200).json({
      available,
      default: available[0],
    });
  } catch (error) {
    console.error('Providers error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to get providers' 
    });
  }
}
