import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Auth } from "./pages/Auth";
import { Home } from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";
import { Workspace } from "./pages/Workspace";
import { Projects } from "./pages/Projects";
import { Settings } from "./pages/Settings";
import { Billing } from "./pages/Billing";

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 35,
  mass: 0.8,
};

export function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="space-y-3 text-center">
          <svg className="animate-spin h-12 w-12 mx-auto text-purple-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-400">Loading VibeCoder...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Auth Routes (public) */}
          <Route
            path="/auth"
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <motion.div
                  key="auth"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                >
                  <Auth />
                </motion.div>
              )
            }
          />

          {/* Protected Routes with AppShell layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route
              path="/"
              element={
                <motion.div
                  key="home"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                  className="h-full w-full"
                >
                  <Home />
                </motion.div>
              }
            />
            <Route
              path="/dashboard"
              element={
                <motion.div
                  key="dashboard"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                  className="h-full w-full"
                >
                  <Dashboard />
                </motion.div>
              }
            />
            <Route
              path="/workspace"
              element={
                <motion.div
                  key="workspace"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                  className="h-full w-full"
                >
                  <Workspace />
                </motion.div>
              }
            />
            <Route
              path="/projects"
              element={
                <motion.div
                  key="projects"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                  className="h-full"
                >
                  <Projects />
                </motion.div>
              }
            />
            <Route
              path="/settings"
              element={
                <motion.div
                  key="settings"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                  className="h-full"
                >
                  <Settings />
                </motion.div>
              }
            />
            <Route
              path="/billing"
              element={
                <motion.div
                  key="billing"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                  className="h-full"
                >
                  <Billing />
                </motion.div>
              }
            />
          </Route>

          {/* Catch all - redirect to home or auth */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/auth"} replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}