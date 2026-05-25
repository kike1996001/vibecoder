import { useEffect, useState, useCallback } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  plan: 'free' | 'discover' | 'pro' | 'enterprise';
  credits: number;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth on mount
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("[useAuth] Initializing auth...");
        // Get current session
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        console.log("[useAuth] Current session:", currentSession ? "EXISTS" : "NULL");

        if (mounted) {
          setSession(currentSession);

          // If there's a session, fetch user profile
          if (currentSession?.user) {
            const userData = mapSupabaseUserToAppUser(currentSession.user);
            console.log("[useAuth] User profile loaded:", userData.email);
            setUser(userData);
          }
        }
      } catch (err) {
        console.error('[useAuth] Auth initialization error:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Auth error');
        }
      } finally {
        if (mounted) {
          console.log("[useAuth] Auth initialization complete");
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;

      console.log('[useAuth] Auth state changed:', event, "Session:", currentSession ? "EXISTS" : "NULL");
      setSession(currentSession);

      if (currentSession?.user) {
        const userData = mapSupabaseUserToAppUser(currentSession.user);
        setUser(userData);
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      setError(message);
      throw err;
    }
  }, []);

  const getAuthToken = useCallback(() => {
    return session?.access_token || null;
  }, [session?.access_token]);

  return {
    user,
    session,
    isLoading,
    error,
    isAuthenticated: !!user && !!session,
    signOut,
    getAuthToken,
  };
}

/**
 * Map Supabase user to app user model
 */
function mapSupabaseUserToAppUser(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
    avatar: supabaseUser.user_metadata?.avatar_url,
    plan: supabaseUser.user_metadata?.plan || 'free',
    credits: supabaseUser.user_metadata?.credits || 100,
  };
}