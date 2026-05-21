import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { getUserCreditsBalance, getCreditHistory } from '../services/stripeService';

export interface CreditHistoryEntry {
  id: string;
  user_id: string;
  amount: number;
  source: 'stripe_payment' | 'generation' | 'admin_grant';
  generation_id?: string;
  stripe_session_id?: string;
  created_at: string;
}

export function useCredits() {
  const { user, getAuthToken } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [history, setHistory] = useState<CreditHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        throw new Error('No auth token available');
      }

      const [balance, historyData] = await Promise.all([
        getUserCreditsBalance(token),
        getCreditHistory(token),
      ]);

      setBalance(balance);
      setHistory(historyData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load credits';
      setError(message);
      console.error('Credits error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    fetchCredits();

    // Refresh every 60 seconds (less frequent to avoid constant loading)
    const interval = setInterval(fetchCredits, 60000);

    // Also refetch when page becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('📊 Page visible, refetching credits...');
        fetchCredits();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id, getAuthToken]);

  return {
    balance,
    history,
    isLoading,
    error,
    refetch: fetchCredits,
  };
}
