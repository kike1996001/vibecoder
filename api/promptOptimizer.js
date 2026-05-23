/**
 * Prompt Optimizer - Automatically enhances user prompts with professional details
 * Makes basic ideas into enterprise-grade app specifications
 */

export function optimizePrompt(userPrompt) {
  if (!userPrompt || typeof userPrompt !== 'string') {
    return { original: userPrompt, optimized: userPrompt, improvements: [] };
  }

  const prompt = userPrompt.trim();
  const improvements = [];
  let optimized = prompt;

  // Extract key concepts from the prompt
  const hasAuth = /auth|login|account|user|sign/.test(prompt.toLowerCase());
  const hasDatabase = /data|database|store|storage|table|record/.test(prompt.toLowerCase());
  const hasPayment = /pay|price|stripe|invoice|subscription|billing/.test(prompt.toLowerCase());
  const hasRealtime = /real.?time|live|sync|collaborate|collab/.test(prompt.toLowerCase());
  const hasUI = /design|ui|interface|dark|theme|style|component/.test(prompt.toLowerCase());
  const hasAnalytics = /analytics|metric|chart|graph|report|dashboard/.test(prompt.toLowerCase());

  // Build enhancement suggestions
  let enhancements = [];

  if (!hasAuth) {
    enhancements.push('user authentication with JWT tokens');
    improvements.push('Added user authentication system');
  }

  if (!hasDatabase) {
    enhancements.push('persistent data storage with PostgreSQL');
    improvements.push('Included database persistence layer');
  }

  if (!hasPayment && prompt.toLowerCase().includes('app')) {
    enhancements.push('Stripe payment integration');
    improvements.push('Added payment processing');
  }

  if (!hasRealtime && prompt.toLowerCase().includes('app')) {
    enhancements.push('real-time updates using WebSockets');
    improvements.push('Enabled real-time data synchronization');
  }

  if (!hasAnalytics) {
    enhancements.push('user analytics and event tracking');
    improvements.push('Added analytics and usage tracking');
  }

  // Build enhanced prompt
  if (enhancements.length > 0) {
    optimized = `${prompt}. This application should include: ${enhancements.join(', ')}. 
Use modern technologies with a professional UI/UX, proper error handling, and scalable architecture.`;
  } else {
    // Even if some features are mentioned, add professional polish details
    optimized = `${prompt}. Build this with enterprise-grade code quality, comprehensive error handling, 
scalable architecture, and a polished professional UI/UX.`;
    improvements.push('Enhanced with professional standards');
  }

  // Add performance and security notes
  optimized += ` Ensure optimal performance, security best practices, and responsive design across all devices.`;
  if (!improvements.includes('Optimized for performance')) {
    improvements.push('Optimized for performance and security');
  }

  return {
    original: prompt,
    optimized,
    improvements,
    enhancementsAdded: enhancements
  };
}

/**
 * Generate a summary of what was improved for display
 */
export function getImprovementsSummary(optimizationResult) {
  if (!optimizationResult.improvements || optimizationResult.improvements.length === 0) {
    return {
      hasImprovements: false,
      summary: 'Prompt is well-structured',
      count: 0
    };
  }

  return {
    hasImprovements: true,
    summary: optimizationResult.improvements,
    count: optimizationResult.improvements.length
  };
}
