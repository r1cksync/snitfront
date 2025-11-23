'use client';

import { useState } from 'react';
import { Settings, Wind, Eye, User, Droplets, Save, RotateCcw } from 'lucide-react';
import { useReminderSettings } from '@/components/ReminderManager';

export default function ReminderSettings() {
  const { settings, updateSettings } = useReminderSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleToggle = (reminder: keyof typeof settings) => {
    setLocalSettings({
      ...localSettings,
      [reminder]: {
        ...localSettings[reminder],
        enabled: !localSettings[reminder].enabled,
      },
    });
  };

  const handleIntervalChange = (reminder: keyof typeof settings, value: number) => {
    setLocalSettings({
      ...localSettings,
      [reminder]: {
        ...localSettings[reminder],
        interval: value,
      },
    });
  };

  const handleSave = () => {
    updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    const defaults = {
      breathingExercise: { enabled: true, interval: 30 },
      eyeRest: { enabled: true, interval: 20 },
      postureCheck: { enabled: true, interval: 45 },
      hydration: { enabled: true, interval: 60 },
    };
    setLocalSettings(defaults);
    updateSettings(defaults);
  };

  const reminders = [
    {
      key: 'breathingExercise' as const,
      icon: Wind,
      title: 'Breathing Exercise',
      description: '4-4-6 breathing technique to reset focus',
      color: 'blue',
    },
    {
      key: 'eyeRest' as const,
      icon: Eye,
      title: 'Eye Rest (20-20-20 Rule)',
      description: 'Look 20 feet away for 20 seconds every 20 minutes',
      color: 'green',
    },
    {
      key: 'postureCheck' as const,
      icon: User,
      title: 'Posture Check',
      description: 'Reminder to check and adjust your sitting position',
      color: 'purple',
    },
    {
      key: 'hydration' as const,
      icon: Droplets,
      title: 'Hydration Reminder',
      description: 'Stay hydrated for optimal cognitive performance',
      color: 'cyan',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Reminder Settings
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Configure health and wellness reminders during your flow sessions
          </p>
        </div>

        {/* Save Success Message */}
        {saved && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg text-green-800 dark:text-green-200 flex items-center gap-2 animate-fade-in">
            <span className="text-xl">✓</span>
            <span>Settings saved successfully!</span>
          </div>
        )}

        {/* Reminder Cards */}
        <div className="space-y-6 mb-8">
          {reminders.map((reminder) => {
            const Icon = reminder.icon;
            const setting = localSettings[reminder.key];

            return (
              <div
                key={reminder.key}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all hover:shadow-xl"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-lg bg-${reminder.color}-100 dark:bg-${reminder.color}-900/30 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 text-${reminder.color}-600`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {reminder.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {reminder.description}
                        </p>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        onClick={() => handleToggle(reminder.key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-${reminder.color}-500 focus:ring-offset-2 ${
                          setting.enabled ? `bg-${reminder.color}-600` : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            setting.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Interval Setting */}
                    {setting.enabled && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Reminder Interval: <span className="text-gray-900 dark:text-white font-semibold">{setting.interval} minutes</span>
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="5"
                            max="120"
                            step="5"
                            value={setting.interval}
                            onChange={(e) => handleIntervalChange(reminder.key, Number(e.target.value))}
                            className={`flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-${reminder.color}-600`}
                          />
                          <input
                            type="number"
                            min="5"
                            max="120"
                            value={setting.interval}
                            onChange={(e) => handleIntervalChange(reminder.key, Number(e.target.value))}
                            className="w-20 px-3 py-1 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          You'll be reminded every {setting.interval} minutes during active flow sessions
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-lg"
          >
            <Save className="w-5 h-5" />
            Save Settings
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
          >
            <RotateCcw className="w-5 h-5" />
            Reset to Defaults
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            💡 About Health Reminders
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>• Reminders only appear during active flow sessions</li>
            <li>• They're designed to minimize disruption while protecting your health</li>
            <li>• You can always dismiss a reminder and it will appear at the next interval</li>
            <li>• Research shows regular breaks improve long-term productivity and focus</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
