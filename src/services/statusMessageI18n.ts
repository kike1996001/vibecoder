/**
 * Multi-Language Status Messages Service
 * Provides status messages in multiple languages (Spanish, English, Portuguese)
 */

export type Language = 'es' | 'en' | 'pt';
export type GenerationPhase = 'analyzing' | 'planning' | 'generating' | 'styling' | 'refining' | 'finalizing';

// Status messages in multiple languages
const STATUS_MESSAGES_I18N: Record<Language, Record<GenerationPhase, string[]>> = {
  es: {
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
  },
  en: {
    analyzing: [
      'Analyzing project structure...',
      'Inspecting application requirements...',
      'Evaluating necessary components...',
      'Detecting dependencies...',
      'Planning architecture...',
    ],
    planning: [
      'Designing folder structure...',
      'Configuring build tools...',
      'Selecting dependencies...',
      'Planning routes and navigation...',
      'Designing main components...',
    ],
    generating: [
      'Generating base files...',
      'Creating React components...',
      'Implementing business logic...',
      'Configuring global state...',
      'Adding forms...',
      'Creating pages...',
    ],
    styling: [
      'Applying Tailwind styles...',
      'Optimizing responsive design...',
      'Adding animations...',
      'Refining typography...',
      'Improving accessibility...',
    ],
    refining: [
      'Refining user interface...',
      'Optimizing performance...',
      'Validating code...',
      'Polishing visual details...',
      'Adding visual effects...',
    ],
    finalizing: [
      'Finalizing generation...',
      'Compiling project...',
      'Optimizing bundle...',
      'Preparing preview...',
      'Ready to test!',
    ],
  },
  pt: {
    analyzing: [
      'Analisando estrutura do projeto...',
      'Inspecionando requisitos do aplicativo...',
      'Avaliando componentes necessários...',
      'Detectando dependências...',
      'Planejando arquitetura...',
    ],
    planning: [
      'Projetando estrutura de pastas...',
      'Configurando ferramentas de compilação...',
      'Selecionando dependências...',
      'Planejando rotas e navegação...',
      'Projetando componentes principais...',
    ],
    generating: [
      'Gerando arquivos base...',
      'Criando componentes React...',
      'Implementando lógica de negócio...',
      'Configurando estado global...',
      'Adicionando formulários...',
      'Criando páginas...',
    ],
    styling: [
      'Aplicando estilos Tailwind...',
      'Otimizando design responsivo...',
      'Adicionando animações...',
      'Refinando tipografia...',
      'Melhorando acessibilidade...',
    ],
    refining: [
      'Refinando interface do usuário...',
      'Otimizando desempenho...',
      'Validando código...',
      'Polindo detalhes visuais...',
      'Adicionando efeitos visuais...',
    ],
    finalizing: [
      'Finalizando geração...',
      'Compilando projeto...',
      'Otimizando pacote...',
      'Preparando visualização...',
      'Pronto para testar!',
    ],
  },
};

// Design system specific messages in multiple languages
const DESIGN_SYSTEM_MESSAGES_I18N: Record<Language, Record<string, string[]>> = {
  es: {
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
  },
  en: {
    colors: [
      'Applying color palette...',
      'Defining color scheme...',
      'Configuring color variables...',
      'Applying color theme...',
    ],
    typography: [
      'Configuring typography...',
      'Applying font hierarchy...',
      'Refining text styles...',
      'Optimizing readability...',
    ],
    layout: [
      'Structuring layout...',
      'Configuring grid system...',
      'Aligning components...',
      'Applying spacing...',
    ],
    darkmode: [
      'Implementing dark mode...',
      'Adjusting contrast...',
      'Refining dark theme...',
      'Validating readability...',
    ],
  },
  pt: {
    colors: [
      'Aplicando paleta de cores...',
      'Definindo esquema de cores...',
      'Configurando variáveis de cor...',
      'Aplicando tema de cores...',
    ],
    typography: [
      'Configurando tipografia...',
      'Aplicando hierarquia de fontes...',
      'Refinando estilos de texto...',
      'Otimizando legibilidade...',
    ],
    layout: [
      'Estruturando layout...',
      'Configurando sistema de grid...',
      'Alinhando componentes...',
      'Aplicando espaçamento...',
    ],
    darkmode: [
      'Implementando modo escuro...',
      'Ajustando contraste...',
      'Refinando tema escuro...',
      'Validando legibilidade...',
    ],
  },
};

/**
 * Generate status sequence in specified language
 */
export function generateStatusSequenceI18N(
  language: Language,
  appType: 'simple' | 'complex',
  hasDesignSystem: boolean
): string[] {
  const messages = STATUS_MESSAGES_I18N[language];
  const designMessages = DESIGN_SYSTEM_MESSAGES_I18N[language];

  const sequence: string[] = [];

  // Phase 1: Analyzing
  sequence.push(...selectRandom(messages.analyzing, 2));

  // Phase 2: Planning
  if (appType === 'simple') {
    sequence.push('Planificando estructura simple...');
  } else {
    sequence.push(...selectRandom(messages.planning, 2));
  }

  // Phase 3: Design System (if provided)
  if (hasDesignSystem) {
    sequence.push(...selectRandom(designMessages.colors, 1));
    sequence.push(...selectRandom(designMessages.typography, 1));
    sequence.push(...selectRandom(designMessages.layout, 1));
  }

  // Phase 4: Generating
  sequence.push(...selectRandom(messages.generating, 3));

  // Phase 5: Styling
  sequence.push(...selectRandom(messages.styling, 2));

  // Phase 6: Refining
  sequence.push(...selectRandom(messages.refining, 2));

  // Phase 7: Finalizing
  sequence.push(...selectRandom(messages.finalizing, 1));

  return sequence;
}

/**
 * Get random status message in specified language and phase
 */
export function getRandomStatusMessageI18N(language: Language, phase: GenerationPhase): string {
  const messages = STATUS_MESSAGES_I18N[language][phase];
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get random design system message in specified language
 */
export function getRandomDesignMessageI18N(language: Language, system: keyof typeof DESIGN_SYSTEM_MESSAGES_I18N['es']): string {
  const messages = DESIGN_SYSTEM_MESSAGES_I18N[language][system];
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get user-friendly language name
 */
export function getLanguageName(language: Language): string {
  const names: Record<Language, string> = {
    es: '🇪🇸 Español',
    en: '🇺🇸 English',
    pt: '🇧🇷 Português',
  };
  return names[language];
}

/**
 * Select random items from array
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
 * Get estimated time label in language
 */
export function getEstimatedTimeLabel(language: Language): string {
  const labels: Record<Language, string> = {
    es: 'Tiempo estimado',
    en: 'Estimated time',
    pt: 'Tempo estimado',
  };
  return labels[language];
}
