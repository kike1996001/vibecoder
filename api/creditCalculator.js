/**
 * Calculate credits needed for a generation based on template, provider, and appType
 * This matches the calculation on the frontend
 */
export function calculateCreditsNeeded(template, provider, appType) {
  const baseCredits = {
    landing: 5,
    saas: 10,
    ecommerce: 15,
    admin: 8,
  };

  const providerMultiplier = {
    anthropic: 1.2, // Higher cost
    gemini: 1.0,
    llama: 0.8, // Lower cost
    together: 0.8,
    openai: 1.3, // Highest cost
  };

  const appTypeMultiplier = {
    web: 1.0,
    mobile: 1.5, // Mobile costs more
  };

  const base = baseCredits[template] || 5;
  const providerCost = base * (providerMultiplier[provider] || 1);
  const totalCost = providerCost * (appTypeMultiplier[appType] || 1);

  return Math.ceil(totalCost);
}
