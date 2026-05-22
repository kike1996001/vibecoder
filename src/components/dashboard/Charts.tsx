import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GenerationsChartProps {
  data: Record<string, number>;
  loading?: boolean;
}

const COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
];

export function GenerationsChart({ data, loading }: GenerationsChartProps) {
  const chartData = Object.entries(data).map(([template, count]) => ({
    name: template.charAt(0).toUpperCase() + template.slice(1),
    count,
  }));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Generations by Template</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="animate-pulse">Loading chart...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generations by Template</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface TimelineChartProps {
  data: Array<{
    date: string;
    count: number;
    credits: number;
  }>;
  loading?: boolean;
}

export function TimelineChart({ data, loading }: TimelineChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="animate-pulse">Loading chart...</div>
        </CardContent>
      </Card>
    );
  }

  // Format dates for display
  const formattedData = data.map((item) => {
    const date = new Date(item.date);
    return {
      ...item,
      dateShort: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dateShort" angle={-45} textAnchor="end" height={80} />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Generations"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="credits"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
              name="Credits Used"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface ProviderChartProps {
  data: Record<
    string,
    {
      count: number;
      credits: number;
    }
  >;
  loading?: boolean;
}

export function ProviderChart({ data, loading }: ProviderChartProps) {
  const chartData = Object.entries(data).map(([provider, stats]) => ({
    name: provider.charAt(0).toUpperCase() + provider.slice(1),
    value: stats.count,
  }));

  if (loading || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Provider Usage</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="text-gray-500">No data available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Provider Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
