'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useFlowStore } from '@/lib/store';
import { useFlowMonitoring } from '@/hooks/useFlowMonitoring';
import { useNotificationBlocker, useDistractionBlocker } from '@/hooks/useFlowProtection';
import FlowIndicator from '@/components/FlowIndicator';
import InterventionOverlay from '@/components/InterventionOverlay';
import { Play, Pause, TrendingUp, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { sessionsAPI } from '@/lib/api';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isInFlow, startFlowSession, endFlowSession, flowScore, sessionStartTime } = useFlowStore();
  const { startMonitoring, stopMonitoring } = useFlowMonitoring();
  const [isProtectionEnabled, setIsProtectionEnabled] = useState(true);

  useNotificationBlocker(isInFlow && isProtectionEnabled);
  useDistractionBlocker(isInFlow && isProtectionEnabled, [
    'facebook.com',
    'twitter.com',
    'instagram.com',
    'reddit.com',
    'youtube.com',
  ]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  const handleStartSession = async () => {
    startFlowSession();
    startMonitoring();

    // Create session in backend
    try {
      await sessionsAPI.create({
        startTime: new Date(),
      });
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleEndSession = async () => {
    stopMonitoring();
    endFlowSession();

    // Update session in backend
    // (You'd need to track the session ID from the create call)
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <FlowIndicator />
      <InterventionOverlay />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Flow Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/analytics"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <TrendingUp size={20} />
              Analytics
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <SettingsIcon size={20} />
              Settings
            </Link>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {session?.user?.name}!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Ready to enter your flow state?
            </p>
          </div>

          {/* Focus Spaces */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Focus Spaces</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/spaces/code">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary">
                  <div className="text-4xl mb-3">💻</div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Code Editor</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Write code with attention tracking</p>
                </div>
              </Link>
              <Link href="/spaces/reading">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary">
                  <div className="text-4xl mb-3">📚</div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Reading Space</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Read with comprehension tracking</p>
                </div>
              </Link>
              <Link href="/spaces/writing">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary">
                  <div className="text-4xl mb-3">✍️</div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Writing Space</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Write with AI assistance</p>
                </div>
              </Link>
              <Link href="/spaces/timer">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary">
                  <div className="text-4xl mb-3">⏱️</div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Focus Timer</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pomodoro with flow detection</p>
                </div>
              </Link>
              <Link href="/spaces/whiteboard">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary">
                  <div className="text-4xl mb-3">🎨</div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Whiteboard</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Brainstorm and visualize</p>
                </div>
              </Link>
              <Link href="/analytics">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary">
                  <div className="text-4xl mb-3">📊</div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Analytics</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">View productivity insights</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Flow Control */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
            <div className="text-center">
              {!isInFlow ? (
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Start Your Flow Session
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Click below to begin monitoring and enter your optimal focus state
                  </p>
                  <button
                    onClick={handleStartSession}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg"
                  >
                    <Play size={24} />
                    Start Flow Session
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Flow Session Active
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {sessionStartTime && `Started ${new Date(sessionStartTime).toLocaleTimeString()}`}
                  </p>
                  <div className="mb-8">
                    <div className="text-5xl font-bold text-primary mb-2">{Math.round(flowScore)}</div>
                    <div className="text-gray-600 dark:text-gray-400">Current Flow Score</div>
                  </div>
                  <button
                    onClick={handleEndSession}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gray-700 text-white rounded-xl font-semibold text-lg hover:bg-gray-600 transition-colors shadow-lg"
                  >
                    <Pause size={24} />
                    End Session
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Protection Settings */}
          {isInFlow && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Flow Protection
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Distraction Blocking
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Block notifications and distraction sites
                  </p>
                </div>
                <button
                  onClick={() => setIsProtectionEnabled(!isProtectionEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isProtectionEnabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isProtectionEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
