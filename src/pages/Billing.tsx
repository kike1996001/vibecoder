import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCredits } from '../hooks/useCredits';
import {
  CREDIT_PACKAGES,
  startStripeCheckout,
  calculateCreditsNeeded,
} from '../services/stripeService';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertCircle, Check, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../components/ui/toast-notification';

export function Billing() {
  const { user, getAuthToken } = useAuth();
  const { balance, history, isLoading, error, refetch } = useCredits();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Check for payment success/cancellation in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const credits = params.get('credits');

    if (status === 'success' && credits) {
      success(`🎉 Payment successful! ${credits} credits added to your account.`);
      
      // Refetch multiple times to ensure webhook processed payment
      console.log('💳 Payment successful, refetching credits...');
      refetch(); // Immediate refetch
      
      // Retry refetch in case webhook hasn't processed yet
      setTimeout(() => {
        console.log('🔄 Retrying refetch (1/3)...');
        refetch();
      }, 2000);
      
      setTimeout(() => {
        console.log('🔄 Retrying refetch (2/3)...');
        refetch();
      }, 4000);

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === 'cancelled') {
      showError('Payment was cancelled. Please try again.', 5000);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [success, showError, refetch]);

  const handlePurchase = async (packageId: string) => {
    try {
      setIsCheckingOut(packageId);
      setCheckoutError(null);

      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const { sessionUrl } = await startStripeCheckout(
        packageId as 'starter' | 'pro' | 'enterprise',
        token
      );

      // Redirect to Stripe checkout
      window.location.href = sessionUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Checkout failed';
      setCheckoutError(message);
      showError(`Checkout failed: ${message}`, 5000);
      console.error('Checkout error:', err);
    } finally {
      setIsCheckingOut(null);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div className="mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold mb-2">Billing & Credits</h1>
          <p className="text-slate-400">Manage your credit balance and purchase credits</p>
        </motion.div>

        {/* Current Balance Card */}
        <motion.div
          className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item}>
            <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Current Balance</h2>
                <Zap className="text-yellow-400" size={24} />
              </div>
              {isLoading ? (
                <p className="text-slate-400">Loading...</p>
              ) : (
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
                  {balance}
                </div>
              )}
              <p className="text-slate-400 text-sm mt-2">Credits available for generation</p>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Usage This Month</h2>
                <TrendingUp className="text-blue-400" size={24} />
              </div>
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                {history.filter((h) => h.source === 'generation').length}
              </div>
              <p className="text-slate-400 text-sm mt-2">Generations used</p>
            </Card>
          </motion.div>
        </motion.div>

        {/* Error Message */}
        {(error || checkoutError) && (
          <motion.div
            className="mb-8 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AlertCircle className="text-red-400" size={20} />
            <p className="text-red-200">{error || checkoutError}</p>
          </motion.div>
        )}

        {/* Credit Packages */}
        <motion.div className="mb-12" variants={container} initial="hidden" animate="show">
          <h2 className="text-2xl font-bold mb-6">Buy Credits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CREDIT_PACKAGES.map((pkg) => (
              <motion.div
                key={pkg.id}
                variants={item}
                className="relative"
                onMouseEnter={() => setSelectedPackage(pkg.id)}
                onMouseLeave={() => setSelectedPackage(null)}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-400 to-purple-400 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <Card
                  className={`p-6 border-2 transition-all ${
                    selectedPackage === pkg.id
                      ? 'border-violet-500 bg-violet-500/10'
                      : pkg.popular
                        ? 'border-violet-500/50 bg-violet-500/5'
                        : 'border-slate-700 bg-slate-800/50'
                  }`}
                >
                  <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                  <p className="text-slate-400 text-sm mb-4">{pkg.description}</p>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
                        {(pkg.price / 100).toFixed(2)}
                      </span>
                      <span className="text-slate-400">USD</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-2">
                      ${(pkg.price / pkg.credits / 100).toFixed(3)} per credit
                    </p>
                  </div>

                  <div className="mb-6 bg-slate-800/50 rounded-lg p-4">
                    <p className="flex items-center gap-2 text-sm">
                      <Check size={16} className="text-green-400" />
                      <span>
                        <strong>{pkg.credits}</strong> credits
                      </span>
                    </p>
                  </div>

                  <Button
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={isCheckingOut === pkg.id}
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-semibold py-2 rounded-lg transition-all"
                  >
                    {isCheckingOut === pkg.id ? 'Processing...' : `Buy Now`}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={container} initial="hidden" animate="show">
          <h2 className="text-2xl font-bold mb-6">Credit History</h2>
          {history.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700 p-6 text-center">
              <p className="text-slate-400">No credit transactions yet</p>
            </Card>
          ) : (
            <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900/50 border-b border-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold">Date</th>
                      <th className="px-6 py-3 text-left font-semibold">Source</th>
                      <th className="px-6 py-3 text-right font-semibold">Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.slice(0, 10).map((entry, idx) => (
                      <tr
                        key={entry.id}
                        className={idx % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-900/20'}
                      >
                        <td className="px-6 py-3 text-slate-400">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              entry.source === 'stripe_payment'
                                ? 'bg-green-500/20 text-green-300'
                                : entry.source === 'generation'
                                  ? 'bg-orange-500/20 text-orange-300'
                                  : 'bg-blue-500/20 text-blue-300'
                            }`}
                          >
                            {entry.source === 'stripe_payment'
                              ? 'Purchase'
                              : entry.source === 'generation'
                                ? 'Generation'
                                : 'Admin'}
                          </span>
                        </td>
                        <td
                          className={`px-6 py-3 text-right font-semibold ${
                            entry.amount > 0 ? 'text-green-400' : 'text-orange-400'
                          }`}
                        >
                          {entry.amount > 0 ? '+' : ''}{entry.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </motion.div>

        {/* Toast Notifications */}
        <div className="fixed top-0 right-0 pointer-events-none">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="pointer-events-auto mb-2"
            >
              <div
                className={`px-4 py-3 rounded-lg text-white font-medium shadow-lg mx-4 mt-4 ${
                  toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                {toast.message}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default Billing;
