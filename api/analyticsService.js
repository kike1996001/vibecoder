import { supabase } from './supabaseClient.js';

/**
 * Track analytics events
 * Stores in Supabase analytics_events table
 */
export async function trackEvent(event) {
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
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Analytics tracking failed:', error);
    return { success: false, error };
  }
}

function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
