'use client';

import { useState, useEffect } from 'react';
import { Code, Activity, Clock, TrendingUp, Brain, Zap, GitBranch, FileCode, BarChart3, Eye, Flame, Target } from 'lucide-react';
import { sessionsAPI } from '@/lib/api';

interface CodeMetrics {
  totalSessions: number;
  totalCodingTime: number;
  averageSessionTime: number;
  languageBreakdown: { [key: string]: number };
  focusScore: number;
  productivityTrend: number[];
  peakHours: { hour: number; sessions: number }[];
  distractionEvents: number;
  deepWorkSessions: number;
}

export default function CodeAnalytics() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<CodeMetrics | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await sessionsAPI.getAll({ limit: 100 });
      const allSessions = response.data.sessions || [];
      
      // Filter by time range
      const now = new Date();
      const filtered = allSessions.filter((session: any) => {
        const sessionDate = new Date(session.createdAt || session.timestamp);
        const diffDays = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (timeRange === 'day') return diffDays === 0;
        if (timeRange === 'week') return diffDays < 7;
        if (timeRange === 'month') return diffDays < 30;
        return true;
      });

      setSessions(filtered);
      calculateMetrics(filtered);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (sessions: any[]) => {
    console.log('📊 Calculating metrics for sessions:', sessions.length);
    console.log('Sample session data:', sessions[0]);
    
    // Language breakdown
    const languageBreakdown: { [key: string]: number } = {};
    let totalCodingTime = 0;
    let totalFocusScore = 0;
    let distractionEvents = 0;
    let deepWorkSessions = 0;

    // Peak hours analysis
    const hourlyActivity: { [key: number]: number } = {};
    for (let i = 0; i < 24; i++) hourlyActivity[i] = 0;

    sessions.forEach((session: any) => {
      // Language tracking - use language field or default to javascript
      const lang = session.language || 'javascript';
      languageBreakdown[lang] = (languageBreakdown[lang] || 0) + 1;

      // Time tracking
      if (session.duration) {
        totalCodingTime += session.duration;
      }

      // Focus score - check both focusScore and qualityScore
      const score = session.focusScore ?? session.qualityScore ?? 0;
      if (score > 0) {
        totalFocusScore += score;
        if (score >= 80) deepWorkSessions++;
      }

      // Distraction tracking - use distractions or tabSwitches from metrics
      const distractions = session.distractions ?? session.metrics?.tabSwitches ?? 0;
      distractionEvents += distractions;

      // Peak hours
      const hour = new Date(session.createdAt || session.timestamp || session.startTime).getHours();
      hourlyActivity[hour]++;
    });

    console.log('📈 Calculated metrics:', {
      totalSessions: sessions.length,
      totalCodingTime,
      avgFocusScore: sessions.length ? totalFocusScore / sessions.length : 0,
      languageBreakdown,
      distractionEvents,
      deepWorkSessions,
    });

    // Calculate peak hours
    const peakHours = Object.entries(hourlyActivity)
      .map(([hour, count]) => ({ hour: parseInt(hour), sessions: count }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 5);

    // Productivity trend (last 7 days)
    const productivityTrend: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const daySessions = sessions.filter((s: any) => {
        const sessionDate = new Date(s.createdAt || s.timestamp || s.startTime);
        return sessionDate.toDateString() === date.toDateString();
      });
      const dayScore = daySessions.reduce((sum: number, s: any) => {
        const score = s.focusScore ?? s.qualityScore ?? 0;
        return sum + score;
      }, 0) / (daySessions.length || 1);
      productivityTrend.push(Math.round(dayScore));
    }

    setMetrics({
      totalSessions: sessions.length,
      totalCodingTime,
      averageSessionTime: sessions.length ? totalCodingTime / sessions.length : 0,
      languageBreakdown,
      focusScore: sessions.length ? totalFocusScore / sessions.length : 0,
      productivityTrend,
      peakHours,
      distractionEvents,
      deepWorkSessions,
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      javascript: 'bg-yellow-500',
      typescript: 'bg-blue-500',
      python: 'bg-green-500',
      java: 'bg-red-500',
      cpp: 'bg-purple-500',
      go: 'bg-cyan-500',
      rust: 'bg-orange-500',
      ruby: 'bg-pink-500',
    };
    return colors[language.toLowerCase()] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <Code className="w-10 h-10 text-blue-600" />
                Code Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Deep insights into your coding patterns and productivity
              </p>
            </div>
            <div className="flex gap-2">
              {(['day', 'week', 'month'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    timeRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-blue-600" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Time</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {formatTime(metrics?.totalCodingTime || 0)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Across {metrics?.totalSessions || 0} sessions
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Brain className="w-8 h-8 text-purple-600" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Focus Score</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {Math.round(metrics?.focusScore || 0)}%
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Average concentration
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Flame className="w-8 h-8 text-orange-600" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Deep Work</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {metrics?.deepWorkSessions || 0}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              High-focus sessions (80%+)
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Eye className="w-8 h-8 text-red-600" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Distractions</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {metrics?.distractionEvents || 0}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Attention breaks detected
            </p>
          </div>
        </div>

        {/* Language Breakdown & Productivity Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Language Heatmap */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileCode className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Language Distribution
              </h2>
            </div>
            <div className="space-y-4">
              {Object.entries(metrics?.languageBreakdown || {})
                .sort((a, b) => b[1] - a[1])
                .map(([language, count]) => {
                  const total = Object.values(metrics?.languageBreakdown || {}).reduce((a, b) => a + b, 0);
                  const percentage = (count / total) * 100;
                  return (
                    <div key={language}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {language}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {count} sessions ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full ${getLanguageColor(language)} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              {Object.keys(metrics?.languageBreakdown || {}).length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No language data available
                </p>
              )}
            </div>
          </div>

          {/* Productivity Trend */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                7-Day Focus Trend
              </h2>
            </div>
            <div className="space-y-3">
              {metrics?.productivityTrend.map((score, index) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - index));
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                
                return (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-12">
                      {dayName}
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 flex items-center justify-end pr-2 ${
                          score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${score}%` }}
                      >
                        <span className="text-xs font-bold text-white">{score}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Peak Coding Hours Heatmap */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Peak Coding Hours
            </h2>
          </div>
          <div className="grid grid-cols-12 gap-2">
            {Array.from({ length: 24 }, (_, hour) => {
              const activity = metrics?.peakHours.find(p => p.hour === hour);
              const sessions = activity?.sessions || 0;
              const maxSessions = Math.max(...(metrics?.peakHours.map(p => p.sessions) || [1]));
              const intensity = sessions / maxSessions;
              
              return (
                <div
                  key={hour}
                  className="relative group"
                  title={`${hour}:00 - ${sessions} sessions`}
                >
                  <div
                    className={`aspect-square rounded transition-all duration-300 ${
                      intensity > 0.7
                        ? 'bg-blue-600'
                        : intensity > 0.4
                        ? 'bg-blue-400'
                        : intensity > 0.1
                        ? 'bg-blue-200 dark:bg-blue-800'
                        : 'bg-gray-200 dark:bg-gray-700'
                    } hover:scale-110`}
                  />
                  <div className="text-xs text-center mt-1 text-gray-600 dark:text-gray-400">
                    {hour}
                  </div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {hour}:00 - {sessions} sessions
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attention Heatmap Correlation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Focus vs Code Complexity Correlation
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {Math.round((metrics?.deepWorkSessions || 0) / (metrics?.totalSessions || 1) * 100)}%
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">High Focus Rate</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Sessions with 80%+ focus</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {formatTime(metrics?.averageSessionTime || 0)}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Avg Session Time</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Mean coding duration</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {((metrics?.distractionEvents || 0) / (metrics?.totalSessions || 1)).toFixed(1)}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Distractions/Session</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Average interruptions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
