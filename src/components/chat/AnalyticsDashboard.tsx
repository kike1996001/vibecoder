import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Clock,
  Zap,
  CheckCircle2,
  AlertCircle,
  Download,
  RefreshCw,
  BarChart3,
} from 'lucide-react';
import { analyticsTracker, AnalyticsMetrics, formatMetricsForDisplay } from '@/services/analyticsService';

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  color: 'violet' | 'emerald' | 'blue' | 'orange' | 'pink';
  delay: number;
}

/**
 * Metric Card Component
 */
const MetricCard: React.FC<MetricCardProps> = ({
  icon: Icon,
  title,
  value,
  unit,
  trend,
  color,
  delay,
}) => {
  const colorClasses: Record<string, { bg: string; icon: string; text: string }> = {
    violet: {
      bg: 'bg-violet-500/10',
      icon: 'text-violet-400',
      text: 'text-violet-300',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      icon: 'text-emerald-400',
      text: 'text-emerald-300',
    },
    blue: {
      bg: 'bg-blue-500/10',
      icon: 'text-blue-400',
      text: 'text-blue-300',
    },
    orange: {
      bg: 'bg-orange-500/10',
      icon: 'text-orange-400',
      text: 'text-orange-300',
    },
    pink: {
      bg: 'bg-pink-500/10',
      icon: 'text-pink-400',
      text: 'text-pink-300',
    },
  };

  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`${colors.bg} rounded-lg border border-white/[0.12] p-4`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-lg bg-white/[0.05] ${colors.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`text-[10px] font-semibold ${colors.text}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </div>
        )}
      </div>

      <p className="text-[11px] text-white/50 mb-1">{title}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-white">{value}</span>
        {unit && <span className="text-[11px] text-white/40">{unit}</span>}
      </div>
    </motion.div>
  );
};

/**
 * Analytics Dashboard Component
 */
interface AnalyticsDashboardProps {
  isVisible: boolean;
  onClose?: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ isVisible, onClose }) => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [displayMetrics, setDisplayMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      refreshMetrics();
    }
  }, [isVisible]);

  const refreshMetrics = () => {
    setIsLoading(true);
    setTimeout(() => {
      const recentEvents = analyticsTracker.getRecentEvents(7);
      const calculatedMetrics = analyticsTracker.calculateMetrics(recentEvents);
      setMetrics(calculatedMetrics);
      setDisplayMetrics(formatMetricsForDisplay(calculatedMetrics));
      setIsLoading(false);
    }, 300);
  };

  const handleExportJSON = () => {
    const data = analyticsTracker.exportAsJSON();
    downloadFile(data, 'analytics.json', 'application/json');
  };

  const handleExportCSV = () => {
    const data = analyticsTracker.exportAsCSV();
    downloadFile(data, 'analytics.csv', 'text/csv');
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isVisible || !metrics || !displayMetrics) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="w-full max-w-4xl mx-auto mb-4"
    >
      <div className="rounded-lg border border-white/[0.12] bg-white/[0.02] backdrop-blur p-6 space-y-6">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <BarChart3 className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Analytics Dashboard</h3>
              <p className="text-[11px] text-white/50">Last 7 days</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={refreshMetrics}
              disabled={isLoading}
              className="p-2 rounded-lg border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] transition-colors disabled:opacity-50"
              title="Refresh metrics"
            >
              <motion.div animate={isLoading ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}>
                <RefreshCw className="w-4 h-4 text-white/60" />
              </motion.div>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-[11px] text-white/60"
              >
                Close
              </button>
            )}
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <MetricCard
            icon={Zap}
            title="Total Generations"
            value={displayMetrics.total_gens}
            trend="up"
            color="violet"
            delay={0.15}
          />

          <MetricCard
            icon={CheckCircle2}
            title="Success Rate"
            value={displayMetrics.success_rate}
            trend={metrics.errorRate < 10 ? 'up' : 'down'}
            color="emerald"
            delay={0.2}
          />

          <MetricCard
            icon={Clock}
            title="Avg Generation"
            value={displayMetrics.avg_time}
            trend="neutral"
            color="blue"
            delay={0.25}
          />

          <MetricCard
            icon={TrendingUp}
            title="Design Adoption"
            value={displayMetrics.design_adoption}
            trend="up"
            color="orange"
            delay={0.3}
          />

          <MetricCard
            icon={BarChart3}
            title="Avg Quality Score"
            value={displayMetrics.avg_quality}
            trend={metrics.averageValidationScore >= 75 ? 'up' : 'neutral'}
            color="pink"
            delay={0.35}
          />
        </div>

        {/* Detailed Stats */}
        <motion.div
          className="grid grid-cols-3 gap-3 pt-4 border-t border-white/[0.06]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="space-y-1">
            <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Simple Apps</p>
            <p className="text-2xl font-bold text-emerald-400">{metrics.simpleAppCount}</p>
            <p className="text-[10px] text-white/40">
              {metrics.totalGenerations > 0
                ? Math.round((metrics.simpleAppCount / metrics.totalGenerations) * 100)
                : 0}
              % of total
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Complex Apps</p>
            <p className="text-2xl font-bold text-violet-400">{metrics.complexAppCount}</p>
            <p className="text-[10px] text-white/40">
              {metrics.totalGenerations > 0
                ? Math.round((metrics.complexAppCount / metrics.totalGenerations) * 100)
                : 0}
              % of total
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Errors</p>
            <p className={`text-2xl font-bold ${metrics.failedGenerations > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {metrics.failedGenerations}
            </p>
            <p className="text-[10px] text-white/40">
              {metrics.errorRate.toFixed(1)}
              % error rate
            </p>
          </div>
        </motion.div>

        {/* Export Options */}
        <motion.div
          className="flex gap-2 pt-4 border-t border-white/[0.06]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          <button
            onClick={handleExportJSON}
            className="flex-1 px-3 py-2 rounded-lg border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] transition-colors flex items-center justify-center gap-2 text-[11px] text-white/60 hover:text-white/80"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>

          <button
            onClick={handleExportCSV}
            className="flex-1 px-3 py-2 rounded-lg border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] transition-colors flex items-center justify-center gap-2 text-[11px] text-white/60 hover:text-white/80"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            onClick={() => analyticsTracker.clearEvents()}
            className="flex-1 px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2 text-[11px] text-red-400/60 hover:text-red-400"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Clear Data
          </button>
        </motion.div>

        {/* Info */}
        <motion.div
          className="text-[10px] text-white/40 text-center pt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Data stored locally • Last 100 events tracked
        </motion.div>
      </div>
    </motion.div>
  );
};
