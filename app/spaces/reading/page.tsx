'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useFlowStore } from '@/lib/store';
import { useFlowMonitoring } from '@/hooks/useFlowMonitoring';
import FlowIndicator from '@/components/FlowIndicator';
import InterventionOverlay from '@/components/InterventionOverlay';
import AttentionTracker from '@/components/AttentionTracker';
import { Play, BookOpen, Eye, Clock, MessageSquare } from 'lucide-react';

export default function ReadingSpace() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isInFlow, startFlowSession, endFlowSession, flowScore } = useFlowStore();
  const { startMonitoring, stopMonitoring, currentMetrics } = useFlowMonitoring();
  
  const [content, setContent] = useState(`# The Power of Deep Work

In an age of distraction, the ability to focus deeply has become increasingly rare and valuable. Deep work is the ability to focus without distraction on a cognitively demanding task.

## Why Deep Work Matters

When you work deeply, you enter a state of flow where your mind is fully immersed in the task at hand. This state produces:

1. **Better Quality Work**: Deep focus allows you to produce work at a higher level of quality
2. **Faster Learning**: Intense concentration accelerates skill acquisition
3. **Greater Satisfaction**: Flow states are inherently rewarding

## Cultivating Deep Work

To develop your capacity for deep work:

- **Create Rituals**: Establish consistent routines that signal your brain it's time to focus
- **Minimize Distractions**: Remove or block potential interruptions
- **Track Progress**: Monitor your focus sessions to build the habit
- **Rest Intentionally**: Schedule breaks to maintain sustainable focus

The ability to perform deep work is becoming increasingly valuable in our economy. By cultivating this skill, you position yourself for success in any field.`);
  
  const [readingTime, setReadingTime] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [comprehensionScore, setComprehensionScore] = useState(0);
  const [focusZoneActive, setFocusZoneActive] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    // Calculate reading stats
    const words = content.split(/\s+/).filter(w => w.length > 0).length;
    setWordCount(words);
    setEstimatedTime(Math.ceil(words / 200)); // 200 WPM average
  }, [content]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInFlow) {
      interval = setInterval(() => {
        setReadingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInFlow]);

  useEffect(() => {
    // Calculate comprehension score based on flow metrics
    if (isInFlow) {
      const focusScore = flowScore;
      const timeScore = Math.min((readingTime / 60) * 10, 30); // Up to 30 points for time
      const distractionPenalty = currentMetrics.tabSwitches * 5;
      const score = Math.max(0, Math.min(100, focusScore * 0.7 + timeScore - distractionPenalty));
      setComprehensionScore(Math.round(score));
    }
  }, [isInFlow, flowScore, readingTime, currentMetrics.tabSwitches]);

  const handleStartSession = async () => {
    startFlowSession();
    await startMonitoring();
  };

  const handleEndSession = () => {
    stopMonitoring();
    endFlowSession();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FlowIndicator />
      <InterventionOverlay />
      <AttentionTracker isActive={isInFlow} />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-gray-900">Reading Space</h1>
          </div>

          <div className="flex items-center gap-4">
            {!isInFlow ? (
              <button
                onClick={handleStartSession}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Play size={18} />
                Start Reading
              </button>
            ) : (
              <button
                onClick={handleEndSession}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                End Session
              </button>
            )}
            
            <button
              onClick={() => setFocusZoneActive(!focusZoneActive)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                focusZoneActive
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Eye size={18} />
              Focus Zone
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto py-8 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Reading Area */}
          <div className="lg:col-span-3">
            <div className={`bg-white rounded-xl shadow-sm p-12 ${
              focusZoneActive ? 'ring-2 ring-primary' : ''
            }`}>
              <div className="prose prose-lg max-w-none">
                <div
                  className="text-gray-800 leading-relaxed"
                  style={{ fontSize: '18px', lineHeight: '1.8' }}
                  dangerouslySetInnerHTML={{
                    __html: content
                      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
                      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mb-3 mt-6">$1</h2>')
                      .replace(/^\- (.*$)/gim, '<li class="ml-6 mb-2">$1</li>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                      .replace(/\n\n/g, '</p><p class="mb-4">')
                      .replace(/^(?!<[hl])/gim, '<p class="mb-4">')
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="lg:col-span-1 space-y-4">
            {/* Reading Progress */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Reading Progress</h3>
              <div className="space-y-3">
                <StatItem
                  icon={Clock}
                  label="Reading Time"
                  value={formatTime(readingTime)}
                  color="text-blue-600"
                />
                <StatItem
                  icon={BookOpen}
                  label="Word Count"
                  value={wordCount.toLocaleString()}
                  color="text-green-600"
                />
                <StatItem
                  icon={Clock}
                  label="Est. Time"
                  value={`${estimatedTime} min`}
                  color="text-purple-600"
                />
              </div>
            </div>

            {/* Comprehension Score */}
            {isInFlow && (
              <div className="bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-xl shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Comprehension</h3>
                <div className="flex items-center justify-center">
                  <div className="relative w-24 h-24">
                    <svg className="transform -rotate-90 w-24 h-24">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - comprehensionScore / 100)}`}
                        className="transition-all duration-500"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-800">{comprehensionScore}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-center text-gray-600 mt-2">
                  Based on focus and engagement
                </p>
              </div>
            )}

            {/* Focus Metrics */}
            {isInFlow && (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Focus Metrics</h3>
                <div className="space-y-2">
                  <MetricBar label="Flow Score" value={flowScore} color="bg-primary" />
                  <MetricBar
                    label="Distractions"
                    value={Math.max(0, 100 - currentMetrics.tabSwitches * 10)}
                    color="bg-red-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ icon: Icon, label, value, color }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon size={16} className={color} />
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className={`text-sm font-semibold ${color}`}>{value}</span>
    </div>
  );
}

function MetricBar({ label, value, color }: any) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-800">{Math.round(value)}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
