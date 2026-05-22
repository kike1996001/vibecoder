import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardMetrics, useDashboardTimeline, useDashboardProviders } from '@/hooks/useDashboardMetrics';
import { StatCard } from '@/components/dashboard/StatCard';
import { GenerationsChart, TimelineChart, ProviderChart } from '@/components/dashboard/Charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

export function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Fetch all metrics
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useDashboardMetrics();
  const { data: timeline, isLoading: timelineLoading } = useDashboardTimeline(30);
  const { data: providers, isLoading: providersLoading } = useDashboardProviders();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const isLoading = metricsLoading;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your app generation summary.</p>
        </div>

        {metricsError && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <p className="text-red-700">
                Unable to load metrics. Please try refreshing the page.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Generations"
            value={isLoading ? '—' : metrics?.totalGenerations || 0}
            icon="trend-up"
            color="blue"
            subtitle="Apps created"
          />
          <StatCard
            title="Credits Used"
            value={isLoading ? '—' : metrics?.totalCreditsUsed || 0}
            icon="zap"
            color="purple"
            subtitle="This month"
          />
          <StatCard
            title="Credits Remaining"
            value={isLoading ? '—' : metrics?.creditsRemaining || 0}
            icon="trend-down"
            color="green"
            subtitle="Available balance"
          />
          <StatCard
            title="Estimated Value"
            value={
              isLoading
                ? '—'
                : `$${((metrics?.estimatedValue || 0) / 1000).toFixed(1)}k`
            }
            icon="calendar"
            color="orange"
            subtitle="Dev hours saved"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <GenerationsChart
            data={metrics?.byTemplate || {}}
            loading={isLoading}
          />
          <ProviderChart
            data={providers || {}}
            loading={providersLoading}
          />
        </div>

        {/* Timeline */}
        <div className="mb-8">
          <TimelineChart
            data={timeline || []}
            loading={timelineLoading}
          />
        </div>

        {/* Recent Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Success Rate */}
          <Card>
            <CardHeader>
              <CardTitle>Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-green-600">
                    {isLoading ? '—' : metrics?.successRate || 0}%
                  </p>
                  <p className="text-gray-600 mt-1">Generation success rate</p>
                </div>
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Member Since */}
          <Card>
            <CardHeader>
              <CardTitle>Member Since</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading
                      ? '—'
                      : format(
                          new Date(metrics?.joinedDate || new Date()),
                          'MMM d, yyyy'
                        )}
                  </p>
                  <p className="text-gray-600 mt-1">First generation</p>
                </div>
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-900">
            💡 <strong>Tip:</strong> Keep generating apps to earn rewards! Reach 50 generations
            in a month to unlock premium features.
          </p>
        </div>
      </div>
    </div>
  );
}
