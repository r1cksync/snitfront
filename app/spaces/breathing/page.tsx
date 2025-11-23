'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Play, Pause, RotateCcw, Settings as SettingsIcon, Home, Info } from 'lucide-react';
import Link from 'next/link';

type Phase = 'inhale' | 'hold' | 'exhale';

interface BreathingPattern {
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  description: string;
  benefits: string[];
}

const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    name: '4-7-8 Relaxation',
    inhale: 4,
    hold: 7,
    exhale: 8,
    description: 'Perfect for reducing anxiety and falling asleep',
    benefits: ['Reduces stress', 'Improves sleep', 'Calms nervous system'],
  },
  {
    name: '4-4-6 Focus',
    inhale: 4,
    hold: 4,
    exhale: 6,
    description: 'Ideal for maintaining focus during work',
    benefits: ['Enhances concentration', 'Balances energy', 'Reduces fatigue'],
  },
  {
    name: 'Box Breathing',
    inhale: 4,
    hold: 4,
    exhale: 4,
    description: 'Used by Navy SEALs for stress management',
    benefits: ['Improves performance', 'Reduces stress', 'Enhances clarity'],
  },
  {
    name: '5-5-5 Balance',
    inhale: 5,
    hold: 5,
    exhale: 5,
    description: 'Balanced breathing for general wellness',
    benefits: ['Promotes balance', 'Increases oxygen', 'Improves mood'],
  },
];

export default function BreathingSpace() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [countdown, setCountdown] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [selectedPattern, setSelectedPattern] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [totalTime, setTotalTime] = useState(0);

  const pattern = BREATHING_PATTERNS[selectedPattern];

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Move to next phase
          if (phase === 'inhale') {
            setPhase('hold');
            return pattern.hold;
          } else if (phase === 'hold') {
            setPhase('exhale');
            return pattern.exhale;
          } else {
            setPhase('inhale');
            setCyclesCompleted((c) => c + 1);
            return pattern.inhale;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase, pattern]);

  useEffect(() => {
    if (!isActive) return;

    const timeTimer = setInterval(() => {
      setTotalTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(timeTimer);
  }, [isActive]);

  const handleStart = () => {
    setIsActive(true);
    setPhase('inhale');
    setCountdown(pattern.inhale);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('inhale');
    setCountdown(pattern.inhale);
    setCyclesCompleted(0);
    setTotalTime(0);
  };

  const getCircleScale = () => {
    if (phase === 'inhale') return 1.4;
    if (phase === 'hold') return 1.4;
    return 1;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-blue-400 dark:bg-blue-600 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400 dark:bg-purple-600 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Home className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </motion.button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Wind className="w-10 h-10 text-blue-600" />
                Breathing Exercise
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Find your calm, enhance your focus
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowInfo(!showInfo)}
            className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Info className="w-6 h-6 text-blue-600" />
          </motion.button>
        </motion.div>

        {/* Info Panel */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Benefits of Breathwork
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-3xl mb-2">🧠</p>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Mental Clarity</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Improves focus and cognitive performance
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-3xl mb-2">😌</p>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Stress Relief</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Activates parasympathetic nervous system
                    </p>
                  </div>
                  <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                    <p className="text-3xl mb-2">❤️</p>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Heart Health</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Lowers blood pressure and heart rate
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Breathing Circle */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 lg:p-12"
            >
              {/* Breathing Visualization */}
              <div className="flex items-center justify-center mb-8" style={{ height: '500px' }}>
                <div className="relative">
                  {/* Outer glow rings */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-30 blur-3xl"
                    animate={{
                      scale: isActive ? (phase === 'inhale' ? 1.5 : phase === 'hold' ? 1.5 : 1) : 1,
                      opacity: isActive ? [0.3, 0.5, 0.3] : 0.3,
                    }}
                    transition={{
                      duration: phase === 'inhale' ? pattern.inhale : phase === 'exhale' ? pattern.exhale : pattern.hold,
                      ease: 'easeInOut',
                    }}
                  />
                  
                  {/* Secondary glow ring */}
                  <motion.div
                    className="absolute inset-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 blur-2xl"
                    animate={{
                      scale: isActive ? (phase === 'inhale' ? 1.3 : phase === 'hold' ? 1.3 : 0.9) : 1,
                      opacity: isActive ? [0.2, 0.4, 0.2] : 0.2,
                    }}
                    transition={{
                      duration: phase === 'inhale' ? pattern.inhale : phase === 'exhale' ? pattern.exhale : pattern.hold,
                      ease: 'easeInOut',
                      delay: 0.1,
                    }}
                  />

                  {/* Main breathing circle */}
                  <motion.div
                    className="relative w-72 h-72 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl"
                    animate={{
                      scale: isActive ? getCircleScale() : 1,
                      boxShadow: isActive 
                        ? phase === 'inhale'
                          ? '0 25px 50px -12px rgba(147, 51, 234, 0.5), 0 0 100px rgba(59, 130, 246, 0.3)'
                          : phase === 'hold'
                          ? '0 25px 50px -12px rgba(147, 51, 234, 0.5), 0 0 100px rgba(59, 130, 246, 0.3)'
                          : '0 10px 30px -12px rgba(147, 51, 234, 0.25)'
                        : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    }}
                    transition={{
                      scale: {
                        duration: phase === 'inhale' ? pattern.inhale : phase === 'exhale' ? pattern.exhale : 0,
                        ease: phase === 'hold' ? 'linear' : 'easeInOut',
                      },
                      boxShadow: {
                        duration: phase === 'inhale' ? pattern.inhale : phase === 'exhale' ? pattern.exhale : pattern.hold,
                        ease: 'easeInOut',
                      },
                    }}
                  >
                    {/* Inner circle with gradient */}
                    <motion.div 
                      className="absolute inset-8 rounded-full bg-white dark:bg-gray-900 flex flex-col items-center justify-center"
                      animate={{
                        opacity: isActive ? [1, 0.95, 1] : 1,
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <motion.div
                        key={countdown}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-8xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent"
                      >
                        {countdown}
                      </motion.div>
                      <motion.p
                        key={phase}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="text-2xl font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mt-2"
                      >
                        {phase === 'inhale' ? 'Breathe In' : phase === 'hold' ? 'Hold' : 'Breathe Out'}
                      </motion.p>
                    </motion.div>

                  </motion.div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                {!isActive ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStart}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all text-lg"
                  >
                    <Play className="w-6 h-6" />
                    Start Session
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePause}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all text-lg"
                  >
                    <Pause className="w-6 h-6" />
                    Pause
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="flex items-center gap-2 px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </motion.button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl"
                >
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cycles Completed</p>
                  <p className="text-3xl font-bold text-blue-600">{cyclesCompleted}</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl"
                >
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Time</p>
                  <p className="text-3xl font-bold text-purple-600">{formatTime(totalTime)}</p>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Breathing Patterns Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Breathing Patterns
              </h3>
              <div className="space-y-3">
                {BREATHING_PATTERNS.map((p, index) => (
                  <motion.button
                    key={p.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedPattern(index);
                      handleReset();
                    }}
                    disabled={isActive}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      selectedPattern === index
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <h4 className="font-semibold mb-1">{p.name}</h4>
                    <p className={`text-xs mb-2 ${selectedPattern === index ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}`}>
                      {p.inhale}s - {p.hold}s - {p.exhale}s
                    </p>
                    <p className={`text-xs ${selectedPattern === index ? 'text-white/70' : 'text-gray-500 dark:text-gray-500'}`}>
                      {p.description}
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Current Pattern Benefits */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Benefits</h3>
              <ul className="space-y-2">
                {pattern.benefits.map((benefit, index) => (
                  <motion.li
                    key={benefit}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span className="text-green-500">✓</span>
                    {benefit}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Quick Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">💡 Quick Tips</h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• Find a quiet, comfortable space</li>
                <li>• Sit with your back straight</li>
                <li>• Breathe through your nose</li>
                <li>• Focus on the visualization</li>
                <li>• Practice daily for best results</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
