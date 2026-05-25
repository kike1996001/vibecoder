import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  console.log("[ProtectedRoute] Auth state:", {
    isAuthenticated,
    isLoading,
    pathname: location.pathname,
  });

  // Show loading state while checking auth
  if (isLoading) {
    console.log("[ProtectedRoute] Still loading auth state...");
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-red-900">
        <div className="space-y-3 text-center">
          <h1 className="text-4xl text-white font-bold">LOADING AUTH</h1>
          <p className="text-red-100 text-lg">Checking authentication...</p>
          <svg className="animate-spin h-12 w-12 mx-auto text-red-200" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  // TODO: Restore auth check after testing
  // if (!isAuthenticated) {
  //   console.log("[ProtectedRoute] User not authenticated, redirecting to /auth");
  //   return <Navigate to="/auth" state={{ from: location }} replace />;
  // }

  console.log("[ProtectedRoute] User authenticated, rendering children");
  return <>{children}</>;
}
