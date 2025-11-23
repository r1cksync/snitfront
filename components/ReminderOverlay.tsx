'use client';

import { X, Eye, User, Droplets } from 'lucide-react';

interface ReminderOverlayProps {
  type: 'eye-rest' | 'posture' | 'hydration';
  onClose: () => void;
  onComplete: () => void;
}

export default function ReminderOverlay({ type, onClose, onComplete }: ReminderOverlayProps) {
  const configs = {
    'eye-rest': {
      icon: Eye,
      title: '20-20-20 Eye Rest',
      color: 'green',
      description: 'Look at something 20 feet away for 20 seconds',
      instruction: 'Find a distant object (at least 20 feet away) and focus on it. This helps reduce eye strain and prevents digital eye fatigue.',
      duration: 20,
      tips: [
        'Look out a window if possible',
        'Focus on the farthest object you can see',
        'Blink naturally while looking away',
      ],
    },
    'posture': {
      icon: User,
      title: 'Posture Check',
      color: 'blue',
      description: 'Adjust your sitting position',
      instruction: 'Check your posture: feet flat on floor, back straight, shoulders relaxed, screen at eye level.',
      duration: 15,
      tips: [
        'Roll your shoulders back',
        'Adjust your screen height',
        'Make sure your feet are flat',
        'Keep your back straight',
      ],
    },
    'hydration': {
      icon: Droplets,
      title: 'Hydration Reminder',
      color: 'cyan',
      description: 'Time to drink some water',
      instruction: 'Take a moment to hydrate. Proper hydration improves focus and cognitive performance.',
      duration: 10,
      tips: [
        'Aim for 8 glasses of water daily',
        'Keep water nearby while working',
        'Set a hydration goal',
      ],
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  const handleComplete = () => {
    onComplete();
    setTimeout(onClose, 500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 relative animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div
            className={`w-16 h-16 rounded-full bg-${config.color}-100 dark:bg-${config.color}-900/30 flex items-center justify-center mx-auto mb-4`}
          >
            <Icon className={`w-8 h-8 text-${config.color}-600`} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {config.title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {config.description}
          </p>
        </div>

        {/* Main Instruction */}
        <div className={`bg-${config.color}-50 dark:bg-${config.color}-900/20 rounded-lg p-6 mb-6`}>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {config.instruction}
          </p>
        </div>

        {/* Tips */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Quick Tips:
          </h3>
          <ul className="space-y-2">
            {config.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className={`text-${config.color}-600 mt-0.5`}>✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Recommended duration:
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {config.duration} seconds
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
          >
            Remind Later
          </button>
          <button
            onClick={handleComplete}
            className={`flex-1 py-3 bg-${config.color}-600 hover:bg-${config.color}-700 text-white rounded-lg transition-colors font-medium`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
