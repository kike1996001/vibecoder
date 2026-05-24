/**
 * Status Message Generator Service
 * Generates realistic status messages for different app types and generation phases
 * Based on Lovable.dev's status streaming
 */

export type AppType = 'simple' | 'complex' | 'portfolio' | 'saas' | 'ecommerce' | 'landing';
export type GenerationPhase = 'analyzing' | 'planning' | 'generating' | 'styling' | 'refining' | 'finalizing';

// Status message templates for different phases
const STATUS_MESSAGES: Record<GenerationPhase, string[]> = {
  analyzing: [
    'Analizando estructura del proyecto...',
    'Inspeccionando requisitos de la aplicación...',
    'Evaluando componentes necesarios...',
    'Detectando dependencias...',
    'Planificando arquitectura...',
  ],
  planning: [
    'Diseñando estructura de carpetas...',
    'Configurando herramientas de build...',
    'Seleccionando dependencias...',
    'Planificando rutas y navegación...',
    'Diseñando componentes principales...',
  ],
  generating: [
    'Generando archivos base...',
    'Creando componentes React...',
    'Implementando lógica de negocio...',
    'Configurando estado global...',
    'Agregando formularios...',
    'Creando páginas...',
  ],
  styling: [
    'Aplicando estilos Tailwind...',
    'Optimizando diseño responsivo...',
    'Agregando animaciones...',
    'Refinando tipografía...',
    'Mejorando accesibilidad...',
  ],
  refining: [
    'Refinando interfaz de usuario...',
    'Optimizando rendimiento...',
    'Validando código...',
    'Puliendo detalles visuales...',
    'Agregando efectos visuales...',
  ],
  finalizing: [
    'Finalizando generación...',
    'Compilando proyecto...',
    'Optimizando bundle...',
    'Preparando vista previa...',
    '¡Listo para probar!',
  ],
};

// Design system specific messages
const DESIGN_SYSTEM_MESSAGES: Record<string, string[]> = {
  colors: [
    'Aplicando paleta de colores...',
    'Definiendo esquema de colores...',
    'Configurando variables de color...',
    'Aplicando tema de colores...',
  ],
  typography: [
    'Configurando tipografía...',
    'Aplicando jerarquía de fuentes...',
    'Refinando estilos de texto...',
    'Optimizando legibilidad...',
  ],
  layout: [
    'Estructurando layout...',
    'Configurando grid system...',
    'Alineando componentes...',
    'Aplicando espaciado...',
  ],
  darkmode: [
    'Implementando modo oscuro...',
    'Ajustando contraste...',
    'Refinando tema oscuro...',
    'Validando legibilidad...',
  ],
};

/**
 * Generate a sequence of status messages for generation progress
 * @param appType Type of app being generated
 * @param hasDesignSystem Whether design system answers were provided
 * @returns Array of status messages in order
 */
export function generateStatusSequence(
  appType: AppType,
  hasDesignSystem: boolean
): string[] {
  const messages: string[] = [];

  // Phase 1: Analyzing
  messages.push(...selectRandom(STATUS_MESSAGES.analyzing, 2));

  // Phase 2: Planning
  if (appType === 'simple') {
    messages.push('Planificando estructura simple...');
  } else {
    messages.push(...selectRandom(STATUS_MESSAGES.planning, 2));
  }

  // Phase 3: Design System (if provided)
  if (hasDesignSystem) {
    messages.push(...selectRandom(DESIGN_SYSTEM_MESSAGES.colors, 1));
    messages.push(...selectRandom(DESIGN_SYSTEM_MESSAGES.typography, 1));
    messages.push(...selectRandom(DESIGN_SYSTEM_MESSAGES.layout, 1));
  }

  // Phase 4: Generation
  messages.push(...selectRandom(STATUS_MESSAGES.generating, 3));

  // Phase 5: Styling
  messages.push(...selectRandom(STATUS_MESSAGES.styling, 2));

  // Phase 6: Refining
  messages.push(...selectRandom(STATUS_MESSAGES.refining, 2));

  // Phase 7: Finalizing
  messages.push(...selectRandom(STATUS_MESSAGES.finalizing, 1));

  return messages;
}

/**
 * Get a random status message for a specific phase
 * @param phase The generation phase
 * @returns Random message for that phase
 */
export function getRandomStatusMessage(phase: GenerationPhase): string {
  const messages = STATUS_MESSAGES[phase];
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get a random design system message
 * @param system Type of design system component
 * @returns Random message for that system
 */
export function getRandomDesignMessage(system: keyof typeof DESIGN_SYSTEM_MESSAGES): string {
  const messages = DESIGN_SYSTEM_MESSAGES[system];
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Select random items from an array
 * @param array Array to select from
 * @param count Number of items to select
 * @returns Selected items (without replacement if possible)
 */
function selectRandom<T>(array: T[], count: number): T[] {
  const selected: T[] = [];
  const available = [...array];

  for (let i = 0; i < Math.min(count, available.length); i++) {
    const index = Math.floor(Math.random() * available.length);
    selected.push(available[index]);
    available.splice(index, 1);
  }

  return selected;
}

/**
 * Calculate estimated time based on app complexity
 * @param appType Type of app
 * @param hasDesignSystem Whether design system is being applied
 * @returns Estimated time in seconds
 */
export function getEstimatedGenerationTime(
  appType: AppType,
  hasDesignSystem: boolean
): number {
  const baseTime: Record<AppType, number> = {
    simple: 17,
    complex: 60,
    portfolio: 85,
    saas: 90,
    ecommerce: 100,
    landing: 45,
  };

  const time = baseTime[appType] || 60;
  const designSystemBonus = hasDesignSystem ? 10 : 0;

  return time + designSystemBonus;
}

/**
 * Calculate status message display interval based on total estimated time
 * @param estimatedTime Total time in seconds
 * @param messageCount Number of status messages
 * @returns Interval in milliseconds between messages
 */
export function getStatusMessageInterval(
  estimatedTime: number,
  messageCount: number
): number {
  // Spread messages evenly across the estimated time
  // Minimum 2 seconds per message
  const interval = Math.max(
    2000,
    (estimatedTime * 1000) / messageCount
  );

  return interval;
}
