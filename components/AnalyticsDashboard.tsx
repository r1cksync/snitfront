'use client';

import { useEffect, useState } from 'react';
import { analyticsAPI } from '@/lib/api';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { TrendingUp, Clock, Target, Zap } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Analytics {
  totalSessions: number;
  totalDuration: number;
  avgDuration: number;
  avgQualityScore: number;
  topTriggers: { trigger: string; count: number }[];
  topBreakers: { breaker: string; count: number }[];
  bestHours: { hour: number; sessions: number; avgQuality: number }[];
  sessionsOverTime: { date: Date; duration: number; quality: number }[];
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.get(period);
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  const sessionChartData = {
    labels: analytics.sessionsOverTime.map((s) =>
      new Date(s.date).toLocaleDateString()
    ),
    datasets: [
      {
        label: 'Duration (minutes)',
        data: analytics.sessionsOverTime.map((s) => s.duration / 60),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Quality Score',
        data: analytics.sessionsOverTime.map((s) => s.quality),
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const bestHoursData = {
    labels: analytics.bestHours.map((h) => `${h.hour}:00`),
    datasets: [
      {
        label: 'Avg Quality Score',
        data: analytics.bestHours.map((h) => h.avgQuality),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Flow Analytics
        </h1>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === p
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<TrendingUp />}
          label="Total Sessions"
          value={analytics.totalSessions.toString()}
          color="text-blue-500"
        />
        <StatCard
          icon={<Clock />}
          label="Total Time"
          value={`${Math.round(analytics.totalDuration / 3600)}h`}
          color="text-green-500"
        />
        <StatCard
          icon={<Target />}
          label="Avg Duration"
          value={`${Math.round(analytics.avgDuration / 60)}m`}
          color="text-purple-500"
        />
        <StatCard
          icon={<Zap />}
          label="Avg Quality"
          value={analytics.avgQualityScore.toFixed(1)}
          color="text-yellow-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Session History
          </h2>
          <Line data={sessionChartData} options={{ responsive: true }} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Best Times for Flow
          </h2>
          <Bar data={bestHoursData} options={{ responsive: true }} />
        </div>
      </div>

      {/* Triggers and Breakers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Top Flow Triggers
          </h2>
          <div className="space-y-3">
            {analytics.topTriggers.map((trigger, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">{trigger.trigger}</span>
                <span className="font-semibold text-primary">{trigger.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Top Flow Breakers
          </h2>
          <div className="space-y-3">
            {analytics.topBreakers.map((breaker, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">{breaker.breaker}</span>
                <span className="font-semibold text-red-500">{breaker.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`${color}`}>{icon}</div>
      </div>
    </div>
  );
}
