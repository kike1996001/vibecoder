/**
 * Design System Consistency Validation Service
 * Validates that generated code applies the selected design system correctly
 */

export interface ColorValidationResult {
  selected: string[];
  used: string[];
  valid: boolean;
  coverage: number; // Percentage of palette used
  contrastRatios: Record<string, number>;
  issues: string[];
}

export interface TypographyValidationResult {
  selected: string[];
  used: string[];
  valid: boolean;
  hierarchy: boolean;
  issues: string[];
}

export interface LayoutValidationResult {
  selectedType: string;
  detectedType: string;
  isValid: boolean;
  matchScore: number; // 0-100
  structure: string;
  issues: string[];
}

export interface DarkModeValidationResult {
  selected: boolean;
  implemented: boolean;
  contrastValid: boolean;
  issues: string[];
}

export interface ValidationResult {
  colorPalette: ColorValidationResult;
  typography: TypographyValidationResult;
  layout: LayoutValidationResult;
  darkMode: DarkModeValidationResult;
  overallScore: number; // 0-100
  allValid: boolean;
  summary: string;
}

// Color palettes mapping
const COLOR_PALETTES: Record<string, string[]> = {
  midnightIndigo: ['#4B7FFF', '#3D5FD1', '#2E47A3', '#1F2F75', '#10174A'],
  goldElegance: ['#D4A574', '#C49564', '#B48554', '#A47544', '#946534'],
  dawnMinimal: ['#F5F3F0', '#E8E4DF', '#DBD5CE', '#CEC6BD', '#C1B7AC'],
  tealVibrant: ['#1DD1A1', '#10AC84', '#0D8C67', '#0A6E4A', '#07502D'],
  purpleGradient: ['#6B5BFF', '#5D4DE6', '#4F3FCD', '#4131B4', '#33239B'],
};

// Typography pairs mapping
const TYPOGRAPHY_OPTIONS: Record<string, { primary: string; secondary: string }> = {
  spaceGrotesk: { primary: 'Space Grotesk', secondary: 'DM Sans' },
  instrumentSerif: { primary: 'Instrument Serif', secondary: 'Work Sans' },
  sora: { primary: 'Sora', secondary: 'Manrope' },
  archivoBlack: { primary: 'Archivo Black', secondary: 'Hind' },
};

// Layout types
const LAYOUT_TYPES = {
  heroBento: 'Hero + Bento Grid',
  asymmetric: 'Asymmetric Flow',
  minimalist: 'Minimalist Vertical',
  showcase: 'Showcase Focus',
};

/**
 * Main validation function
 * Analyzes generated HTML against design system choices
 */
export async function validateDesignConsistency(
  generatedHTML: string,
  designAnswers: any
): Promise<ValidationResult> {
  const issues: string[] = [];
  let totalScore = 0;
  let validCategories = 0;

  // Validate color palette
  const colorResult = validateColorPalette(generatedHTML, designAnswers.color);
  totalScore += colorResult.valid ? 25 : 10;
  if (colorResult.valid) validCategories++;

  // Validate typography
  const typographyResult = validateTypography(generatedHTML, designAnswers.typography);
  totalScore += typographyResult.valid ? 25 : 10;
  if (typographyResult.valid) validCategories++;

  // Validate layout
  const layoutResult = validateLayout(generatedHTML, designAnswers.layout);
  totalScore += (layoutResult.matchScore / 100) * 25;
  if (layoutResult.isValid) validCategories++;

  // Validate dark mode
  const darkModeResult = validateDarkMode(generatedHTML, designAnswers.darkMode);
  totalScore += darkModeResult.implemented ? 25 : 0;
  if (darkModeResult.implemented) validCategories++;

  const allValid = validCategories === 4;
  const overallScore = Math.round(totalScore);

  return {
    colorPalette: colorResult,
    typography: typographyResult,
    layout: layoutResult,
    darkMode: darkModeResult,
    overallScore,
    allValid,
    summary: generateSummary(overallScore, allValid),
  };
}

/**
 * Validate color palette consistency
 */
function validateColorPalette(
  html: string,
  selectedPalette?: string
): ColorValidationResult {
  const issues: string[] = [];
  const used: string[] = [];

  if (!selectedPalette) {
    return {
      selected: [],
      used,
      valid: true,
      coverage: 0,
      contrastRatios: {},
      issues: ['No color palette selected'],
    };
  }

  const paletteColors = COLOR_PALETTES[selectedPalette] || [];
  if (paletteColors.length === 0) {
    issues.push('Unknown color palette selected');
    return {
      selected: paletteColors,
      used,
      valid: false,
      coverage: 0,
      contrastRatios: {},
      issues,
    };
  }

  // Extract colors from HTML/CSS
  const extractedColors = extractColors(html);
  const contrastRatios = calculateContrastRatios(extractedColors);

  // Check color usage
  let colorMatches = 0;
  for (const extracted of extractedColors) {
    const match = findClosestColor(extracted, paletteColors);
    if (match && colorDistanceDelta(extracted, match) < 10) {
      colorMatches++;
      if (!used.includes(match)) used.push(match);
    }
  }

  const coverage = paletteColors.length > 0 ? (used.length / paletteColors.length) * 100 : 0;
  const valid = coverage >= 60;

  if (coverage < 60) {
    issues.push(`Low color coverage: ${Math.round(coverage)}% of palette used`);
  }

  // Check contrast for accessibility
  const lowContrastPairs = Object.entries(contrastRatios)
    .filter(([_, ratio]) => (ratio as number) < 4.5)
    .map(([pair, _]) => pair);

  if (lowContrastPairs.length > 0) {
    issues.push(`Low contrast detected: ${lowContrastPairs.slice(0, 2).join(', ')}`);
  }

  return {
    selected: paletteColors,
    used,
    valid,
    coverage: Math.round(coverage),
    contrastRatios,
    issues,
  };
}

/**
 * Validate typography consistency
 */
function validateTypography(
  html: string,
  selectedTypography?: string
): TypographyValidationResult {
  const issues: string[] = [];
  const used: string[] = [];

  if (!selectedTypography) {
    return {
      selected: [],
      used,
      valid: true,
      hierarchy: true,
      issues: ['No typography selected'],
    };
  }

  const fonts = TYPOGRAPHY_OPTIONS[selectedTypography] || {
    primary: 'Unknown',
    secondary: 'Unknown',
  };

  // Extract fonts from HTML/CSS
  const extractedFonts = extractFonts(html);
  const fontSizes = extractFontSizes(html);

  // Check if selected fonts are used
  let primaryUsed = false;
  let secondaryUsed = false;

  for (const font of extractedFonts) {
    if (
      font.toLowerCase().includes(fonts.primary.toLowerCase()) ||
      font.toLowerCase().includes(fonts.primary.split(' ')[0].toLowerCase())
    ) {
      primaryUsed = true;
      if (!used.includes(fonts.primary)) used.push(fonts.primary);
    }
    if (
      font.toLowerCase().includes(fonts.secondary.toLowerCase()) ||
      font.toLowerCase().includes(fonts.secondary.split(' ')[0].toLowerCase())
    ) {
      secondaryUsed = true;
      if (!used.includes(fonts.secondary)) used.push(fonts.secondary);
    }
  }

  // Check hierarchy
  const hierarchy = validateHierarchy(fontSizes);

  const valid = primaryUsed || secondaryUsed;

  if (!primaryUsed) {
    issues.push(`Primary font not found: ${fonts.primary}`);
  }
  if (!hierarchy) {
    issues.push('Font size hierarchy not maintained (H1 > H2 > H3...)');
  }

  return {
    selected: [fonts.primary, fonts.secondary],
    used,
    valid,
    hierarchy,
    issues,
  };
}

/**
 * Validate layout structure
 */
function validateLayout(
  html: string,
  selectedLayout?: string
): LayoutValidationResult {
  const issues: string[] = [];

  if (!selectedLayout) {
    return {
      selectedType: 'None',
      detectedType: 'Unknown',
      isValid: true,
      matchScore: 50,
      structure: 'Not analyzed',
      issues: ['No layout selected'],
    };
  }

  const layoutName = LAYOUT_TYPES[selectedLayout as keyof typeof LAYOUT_TYPES] || selectedLayout;
  const detectedType = detectLayoutType(html);
  const matchScore = calculateLayoutMatch(selectedLayout, detectedType);

  if (matchScore < 70) {
    issues.push(
      `Layout mismatch: expected "${layoutName}" but detected "${detectedType}"`
    );
  }

  return {
    selectedType: layoutName,
    detectedType,
    isValid: matchScore >= 70,
    matchScore,
    structure: describeStructure(html),
    issues,
  };
}

/**
 * Validate dark mode implementation
 */
function validateDarkMode(
  html: string,
  darkModeSelected?: boolean
): DarkModeValidationResult {
  const issues: string[] = [];

  if (!darkModeSelected) {
    return {
      selected: false,
      implemented: false,
      contrastValid: true,
      issues: ['Dark mode not selected'],
    };
  }

  // Check for dark mode CSS
  const hasDarkMode = /dark:|@media.*prefers-color-scheme:\s*dark/i.test(html);

  if (!hasDarkMode) {
    issues.push('Dark mode CSS not found');
    return {
      selected: true,
      implemented: false,
      contrastValid: false,
      issues,
    };
  }

  // Check contrast ratios in dark mode
  const darkModeContrast = validateDarkModeContrast(html);

  return {
    selected: true,
    implemented: true,
    contrastValid: darkModeContrast.isValid,
    issues: darkModeContrast.issues,
  };
}

/**
 * Helper Functions
 */

function extractColors(html: string): string[] {
  const colorRegex = /#[0-9a-f]{6}|rgb\([\d,\s]+\)|rgba\([\d,\s.]+\)/gi;
  const matches = html.match(colorRegex) || [];
  return [...new Set(matches)];
}

function extractFonts(html: string): string[] {
  const fontRegex = /font-family:\s*['"]?([^'"\n;]+)/gi;
  const matches: string[] = [];
  let match;

  while ((match = fontRegex.exec(html)) !== null) {
    matches.push(match[1].trim());
  }

  return [...new Set(matches)];
}

function extractFontSizes(html: string): Record<string, number> {
  const sizeRegex = /(h[1-6]|body|p|\.heading|\.text).*?font-size:\s*(\d+)px/gi;
  const sizes: Record<string, number> = {};

  let match;
  while ((match = sizeRegex.exec(html)) !== null) {
    sizes[match[1].toLowerCase()] = parseInt(match[2]);
  }

  return sizes;
}

function validateHierarchy(fontSizes: Record<string, number>): boolean {
  const h1Size = fontSizes['h1'] || 0;
  const h2Size = fontSizes['h2'] || 0;
  const h3Size = fontSizes['h3'] || 0;
  const bodySize = fontSizes['body'] || 16;

  // Check if sizes follow hierarchy
  return h1Size >= h2Size && h2Size >= h3Size && h3Size >= bodySize;
}

function findClosestColor(targetColor: string, palette: string[]): string | null {
  if (palette.length === 0) return null;

  let closest = palette[0];
  let closestDistance = Infinity;

  for (const color of palette) {
    const distance = colorDistanceDelta(targetColor, color);
    if (distance < closestDistance) {
      closestDistance = distance;
      closest = color;
    }
  }

  return closest;
}

function colorDistanceDelta(color1: string, color2: string): number {
  // Simple delta-E calculation
  const rgb1 = hexToRgb(color1) || { r: 0, g: 0, b: 0 };
  const rgb2 = hexToRgb(color2) || { r: 0, g: 0, b: 0 };

  const rDelta = rgb1.r - rgb2.r;
  const gDelta = rgb1.g - rgb2.g;
  const bDelta = rgb1.b - rgb2.b;

  return Math.sqrt(rDelta ** 2 + gDelta ** 2 + bDelta ** 2);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function calculateContrastRatios(colors: string[]): Record<string, number> {
  const ratios: Record<string, number> = {};

  for (let i = 0; i < Math.min(colors.length, 3); i++) {
    for (let j = i + 1; j < Math.min(colors.length, 4); j++) {
      const ratio = calculateContrast(colors[i], colors[j]);
      ratios[`${colors[i]} vs ${colors[j]}`] = ratio;
    }
  }

  return ratios;
}

function calculateContrast(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 1;

  const lum1 = calculateLuminance(rgb1);
  const lum2 = calculateLuminance(rgb2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

function calculateLuminance(rgb: { r: number; g: number; b: number }): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((x) => {
    x = x / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });

  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}

function detectLayoutType(html: string): string {
  if (/grid|bento|hero/i.test(html)) return 'Grid-based';
  if (/flex|column|flow/i.test(html)) return 'Flexbox-based';
  if (/vertical|stack/i.test(html)) return 'Vertical Stack';
  if (/showcase|feature|large.*image/i.test(html)) return 'Showcase';

  return 'Generic';
}

function calculateLayoutMatch(
  selected: string,
  detected: string
): number {
  const selectedLower = selected.toLowerCase();
  const detectedLower = detected.toLowerCase();

  // Perfect match
  if (selectedLower === detectedLower) return 100;

  // Partial matches
  if (
    (selectedLower.includes('hero') || selectedLower.includes('bento')) &&
    detectedLower.includes('grid')
  ) {
    return 85;
  }
  if (selectedLower.includes('asymmetric') && detectedLower.includes('flex')) {
    return 75;
  }
  if (selectedLower.includes('minimalist') && detectedLower.includes('vertical')) {
    return 80;
  }
  if (selectedLower.includes('showcase') && detectedLower.includes('showcase')) {
    return 90;
  }

  return 50;
}

function describeStructure(html: string): string {
  const gridCount = (html.match(/grid/gi) || []).length;
  const flexCount = (html.match(/flex/gi) || []).length;
  const componentCount = (html.match(/<(div|section|article)/gi) || []).length;

  return `${componentCount} components, ${gridCount} grid, ${flexCount} flex`;
}

function validateDarkModeContrast(html: string): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Extract dark mode specific colors and check contrast
  const darkModeRegex = /@media.*prefers-color-scheme:\s*dark\s*{([^}]+)}/gi;
  const matches = html.match(darkModeRegex) || [];

  if (matches.length === 0) {
    issues.push('No dark mode CSS found');
    return { isValid: false, issues };
  }

  // For now, just check that dark mode CSS exists and has sufficient rules
  const isValid = matches.some((m) => m.length > 50);

  return { isValid, issues };
}

function generateSummary(score: number, allValid: boolean): string {
  if (score >= 90) {
    return '🎉 Excelente: Design system perfectly applied!';
  }
  if (score >= 75) {
    return '✅ Muy bien: Design system mostly applied correctly.';
  }
  if (score >= 60) {
    return '⚠️ Aceptable: Some design system elements applied.';
  }
  return '❌ Necesita mejoras: Design system not properly applied.';
}
