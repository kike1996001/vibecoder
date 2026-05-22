import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Zap, Calendar } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: 'trend-up' | 'trend-down' | 'zap' | 'calendar';
  trend?: number; // percentage change
  color?: 'blue' | 'purple' | 'green' | 'orange';
}

export function StatCard({
  title,
  value,
  subtitle,
  icon = 'zap',
  trend,
  color = 'blue',
}: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    green: 'bg-green-50 text-green-700',
    orange: 'bg-orange-50 text-orange-700',
  };

  const iconMap = {
    'trend-up': <TrendingUp className="w-5 h-5" />,
    'trend-down': <TrendingDown className="w-5 h-5" />,
    'zap': <Zap className="w-5 h-5" />,
    'calendar': <Calendar className="w-5 h-5" />,
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            {iconMap[icon]}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        {trend !== undefined && (
          <div className={`text-sm mt-2 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
          </div>
        )}
      </CardContent>
    </Card>
  );
}
