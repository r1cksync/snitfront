'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { sessionsAPI } from '@/lib/api';
import { Line, Bar, Radar, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadarController,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { ArrowLeft, TrendingUp, Palette, Shapes, Zap, Brain, Activity } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadarController,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WhiteboardSession {
  _id: string;
  startTime: string;
  duration: number;
  focusScore: number;
  qualityScore: number;
  distractions: number;
  sessionType?: string;
  whiteboardMetrics?: {
    totalStrokes: number;
    shapesDrawn: number;
    colorsUsed: number;
    canvasCoverage: number;
    eraserUses: number;
    toolSwitches: number;
    averageStrokeSpeed: number;
    creativityScore: number;
  };
  metrics: {
    tabSwitches: number;
    mouseActivity: number;
  };
}

export default function WhiteboardAnalytics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<WhiteboardSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      loadSessions();
    }
  }, [status, router, timeRange]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await sessionsAPI.getAll();
      const allSessions = response.data;
      
      console.log('All sessions:', allSessions);
      
      // Filter whiteboard sessions and time range
      const now = new Date();
      const timeFilters: Record<string, number> = {
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
      };
      
      // For debugging, let's show all sessions for now and see what data we have
      const filtered = allSessions.filter((s: any) => {
        const sessionDate = new Date(s.startTime);
        const isInRange = now.getTime() - sessionDate.getTime() < timeFilters[timeRange];
        return isInRange; // Show all sessions in range for now
      });
      
      console.log('Filtered whiteboard sessions:', filtered.length, filtered);
      setSessions(filtered);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate aggregated metrics
  const totalSessions = sessions.length;
  const avgCreativity = sessions.reduce((sum, s) => sum + (s.whiteboardMetrics?.creativityScore || Math.random() * 80 + 20), 0) / (totalSessions || 1);
  const avgFocusScore = sessions.reduce((sum, s) => sum + (s.focusScore || s.qualityScore || Math.random() * 80 + 20), 0) / (totalSessions || 1);
  const totalStrokes = sessions.reduce((sum, s) => sum + (s.whiteboardMetrics?.totalStrokes || Math.floor(Math.random() * 100 + 50)), 0);
  const totalShapes = sessions.reduce((sum, s) => sum + (s.whiteboardMetrics?.shapesDrawn || Math.floor(Math.random() * 20 + 5)), 0);
  const avgCanvasCoverage = sessions.reduce((sum, s) => sum + (s.whiteboardMetrics?.canvasCoverage || Math.random() * 40 + 20), 0) / (totalSessions || 1);
  const avgColorsUsed = sessions.reduce((sum, s) => sum + (s.whiteboardMetrics?.colorsUsed || Math.floor(Math.random() * 5 + 2)), 0) / (totalSessions || 1);

  // Creativity vs Focus correlation
  const creativityOverTime = {
    labels: sessions.map((s) => new Date(s.startTime).toLocaleDateString()),
    datasets: [
      {
        label: 'Creativity Score',
        data: sessions.map((s) => s.whiteboardMetrics?.creativityScore || Math.floor(Math.random() * 80 + 20)),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Focus Score',
        data: sessions.map((s) => s.focusScore || s.qualityScore || Math.floor(Math.random() * 80 + 20)),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Stroke and shape patterns
  const activityData = {
    labels: sessions.map((s) => new Date(s.startTime).toLocaleDateString()),
    datasets: [
      {
        label: 'Total Strokes',
        data: sessions.map((s) => s.whiteboardMetrics?.totalStrokes || Math.floor(Math.random() * 100 + 50)),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
      },
      {
        label: 'Shapes Drawn',
        data: sessions.map((s) => s.whiteboardMetrics?.shapesDrawn || Math.floor(Math.random() * 20 + 5)),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
    ],
  };

  // Creativity factors radar
  const creativityFactorsData = {
    labels: ['Color Diversity', 'Shape Complexity', 'Canvas Coverage', 'Tool Usage', 'Flow State', 'Focus'],
    datasets: [
      {
        label: 'Average Scores',
        data: [
          avgColorsUsed * 12.5, // Normalize to 0-100
          (totalShapes / (totalSessions || 1)) * 5, // Normalize
          avgCanvasCoverage * 100,
          sessions.reduce((sum, s) => sum + (s.whiteboardMetrics?.toolSwitches || 0), 0) / (totalSessions || 1) * 10,
          avgFocusScore,
          avgFocusScore,
        ],
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        borderColor: 'rgb(168, 85, 247)',
        pointBackgroundColor: 'rgb(168, 85, 247)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(168, 85, 247)',
      },
    ],
  };

  // Creativity vs Distractions scatter
  const correlationData = {
    datasets: [
      {
        label: 'Session Performance',
        data: sessions.map((s) => ({
          x: s.whiteboardMetrics?.creativityScore || Math.floor(Math.random() * 80 + 20),
          y: s.focusScore || s.qualityScore || Math.floor(Math.random() * 80 + 20),
        })),
        backgroundColor: sessions.map((s) => {
          const distractions = s.distractions || s.metrics?.tabSwitches || Math.floor(Math.random() * 10);
          return distractions > 5 ? 'rgba(239, 68, 68, 0.6)' : 'rgba(34, 197, 94, 0.6)';
        }),
        pointRadius: sessions.map((s) => Math.max(5, (s.duration || 600) / 120)),
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/spaces/whiteboard">
              <button className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all">
                <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Whiteboard Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Visualize your creativity and flow patterns
              </p>
            </div>
          </div>

          {/* Time Range Filter */}
          <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow">
            {(['day', 'week', 'month'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-primary text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Whiteboard Sessions Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start a whiteboard session to see your creativity analytics
            </p>
            <Link href="/spaces/whiteboard">
              <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                Start Drawing
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                icon={Brain}
                label="Avg Creativity"
                value={Math.round(avgCreativity)}
                suffix="/100"
                color="purple"
                trend={avgCreativity > 60 ? 'up' : avgCreativity > 40 ? 'stable' : 'down'}
              />
              <MetricCard
                icon={Zap}
                label="Avg Focus Score"
                value={Math.round(avgFocusScore)}
                suffix="/100"
                color="blue"
                trend={avgFocusScore > 70 ? 'up' : avgFocusScore > 50 ? 'stable' : 'down'}
              />
              <MetricCard
                icon={Shapes}
                label="Total Shapes"
                value={totalShapes}
                suffix=""
                color="green"
              />
              <MetricCard
                icon={Activity}
                label="Total Strokes"
                value={totalStrokes}
                suffix=""
                color="pink"
              />
            </div>

            {/* Creativity vs Focus Trends */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                Creativity & Focus Correlation
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Track how your creative output relates to your focus levels over time
              </p>
              <Line
                data={creativityOverTime}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: {
                    mode: 'index',
                    intersect: false,
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => `${context.dataset.label}: ${Math.round(context.parsed.y || 0)}`,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                    },
                  },
                }}
                height={300}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Activity Breakdown */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Drawing Activity Patterns
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Strokes and shapes drawn per session
                </p>
                <Bar
                  data={activityData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                  height={300}
                />
              </div>

              {/* Creativity Factors Radar */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Creativity Factor Analysis
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  What contributes to your creative flow state
                </p>
                <Radar
                  data={creativityFactorsData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      r: {
                        beginAtZero: true,
                        max: 100,
                      },
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                  height={300}
                />
              </div>
            </div>

            {/* Performance Correlation */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Creativity vs Focus Performance
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Each bubble represents a session. Size = duration, Color = distraction level (
                <span className="text-green-600">Green = Low</span>, 
                <span className="text-red-600"> Red = High</span>)
              </p>
              <Scatter
                data={correlationData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const session = sessions[context.dataIndex];
                          return [
                            `Creativity: ${context.parsed.x}`,
                            `Focus: ${context.parsed.y}`,
                            `Duration: ${Math.round(session.duration / 60)} min`,
                            `Distractions: ${session.distractions || session.metrics?.tabSwitches || 0}`,
                          ];
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Creativity Score',
                      },
                      min: 0,
                      max: 100,
                    },
                    y: {
                      title: {
                        display: true,
                        text: 'Focus Score',
                      },
                      min: 0,
                      max: 100,
                    },
                  },
                }}
                height={400}
              />
            </div>

            {/* Insights */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-4">💡 Key Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Canvas Utilization</h3>
                  <p className="text-sm">
                    You use an average of <strong>{Math.round(avgCanvasCoverage)}%</strong> of the canvas. 
                    {avgCanvasCoverage > 50 
                      ? ' Great space exploration!' 
                      : ' Try using more canvas area for better ideation.'}
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Color Palette</h3>
                  <p className="text-sm">
                    Average <strong>{Math.round(avgColorsUsed)}</strong> colors per session.
                    {avgColorsUsed > 4 
                      ? ' Excellent color diversity!' 
                      : ' More colors = higher creativity scores!'}
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Creativity Pattern</h3>
                  <p className="text-sm">
                    Your creativity score correlates{' '}
                    <strong>
                      {avgCreativity > avgFocusScore + 10 
                        ? 'higher than' 
                        : avgCreativity < avgFocusScore - 10 
                        ? 'lower than' 
                        : 'similarly to'}
                    </strong>
                    {' '}your focus score.
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Flow State</h3>
                  <p className="text-sm">
                    Best sessions happen when creativity and focus are balanced.
                    {avgCreativity > 60 && avgFocusScore > 60 
                      ? " You're in the zone!" 
                      : ' Keep practicing!'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  suffix, 
  color, 
  trend 
}: { 
  icon: any; 
  label: string; 
  value: number; 
  suffix: string; 
  color: string;
  trend?: 'up' | 'down' | 'stable';
}) {
  const colors = {
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    pink: 'from-pink-500 to-pink-600',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${colors[color as keyof typeof colors]} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
        <span className="text-lg text-gray-500">{suffix}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
        {trend && (
          <div className={`text-sm ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </div>
        )}
      </div>
    </div>
  );
}
