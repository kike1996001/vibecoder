/**
 * Complexity Detection Service
 * Analyzes prompts to determine if they require design questions (complex)
 * or can skip directly to generation (simple)
 * 
 * Based on Lovable.dev behavior analysis:
 * - Simple apps (task, todo, calculate): Direct generation
 * - Complex apps (portfolio, website, brand): Design questions required
 */

export type AppComplexity = 'simple' | 'complex';

export interface ComplexityAnalysis {
  complexity: AppComplexity;
  confidence: number; // 0-100, how confident we are about the classification
  matchedKeywords: string[];
  reasoning: string;
}

// Keywords that indicate COMPLEX apps requiring design questions
const COMPLEX_KEYWORDS = [
  // Design-focused
  'portfolio',
  'website',
  'brand',
  'design',
  'showcase',
  'professional',
  'corporate',
  'agency',
  'studio',
  
  // Style/Theme
  'dark mode',
  'dark theme',
  'light theme',
  'theme',
  'styled',
  'custom design',
  'design direction',
  'color scheme',
  'color palette',
  
  // Advanced features
  'animations',
  'animated',
  'smooth transitions',
  'interactive',
  'responsive',
  'modern',
  'sleek',
  'polished',
  
  // Layout-focused
  'hero section',
  'landing page',
  'showcase',
  'grid',
  'sections',
  'layout',
  'bento',
  'masonry',
  
  // Brand/identity
  'identity',
  'brand identity',
  'company',
  'business',
  'e-commerce',
  'ecommerce',
  'shop',
  'store',
  'marketplace',
  
  // Content-rich
  'blog',
  'documentation',
  'wiki',
  'knowledge base',
  'saas',
  'application',
  'dashboard',
  'admin panel',
];

// Keywords that indicate SIMPLE apps (can skip design questions)
const SIMPLE_KEYWORDS = [
  // CRUD operations
  'add',
  'delete',
  'remove',
  'remove',
  'update',
  'edit',
  'create',
  'list',
  'manage',
  
  // Simple app types
  'simple',
  'basic',
  'todo',
  'task',
  'note',
  'calculator',
  'calculate',
  'convert',
  'filter',
  'search',
  'counter',
  'timer',
  'stopwatch',
  'weather',
  'quote',
  'joke',
  
  // Utility
  'tool',
  'utility',
  'generator',
  'validator',
  'formatter',
];

/**
 * Analyzes a prompt to determine app complexity
 * @param prompt The user's app description
 * @returns ComplexityAnalysis with complexity level and reasoning
 */
export function analyzeComplexity(prompt: string): ComplexityAnalysis {
  const lowerPrompt = prompt.toLowerCase();
  const words = lowerPrompt.split(/\s+/);
  
  // Count keyword matches
  const complexMatches: string[] = [];
  const simpleMatches: string[] = [];
  
  // Check for complex keywords
  COMPLEX_KEYWORDS.forEach(keyword => {
    if (lowerPrompt.includes(keyword)) {
      complexMatches.push(keyword);
    }
  });
  
  // Check for simple keywords
  SIMPLE_KEYWORDS.forEach(keyword => {
    if (lowerPrompt.includes(keyword)) {
      simpleMatches.push(keyword);
    }
  });
  
  // Decision logic
  // If complex keywords significantly outnumber simple keywords -> COMPLEX
  // If simple keywords present and complex keywords absent -> SIMPLE
  // If balanced, look at context
  
  const complexScore = complexMatches.length * 2; // Complex keywords weighted more
  const simpleScore = simpleMatches.length;
  
  let complexity: AppComplexity;
  let confidence: number;
  let reasoning: string;
  let matchedKeywords: string[];
  
  if (complexScore > simpleScore) {
    complexity = 'complex';
    confidence = Math.min(95, 50 + complexMatches.length * 10);
    matchedKeywords = complexMatches;
    reasoning = `Detected design-focused keywords: ${complexMatches.slice(0, 3).join(', ')}. Will ask design questions.`;
  } else if (simpleScore > 0 && complexScore === 0) {
    complexity = 'simple';
    confidence = Math.min(95, 50 + simpleMatches.length * 10);
    matchedKeywords = simpleMatches;
    reasoning = `Detected simple app keywords: ${simpleMatches.slice(0, 3).join(', ')}. Skipping design questions.`;
  } else if (complexScore === 0 && simpleScore === 0) {
    // No keywords matched - default to SIMPLE (safer default)
    complexity = 'simple';
    confidence = 30;
    matchedKeywords = [];
    reasoning = 'No specific keywords detected. Defaulting to simple path. Ask design questions if needed.';
  } else {
    // Mixed signals - lean towards complex since design questions are always helpful
    complexity = 'complex';
    confidence = 65;
    matchedKeywords = [...complexMatches, ...simpleMatches];
    reasoning = 'Mixed signals detected. Using complex path for better design results.';
  }
  
  return {
    complexity,
    confidence,
    matchedKeywords,
    reasoning,
  };
}

/**
 * Quick check: is the app complex?
 * @param prompt The user's app description
 * @returns true if complex, false if simple
 */
export function isComplex(prompt: string): boolean {
  return analyzeComplexity(prompt).complexity === 'complex';
}

/**
 * Get complexity level
 * @param prompt The user's app description
 * @returns 'simple' or 'complex'
 */
export function getComplexity(prompt: string): AppComplexity {
  return analyzeComplexity(prompt).complexity;
}

/**
 * Get human-readable explanation of complexity analysis
 * @param analysis The complexity analysis result
 * @returns Formatted string explaining the analysis
 */
export function getComplexityExplanation(analysis: ComplexityAnalysis): string {
  return `
${analysis.reasoning}
Confidence: ${analysis.confidence}%
Matched Keywords: ${analysis.matchedKeywords.length > 0 ? analysis.matchedKeywords.join(', ') : 'None'}
  `.trim();
}
