/**
 * Status Message Service
 * Generates human-readable status messages during app generation
 * Tracks progress and shows what Claude is working on
 */

const statusPhases = [
  {
    phase: 'analysis',
    messages: [
      'Analyzing app requirements...',
      'Reading your design preferences...',
      'Understanding project structure...',
      'Detecting optimal tech stack...',
    ],
  },
  {
    phase: 'design_system',
    messages: [
      'Setting up design system...',
      'Applying color palette...',
      'Configuring typography...',
      'Setting layout structure...',
    ],
  },
  {
    phase: 'colors',
    messages: [
      'Applying primary color scheme...',
      'Setting accent colors...',
      'Configuring dark mode...',
      'Optimizing contrast ratios...',
    ],
  },
  {
    phase: 'typography',
    messages: [
      'Loading font families...',
      'Setting text hierarchy...',
      'Optimizing readability...',
      'Applying font weights...',
    ],
  },
  {
    phase: 'layout',
    messages: [
      'Structuring page layout...',
      'Creating responsive grid...',
      'Building navigation...',
      'Organizing sections...',
    ],
  },
  {
    phase: 'components',
    messages: [
      'Creating reusable components...',
      'Building UI elements...',
      'Setting up interactions...',
      'Adding animations...',
    ],
  },
  {
    phase: 'optimization',
    messages: [
      'Optimizing performance...',
      'Minifying assets...',
      'Checking accessibility...',
      'Testing responsiveness...',
    ],
  },
  {
    phase: 'finalization',
    messages: [
      'Polishing details...',
      'Final checks...',
      'Preparing preview...',
      'Ready for you to see!',
    ],
  },
];

/**
 * Generate a status message based on elapsed time
 * Creates sense of progress even when Claude is thinking
 */
export function getStatusMessage(elapsedMs, designSystem = null) {
  const elapsedSeconds = elapsedMs / 1000;
  const totalExpectedSeconds = 30; // Total expected generation time for status purposes
  const progress = Math.min(elapsedSeconds / totalExpectedSeconds, 0.95); // Cap at 95%

  // Select phase based on progress
  const phaseIndex = Math.floor(progress * statusPhases.length);
  const phase = statusPhases[Math.min(phaseIndex, statusPhases.length - 1)];

  // Select message within phase based on position
  const messageIndex = Math.floor(
    ((progress % (1 / statusPhases.length)) * statusPhases.length) * phase.messages.length
  );
  const message = phase.messages[Math.min(messageIndex, phase.messages.length - 1)];

  // If design system provided, customize messages
  if (designSystem?.colorPalette) {
    if (message.includes('color') || message.includes('Color')) {
      return `Applying ${designSystem.colorPalette.name}...`;
    }
  }

  if (designSystem?.typography) {
    if (message.includes('typography') || message.includes('Typography')) {
      return `Setting ${designSystem.typography.name}...`;
    }
  }

  if (designSystem?.layoutDirection) {
    if (message.includes('layout') || message.includes('Layout')) {
      return `Building ${designSystem.layoutDirection.name} layout...`;
    }
  }

  return message;
}

/**
 * Get initial status message
 */
export function getInitialStatusMessage() {
  return statusPhases[0].messages[0];
}

/**
 * Get completion message
 */
export function getCompletionMessage() {
  return '✨ App generated successfully!';
}

/**
 * Format status messages for display
 */
export function formatStatusMessage(message, isStreaming = false) {
  const prefix = isStreaming ? '⚙️  ' : '✅ ';
  return `${prefix} ${message}`;
}

/**
 * Generate status update events for streaming
 * Should be called periodically during generation
 */
export function createStatusUpdateEvent(elapsedMs, designSystem = null, metadata = {}) {
  const message = getStatusMessage(elapsedMs, designSystem);
  const progress = Math.min((elapsedMs / 30000) * 100, 95); // 30s total expected

  return {
    type: 'status_update',
    message,
    progress: Math.round(progress),
    timestamp: Date.now(),
    ...metadata,
  };
}
