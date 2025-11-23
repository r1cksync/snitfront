'use client';

import { useEffect, useState, useCallback } from 'react';
import BreathingExercise from './BreathingExercise';
import ReminderOverlay from './ReminderOverlay';

interface ReminderManagerProps {
  isActive: boolean; // Only show reminders when flow session is active
}

interface ReminderSettings {
  breathingExercise: { enabled: boolean; interval: number }; // interval in minutes
  eyeRest: { enabled: boolean; interval: number };
  postureCheck: { enabled: boolean; interval: number };
  hydration: { enabled: boolean; interval: number };
}

const DEFAULT_SETTINGS: ReminderSettings = {
  breathingExercise: { enabled: true, interval: 30 },
  eyeRest: { enabled: true, interval: 20 },
  postureCheck: { enabled: true, interval: 45 },
  hydration: { enabled: true, interval: 60 },
};

export default function ReminderManager({ isActive }: ReminderManagerProps) {
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_SETTINGS);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showReminder, setShowReminder] = useState<'eye-rest' | 'posture' | 'hydration' | null>(null);
  const [lastReminders, setLastReminders] = useState({
    breathing: Date.now(),
    eyeRest: Date.now(),
    posture: Date.now(),
    hydration: Date.now(),
  });

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('reminderSettings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load reminder settings:', error);
      }
    }
  }, []);

  const checkReminders = useCallback(() => {
    if (!isActive) return;

    const now = Date.now();

    // Check breathing exercise
    if (settings.breathingExercise.enabled) {
      const breathingInterval = settings.breathingExercise.interval * 60 * 1000;
      if (now - lastReminders.breathing >= breathingInterval) {
        setShowBreathing(true);
        setLastReminders(prev => ({ ...prev, breathing: now }));
        return;
      }
    }

    // Check eye rest
    if (settings.eyeRest.enabled) {
      const eyeInterval = settings.eyeRest.interval * 60 * 1000;
      if (now - lastReminders.eyeRest >= eyeInterval) {
        setShowReminder('eye-rest');
        setLastReminders(prev => ({ ...prev, eyeRest: now }));
        return;
      }
    }

    // Check posture
    if (settings.postureCheck.enabled) {
      const postureInterval = settings.postureCheck.interval * 60 * 1000;
      if (now - lastReminders.posture >= postureInterval) {
        setShowReminder('posture');
        setLastReminders(prev => ({ ...prev, posture: now }));
        return;
      }
    }

    // Check hydration
    if (settings.hydration.enabled) {
      const hydrationInterval = settings.hydration.interval * 60 * 1000;
      if (now - lastReminders.hydration >= hydrationInterval) {
        setShowReminder('hydration');
        setLastReminders(prev => ({ ...prev, hydration: now }));
        return;
      }
    }
  }, [isActive, settings, lastReminders]);

  // Check reminders every 30 seconds
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [isActive, checkReminders]);

  // Reset all timers when session starts
  useEffect(() => {
    if (isActive) {
      const now = Date.now();
      setLastReminders({
        breathing: now,
        eyeRest: now,
        posture: now,
        hydration: now,
      });
    }
  }, [isActive]);

  return (
    <>
      {showBreathing && (
        <BreathingExercise
          onClose={() => setShowBreathing(false)}
          duration={60}
        />
      )}

      {showReminder && (
        <ReminderOverlay
          type={showReminder}
          onClose={() => setShowReminder(null)}
          onComplete={() => setShowReminder(null)}
        />
      )}
    </>
  );
}

// Export settings hook for settings page
export function useReminderSettings() {
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const saved = localStorage.getItem('reminderSettings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load reminder settings:', error);
      }
    }
  }, []);

  const updateSettings = (newSettings: ReminderSettings) => {
    setSettings(newSettings);
    localStorage.setItem('reminderSettings', JSON.stringify(newSettings));
  };

  return { settings, updateSettings };
}
