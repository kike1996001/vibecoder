import { supabase } from './supabaseClient.js';

export interface AnalyticsEvent {
  userId: string;
  eventName: string;
  eventType: 'generation' | 'interaction' | 'error' | 'conversion' | 'page_view';
  data?: Record<string, any>;
  timestamp?: string;
  sessionId?: string;
  metadata?: {
    template?: string;
    provider?: string;
    appType?: string;
    duration?: number;
    credits?: number;
    [key: string]: any;
  };
}

/**
 * Track analytics events
 * Stores in Supabase analytics_events table
 */
export async function trackEvent(event: AnalyticsEvent) {
  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .insert([
        {
          user_id: event.userId,
          event_name: event.eventName,
          event_type: event.eventType,
          data: event.data || {},
          timestamp: event.timestamp || new Date().toISOString(),
          session_id: event.sessionId || generateSessionId(),
          metadata: event.metadata || {},
        },
      ]);

    if (error) {
      console.error('Analytics tracking error:', error);
      // Don't throw - tracking should be non-blocking
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Analytics tracking failed:', error);
    return { success: false, error };
  }
}

/**
 * Track app generation event
 */
export async function trackGeneration(userId: string, params: {
  template: string;
  provider: string;
  appType: 'web' | 'mobile';
  creditsUsed: number;
  duration: number;
  success: boolean;
  sessionId?: string;
}) {
  return trackEvent({
    userId,
    eventName: 'app_generated',
    eventType: 'generation',
    data: {
      success: params.success,
      template: params.template,
    },
    sessionId: params.sessionId,
    metadata: {
      template: params.template,
      provider: params.provider,
      appType: params.appType,
      creditsUsed: params.creditsUsed,
      duration: params.duration,
    },
  });
}

/**
 * Track page views
 */
export async function trackPageView(userId: string, params: {
  page: string;
  referrer?: string;
  sessionId?: string;
}) {
  return trackEvent({
    userId,
    eventName: 'page_viewed',
    eventType: 'page_view',
    data: {
      page: params.page,
      referrer: params.referrer || document.referrer,
    },
    sessionId: params.sessionId,
  });
}

/**
 * Track user interactions (clicks, forms, etc)
 */
export async function trackInteraction(userId: string, params: {
  action: string;
  target: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}) {
  return trackEvent({
    userId,
    eventName: 'user_interaction',
    eventType: 'interaction',
    data: {
      action: params.action,
      target: params.target,
    },
    sessionId: params.sessionId,
    metadata: params.metadata,
  });
}

/**
 * Track errors
 */
export async function trackError(userId: string, params: {
  errorMessage: string;
  errorType?: string;
  context?: string;
  sessionId?: string;
}) {
  return trackEvent({
    userId,
    eventName: 'error_occurred',
    eventType: 'error',
    data: {
      errorMessage: params.errorMessage,
      errorType: params.errorType,
      context: params.context,
    },
    sessionId: params.sessionId,
  });
}

/**
 * Track conversions (purchases, etc)
 */
export async function trackConversion(userId: string, params: {
  conversionType: string;
  value: number;
  currency?: string;
  sessionId?: string;
}) {
  return trackEvent({
    userId,
    eventName: 'conversion',
    eventType: 'conversion',
    data: {
      conversionType: params.conversionType,
      value: params.value,
      currency: params.currency || 'USD',
    },
    sessionId: params.sessionId,
  });
}

/**
 * Get event analytics for user
 */
export async function getUserAnalytics(userId: string, params: {
  days?: number;
  eventType?: string;
} = {}) {
  try {
    const days = params.days || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    let query = supabase
      .from('analytics_events')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false });

    if (params.eventType) {
      query = query.eq('event_type', params.eventType);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Aggregate statistics
    const stats = {
      totalEvents: data?.length || 0,
      eventsByType: {} as Record<string, number>,
      eventsByName: {} as Record<string, number>,
      uniqueDays: new Set<string>(),
    };

    data?.forEach(event => {
      stats.eventsByType[event.event_type] = (stats.eventsByType[event.event_type] || 0) + 1;
      stats.eventsByName[event.event_name] = (stats.eventsByName[event.event_name] || 0) + 1;
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      stats.uniqueDays.add(date);
    });

    return {
      success: true,
      data,
      stats: {
        ...stats,
        uniqueDays: stats.uniqueDays.size,
      },
    };
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return { success: false, error };
  }
}

/**
 * Get conversion funnel analytics
 */
export async function getConversionFunnel(userId: string) {
  try {
    const days = 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startDate.toISOString())
      .in('event_type', ['page_view', 'interaction', 'generation', 'conversion']);

    if (error) throw error;

    // Calculate conversion funnel
    const funnel = {
      pageViews: 0,
      interactions: 0,
      generations: 0,
      conversions: 0,
      conversionRate: 0,
    };

    data?.forEach(event => {
      if (event.event_type === 'page_view') funnel.pageViews++;
      if (event.event_type === 'interaction') funnel.interactions++;
      if (event.event_type === 'generation') funnel.generations++;
      if (event.event_type === 'conversion') funnel.conversions++;
    });

    funnel.conversionRate = funnel.pageViews > 0 ? (funnel.conversions / funnel.pageViews) * 100 : 0;

    return { success: true, funnel };
  } catch (error) {
    console.error('Error calculating conversion funnel:', error);
    return { success: false, error };
  }
}

/**
 * Session ID generator (simple version, should be stored in client)
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createSessionId(): string {
  return generateSessionId();
}
