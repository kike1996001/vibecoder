import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';

interface MetricsData {
  totalGenerations: number;
  totalCreditsUsed: number;
  creditsRemaining: number;
  byTemplate: Record<string, number>;
  timeline: Array<{
    date: string;
    count: number;
    credits: number;
  }>;
  estimatedValue: number;
  successRate: number;
  joinedDate: string;
}

interface ProviderMetrics {
  [key: string]: {
    count: number;
    credits: number;
  };
}

/**
 * Fetch user's dashboard metrics summary
 */
export function useDashboardMetrics() {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['dashboard', 'metrics', user?.id],
    queryFn: async () => {
      if (!isAuthenticated) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || window.location.origin}/api/metrics/summary`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token') || ''}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }

      const data = await response.json();
      return data.data as MetricsData;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

/**
 * Fetch detailed timeline data
 */
export function useDashboardTimeline(days: number = 30) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['dashboard', 'timeline', days],
    queryFn: async () => {
      if (!isAuthenticated) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || window.location.origin}/api/metrics/timeline?days=${days}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token') || ''}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch timeline');
      }

      const data = await response.json();
      return data.data as Array<{
        date: string;
        count: number;
        credits: number;
        templates: Record<string, number>;
      }>;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

/**
 * Fetch provider usage breakdown
 */
export function useDashboardProviders() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['dashboard', 'providers'],
    queryFn: async () => {
      if (!isAuthenticated) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || window.location.origin}/api/metrics/providers`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token') || ''}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch provider metrics');
      }

      const data = await response.json();
      return data.data as ProviderMetrics;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export type { MetricsData, ProviderMetrics };
