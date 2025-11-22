'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useFlowStore } from '@/lib/store';
import { useFlowMonitoring } from '@/hooks/useFlowMonitoring';
import FlowIndicator from '@/components/FlowIndicator';
import InterventionOverlay from '@/components/InterventionOverlay';
import { Play, Pause, RotateCcw, Timer, Coffee, Settings } from 'lucide-react';

const PRESETS = [
  { name: 'Pomodoro', work: 25, break: 5, longBreak: 15, cycles: 4 },
  { name: '52-17', work: 52, break: 17, longBreak: 17, cycles: 1 },
  { name: 'Deep Work', work: 90, break: 20, longBreak: 30, cycles: 2 },
  { name: 'Sprint', work: 15, break: 3, longBreak: 10, cycles: 8 },
];

type TimerMode = 'work' | 'break' | 'longBreak';

export default function FocusTimerSpace() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isInFlow, startFlowSession, endFlowSession, flowScore } = useFlowStore();
  const { startMonitoring, stopMonitoring, currentMetrics } = useFlowMonitoring();
  
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [timeLeft, setTimeLeft] = useState(selectedPreset.work * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>('work');
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [totalWorkTime, setTotalWorkTime] = useState(0);
  const [totalBreakTime, setTotalBreakTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
        
        // Track time
        if (mode === 'work') {
          setTotalWorkTime(prev => prev + 1);
        } else {
          setTotalBreakTime(prev => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    playNotification();
    
    if (mode === 'work') {
      const newCycles = cyclesCompleted + 1;
      setCyclesCompleted(newCycles);
      
      if (newCycles % selectedPreset.cycles === 0) {
        setMode('longBreak');
        setTimeLeft(selectedPreset.longBreak * 60);
      } else {
        setMode('break');
        setTimeLeft(selectedPreset.break * 60);
      }
    } else {
      setMode('work');
      setTimeLeft(selectedPreset.work * 60);
    }
  };

  const playNotification = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const handleStart = async () => {
    setIsRunning(true);
    if (mode === 'work' && !isInFlow) {
      startFlowSession();
      await startMonitoring();
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setMode('work');
    setTimeLeft(selectedPreset.work * 60);
    setCyclesCompleted(0);
    if (isInFlow) {
      stopMonitoring();
      endFlowSession();
    }
  };

  const handlePresetChange = (preset: typeof PRESETS[0]) => {
    setSelectedPreset(preset);
    setTimeLeft(preset.work * 60);
    setMode('work');
    setCyclesCompleted(0);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const total = mode === 'work'
      ? selectedPreset.work * 60
      : mode === 'break'
      ? selectedPreset.break * 60
      : selectedPreset.longBreak * 60;
    return ((total - timeLeft) / total) * 100;
  };

  const getModeColor = () => {
    switch (mode) {
      case 'work':
        return 'from-blue-500 to-primary';
      case 'break':
        return 'from-green-500 to-emerald-600';
      case 'longBreak':
        return 'from-purple-500 to-pink-600';
    }
  };

  const getModeText = () => {
    switch (mode) {
      case 'work':
        return 'Focus Time';
      case 'break':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getModeColor()} transition-all duration-1000`}>
      <FlowIndicator />
      <InterventionOverlay />
      
      <audio ref={audioRef} src="/notification.mp3" />

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Timer className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Focus Timer</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePresetChange(preset)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPreset.name === preset.name
                    ? 'bg-white text-gray-900'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timer Display */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 text-center">
              <div className="mb-8">
                <div className="inline-block px-6 py-2 bg-white/20 rounded-full text-white text-lg font-semibold mb-4">
                  {getModeText()}
                </div>
                <div className="text-8xl font-bold text-white mb-2">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-white/80 text-lg">
                  Cycle {cyclesCompleted + 1} of {selectedPreset.cycles}
                </div>
              </div>

              {/* Progress Ring */}
              <div className="flex justify-center mb-8">
                <div className="relative w-64 h-64">
                  <svg className="transform -rotate-90 w-64 h-64">
                    <circle
                      cx="128"
                      cy="128"
                      r="120"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="12"
                      fill="transparent"
                    />
                    <circle
                      cx="128"
                      cy="128"
                      r="120"
                      stroke="white"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 120}`}
                      strokeDashoffset={`${2 * Math.PI * 120 * (1 - getProgressPercentage() / 100)}`}
                      className="transition-all duration-1000"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                {!isRunning ? (
                  <button
                    onClick={handleStart}
                    className="flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-full hover:bg-white/90 transition-colors text-lg font-semibold"
                  >
                    <Play size={24} />
                    Start
                  </button>
                ) : (
                  <button
                    onClick={handlePause}
                    className="flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-full hover:bg-white/90 transition-colors text-lg font-semibold"
                  >
                    <Pause size={24} />
                    Pause
                  </button>
                )}
                
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-6 py-4 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                >
                  <RotateCcw size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Session Stats */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h3 className="text-white font-semibold text-lg mb-4">Session Stats</h3>
              <div className="space-y-4">
                <StatCard
                  label="Work Time"
                  value={formatTime(totalWorkTime)}
                  icon={Timer}
                />
                <StatCard
                  label="Break Time"
                  value={formatTime(totalBreakTime)}
                  icon={Coffee}
                />
                <StatCard
                  label="Cycles Done"
                  value={cyclesCompleted}
                  icon={RotateCcw}
                />
              </div>
            </div>

            {/* Flow Metrics */}
            {isInFlow && mode === 'work' && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                <h3 className="text-white font-semibold text-lg mb-4">Flow Metrics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-white">
                    <span className="text-sm">Flow Score</span>
                    <span className="text-2xl font-bold">{Math.round(flowScore)}</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-500"
                      style={{ width: `${flowScore}%` }}
                    />
                  </div>
                  
                  <div className="pt-3 space-y-2">
                    <MetricRow label="Typing" value={`${Math.round(currentMetrics.typingSpeed)} keys/min`} />
                    <MetricRow label="Mouse Activity" value={`${currentMetrics.mouseMovements}`} />
                    <MetricRow label="Distractions" value={`${currentMetrics.tabSwitches}`} />
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h3 className="text-white font-semibold text-lg mb-4">💡 Focus Tips</h3>
              <ul className="space-y-2 text-white/90 text-sm">
                <li>• Silence notifications</li>
                <li>• Keep water nearby</li>
                <li>• Use breaks wisely</li>
                <li>• Track your progress</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg">
          <Icon size={20} className="text-white" />
        </div>
        <span className="text-white/80 text-sm">{label}</span>
      </div>
      <span className="text-white text-xl font-bold">{value}</span>
    </div>
  );
}

function MetricRow({ label, value }: any) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/70">{label}</span>
      <span className="text-white font-semibold">{value}</span>
    </div>
  );
}
