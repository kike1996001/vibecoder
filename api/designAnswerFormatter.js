/**
 * Design Answer Formatter
 * Converts design system choices into Claude prompt enhancements
 */

export function formatDesignAnswersForGeneration(designAnswers) {
  if (!designAnswers || !Object.keys(designAnswers).length) {
    return null;
  }

  const sections = [];

  // Color Palette Section
  if (designAnswers.colorPalette) {
    const { name, primary, secondary, accent } = designAnswers.colorPalette;
    sections.push(
      `## Design System: Color Palette "${name}"`,
      `Apply this exact color scheme throughout the application:`,
      `- Primary Color: ${primary}`,
      `- Secondary Color: ${secondary}`,
      `- Accent Color: ${accent}`,
      `Use these colors consistently in buttons, links, backgrounds, and highlights.`
    );
  }

  // Typography Section
  if (designAnswers.typography) {
    const { name, heading, body } = designAnswers.typography;
    sections.push(
      `## Typography System: "${name}"`,
      `Apply these fonts throughout:`,
      `- Headings & Bold Text: ${heading} font-family`,
      `- Body & Regular Text: ${body} font-family`,
      `Ensure proper font weights and sizes for hierarchy.`
    );
  }

  // Layout Section
  if (designAnswers.layoutDirection) {
    const { name, layout } = designAnswers.layoutDirection;
    sections.push(
      `## Page Layout: "${name}"`,
      `Structure: ${layout}`,
      `Implement this layout structure as the primary page design.`
    );
  }

  // Design Direction Section
  if (designAnswers.designMockup) {
    const { name, vibe } = designAnswers.designMockup;
    sections.push(
      `## Design Direction: "${name}"`,
      `Visual Vibe: ${vibe}`,
      `Follow this design direction and aesthetic throughout the application.`
    );
  }

  if (sections.length === 0) {
    return null;
  }

  return '\n' + sections.join('\n') + '\n';
}

/**
 * Log design answers for analytics
 */
export function logDesignAnswers(userId, designAnswers, prompt) {
  if (!designAnswers) {
    return {
      userDesignSystemUsed: false,
      selections: {},
    };
  }

  return {
    userDesignSystemUsed: true,
    selections: {
      colorPalette: designAnswers.colorPalette?.name || null,
      typography: designAnswers.typography?.name || null,
      layoutDirection: designAnswers.layoutDirection?.name || null,
      designMockup: designAnswers.designMockup?.name || null,
    },
    message: `User ${userId} generated app with custom design system: ${
      [
        designAnswers.colorPalette?.name,
        designAnswers.typography?.name,
        designAnswers.layoutDirection?.name,
        designAnswers.designMockup?.name,
      ]
        .filter(Boolean)
        .join(', ')
    }`,
  };
}
