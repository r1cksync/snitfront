'use client';

import { useEffect, useState } from 'react';
import { useFlowStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wind, Eye, Droplet } from 'lucide-react';

export default function InterventionOverlay() {
  const { currentIntervention, clearIntervention } = useFlowStore();
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!currentIntervention) return;

    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearIntervention();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIntervention, clearIntervention]);

  if (!currentIntervention) return null;

  const renderIntervention = () => {
    switch (currentIntervention.type) {
      case 'breathing':
        return <BreathingExercise />;
      case 'eye-rest':
        return <EyeRest />;
      case 'hydration':
        return <HydrationReminder />;
      default:
        return <GenericBreak />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Time for a Break
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {currentIntervention.reason}
              </p>
            </div>
            <button
              onClick={clearIntervention}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={24} />
            </button>
          </div>

          {renderIntervention()}

          <div className="mt-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">{countdown}s</div>
            <button
              onClick={clearIntervention}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Skip this intervention
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function BreathingExercise() {
  return (
    <div className="text-center">
      <Wind className="w-16 h-16 mx-auto mb-4 text-primary" />
      <h3 className="text-xl font-semibold mb-4">Breathing Exercise</h3>
      <div className="breathing-circle w-32 h-32 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
        <div className="text-lg font-medium">Breathe</div>
      </div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        Inhale for 4 seconds, hold for 4, exhale for 4
      </p>
    </div>
  );
}

function EyeRest() {
  return (
    <div className="text-center">
      <Eye className="w-16 h-16 mx-auto mb-4 text-primary" />
      <h3 className="text-xl font-semibold mb-4">Eye Rest - 20-20-20 Rule</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Look at something 20 feet away for 20 seconds
      </p>
      <div className="bg-primary/10 rounded-lg p-4">
        <p className="text-sm">
          Give your eyes a break from the screen. Find an object in the distance and focus on it.
        </p>
      </div>
    </div>
  );
}

function HydrationReminder() {
  return (
    <div className="text-center">
      <Droplet className="w-16 h-16 mx-auto mb-4 text-blue-500" />
      <h3 className="text-xl font-semibold mb-4">Hydration Break</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Time to drink some water!
      </p>
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <p className="text-sm">
          Staying hydrated helps maintain focus and cognitive performance.
        </p>
      </div>
    </div>
  );
}

function GenericBreak() {
  return (
    <div className="text-center">
      <h3 className="text-xl font-semibold mb-4">Take a Short Break</h3>
      <p className="text-gray-600 dark:text-gray-400">
        Step away from your desk, stretch, and recharge.
      </p>
    </div>
  );
}
