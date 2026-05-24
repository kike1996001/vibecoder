/**
 * Analytics Service
 * Tracks generation events and user metrics
 */

export interface GenerationEvent {
  id: string;
  timestamp: Date;
  appType: 'simple' | 'complex';
  prompt: string;
  promptLength: number;
  hasDesignAnswers: boolean;
  designAnswers?: Record<string, any>;
  generationTime: number; // milliseconds
  statusCode: 'success' | 'error' | 'cancelled';
  errorMessage?: string;
  validationScore?: number;
}

export interface AnalyticsMetrics {
  totalGenerations: number;
  successfulGenerations: number;
  failedGenerations: number;
  averageGenerationTime: number;
  simpleAppCount: number;
  complexAppCount: number;
  withDesignSystemCount: number;
  averageValidationScore: number;
  errorRate: number;
}

/**
 * Local analytics tracker (uses localStorage)
 */
export class AnalyticsTracker {
  private readonly STORAGE_KEY = 'vibecoder_analytics';
  private events: GenerationEvent[] = [];

  constructor() {
    this.loadEvents();
  }

  /**
   * Load events from localStorage
   */
  private loadEvents(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      this.events = [];
    }
  }

  /**
   * Save events to localStorage
   */
  private saveEvents(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.events));
    } catch (error) {
      console.error('Failed to save analytics:', error);
    }
  }

  /**
   * Track a generation event
   */
  trackGeneration(event: Omit<GenerationEvent, 'id'>): void {
    const fullEvent: GenerationEvent = {
      ...event,
      id: `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    this.events.push(fullEvent);
    
    // Keep only last 100 events to avoid localStorage overflow
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }

    this.saveEvents();
  }

  /**
   * Get all events
   */
  getEvents(): GenerationEvent[] {
    return [...this.events];
  }

  /**
   * Get events from last N days
   */
  getRecentEvents(days: number = 7): GenerationEvent[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.events.filter((event) => new Date(event.timestamp) > cutoffDate);
  }

  /**
   * Calculate metrics
   */
  calculateMetrics(events: GenerationEvent[] = this.events): AnalyticsMetrics {
    if (events.length === 0) {
      return {
        totalGenerations: 0,
        successfulGenerations: 0,
        failedGenerations: 0,
        averageGenerationTime: 0,
        simpleAppCount: 0,
        complexAppCount: 0,
        withDesignSystemCount: 0,
        averageValidationScore: 0,
        errorRate: 0,
      };
    }

    const successful = events.filter((e) => e.statusCode === 'success').length;
    const failed = events.filter((e) => e.statusCode === 'error').length;
    const simple = events.filter((e) => e.appType === 'simple').length;
    const complex = events.filter((e) => e.appType === 'complex').length;
    const withDesign = events.filter((e) => e.hasDesignAnswers).length;

    const totalTime = events.reduce((sum, e) => sum + e.generationTime, 0);
    const avgTime = totalTime / events.length;

    const validationScores = events
      .filter((e) => e.validationScore !== undefined)
      .map((e) => e.validationScore as number);
    const avgValidationScore = validationScores.length > 0
      ? validationScores.reduce((sum, score) => sum + score, 0) / validationScores.length
      : 0;

    return {
      totalGenerations: events.length,
      successfulGenerations: successful,
      failedGenerations: failed,
      averageGenerationTime: Math.round(avgTime),
      simpleAppCount: simple,
      complexAppCount: complex,
      withDesignSystemCount: withDesign,
      averageValidationScore: Math.round(avgValidationScore * 100) / 100,
      errorRate: (failed / events.length) * 100,
    };
  }

  /**
   * Clear all events
   */
  clearEvents(): void {
    this.events = [];
    this.saveEvents();
  }

  /**
   * Export events as JSON
   */
  exportAsJSON(): string {
    return JSON.stringify(this.events, null, 2);
  }

  /**
   * Export events as CSV
   */
  exportAsCSV(): string {
    if (this.events.length === 0) {
      return 'No events to export';
    }

    const headers = [
      'ID',
      'Timestamp',
      'App Type',
      'Prompt Length',
      'Has Design System',
      'Generation Time (ms)',
      'Status',
      'Validation Score',
    ];

    const rows = this.events.map((event) => [
      event.id,
      new Date(event.timestamp).toISOString(),
      event.appType,
      event.promptLength,
      event.hasDesignAnswers ? 'Yes' : 'No',
      event.generationTime,
      event.statusCode,
      event.validationScore ?? 'N/A',
    ]);

    return [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');
  }
}

// Global instance
export const analyticsTracker = new AnalyticsTracker();

/**
 * Get formatted metrics for display
 */
export function formatMetricsForDisplay(metrics: AnalyticsMetrics): {
  success_rate: string;
  avg_time: string;
  total_gens: number;
  design_adoption: string;
  avg_quality: string;
} {
  return {
    success_rate: `${Math.round(((metrics.successfulGenerations / metrics.totalGenerations) * 100) || 0)}%`,
    avg_time: `${Math.round(metrics.averageGenerationTime / 1000)}s`,
    total_gens: metrics.totalGenerations,
    design_adoption: `${Math.round(((metrics.withDesignSystemCount / metrics.totalGenerations) * 100) || 0)}%`,
    avg_quality: `${Math.round(metrics.averageValidationScore)}/100`,
  };
}
