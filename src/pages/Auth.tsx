import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabaseService } from '@/services/supabaseService';
import { AlertCircle, Mail, Lock, User, ArrowRight } from 'lucide-react';

type AuthMode = 'login' | 'signup';

export function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!name) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        await supabaseService.signUp(email, password, { name });
        // After signup, redirect to verify email or auto-login
        // For now, switch to login
        setMode('login');
        setPassword('');
        setError('');
      } else {
        await supabaseService.signIn(email, password);
        // Auth state will update via session listener
        navigate('/');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  const inputVariants = {
    initial: { opacity: 0, x: -20 },
    animate: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="w-full max-w-md"
      >
        <Card className="backdrop-blur-xl bg-slate-900/50 border-slate-700/50 shadow-2xl">
          {/* Header */}
          <div className="px-6 py-8 border-b border-slate-700/50">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-fuchsia-600 to-purple-600 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">V</span>
                </div>
                <span className="text-xl font-bold text-white">VibeCoder</span>
              </div>
              <p className="text-sm text-slate-400">
                {mode === 'login' ? 'Welcome back' : 'Join VibeCoder'}
              </p>
            </motion.div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-8 space-y-4">
            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-900/30 border border-red-700/50 flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </motion.div>
            )}

            {/* Name Field (Signup only) */}
            {mode === 'signup' && (
              <motion.div
                custom={0}
                variants={inputVariants}
                initial="initial"
                animate="animate"
              >
                <label className="text-sm font-medium text-slate-200 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-400" />
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  required
                />
              </motion.div>
            )}

            {/* Email Field */}
            <motion.div
              custom={mode === 'signup' ? 1 : 0}
              variants={inputVariants}
              initial="initial"
              animate="animate"
            >
              <label className="text-sm font-medium text-slate-200 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400" />
                Email
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                required
              />
            </motion.div>

            {/* Password Field */}
            <motion.div
              custom={mode === 'signup' ? 2 : 1}
              variants={inputVariants}
              initial="initial"
              animate="animate"
            >
              <label className="text-sm font-medium text-slate-200 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400" />
                Password
              </label>
              <Input
                type="password"
                placeholder={mode === 'login' ? 'Your password' : 'Min 6 characters'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                required
              />
            </motion.div>

            {/* Submit Button */}
            <motion.div
              custom={mode === 'signup' ? 3 : 2}
              variants={inputVariants}
              initial="initial"
              animate="animate"
              className="pt-2"
            >
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white font-semibold h-10 rounded-lg transition-all"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-700/50 text-center">
            <p className="text-sm text-slate-400">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setError('');
                  setPassword('');
                }}
                className="text-fuchsia-400 hover:text-fuchsia-300 font-semibold transition-colors"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </Card>

        {/* Features Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center text-sm text-slate-400"
        >
          <p>🚀 Generate complete web & mobile apps with AI</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
