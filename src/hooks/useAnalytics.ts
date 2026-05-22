import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';

export function useAnalytics() {
  const { user } = useAuth();
  const sessionIdRef = useRef<string | null>(null);

  // Initialize session ID on mount
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('analytics_session_id', sessionIdRef.current);
    }
  }, []);

  const getSessionId = useCallback(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = localStorage.getItem('analytics_session_id') || 
        `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return sessionIdRef.current;
  }, []);

  const trackEvent = useCallback(async (eventName: string, eventType: string, data?: any) => {
    if (!user?.id) return;

    try {
      await fetch(`${import.meta.env.VITE_API_URL || window.location.origin}/api/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token') || ''}`,
        },
        body: JSON.stringify({
          eventName,
          eventType,
          data: data || {},
          sessionId: getSessionId(),
        }),
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
      // Fail silently - don't break the app
    }
  }, [user?.id, getSessionId]);

  const trackPageView = useCallback((page: string) => {
    trackEvent('page_viewed', 'page_view', { page, referrer: document.referrer });
  }, [trackEvent]);

  const trackGeneration = useCallback((template: string, provider: string, success: boolean) => {
    trackEvent('app_generated', 'generation', { template, provider, success });
  }, [trackEvent]);

  const trackInteraction = useCallback((action: string, target: string) => {
    trackEvent('user_interaction', 'interaction', { action, target });
  }, [trackEvent]);

  const trackError = useCallback((errorMessage: string, context?: string) => {
    trackEvent('error_occurred', 'error', { errorMessage, context });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackGeneration,
    trackInteraction,
    trackError,
    sessionId: getSessionId(),
  };
}
