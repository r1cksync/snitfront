'use client';

import { useState, useEffect } from 'react';
import { X, Wind } from 'lucide-react';

interface BreathingExerciseProps {
  onClose: () => void;
  duration?: number; // in seconds
}

export default function BreathingExercise({ onClose, duration = 60 }: BreathingExerciseProps) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [countdown, setCountdown] = useState(4);
  const [totalTime, setTotalTime] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const phaseTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Move to next phase
          if (phase === 'inhale') {
            setPhase('hold');
            return 4;
          } else if (phase === 'hold') {
            setPhase('exhale');
            return 6;
          } else {
            setPhase('inhale');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(phaseTimer);
  }, [phase]);

  useEffect(() => {
    const totalTimer = setInterval(() => {
      setTotalTime((prev) => {
        if (prev >= duration) {
          onClose();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(totalTimer);
  }, [duration, onClose]);

  useEffect(() => {
    // Animate circle based on phase
    if (phase === 'inhale') {
      setScale(1.5);
    } else if (phase === 'hold') {
      setScale(1.5);
    } else {
      setScale(1);
    }
  }, [phase]);

  const progress = (totalTime / duration) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Wind className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Breathing Exercise
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Take a moment to reset your focus
          </p>
        </div>

        {/* Breathing Circle Animation */}
        <div className="flex items-center justify-center mb-8 h-64">
          <div className="relative">
            <div
              className={`w-48 h-48 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 transition-all duration-${
                phase === 'inhale' ? '4000' : phase === 'hold' ? '0' : '6000'
              } ease-in-out`}
              style={{ transform: `scale(${scale})` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-white text-6xl font-bold mb-2">{countdown}</p>
                <p className="text-white text-xl font-semibold uppercase tracking-wide">
                  {phase === 'inhale' ? 'Breathe In' : phase === 'hold' ? 'Hold' : 'Breathe Out'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 dark:text-blue-400 mt-0.5">ℹ️</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p className="font-medium mb-1">4-4-6 Breathing Technique</p>
              <ul className="space-y-1 text-xs">
                <li>• Inhale for 4 seconds</li>
                <li>• Hold for 4 seconds</li>
                <li>• Exhale for 6 seconds</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Progress</span>
            <span>{totalTime}s / {duration}s</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
        >
          Skip Exercise
        </button>
      </div>
    </div>
  );
}
