import { useEffect, useRef, useState } from 'react';
import { useFlowStore } from '@/lib/store';
import { detectFlowState, calculateFlowScore, shouldTriggerIntervention, FlowDetectionInput } from '@/lib/flowDetection';

export function useFlowMonitoring() {
  const { isInFlow, addMetric, updateFlowScore, setIntervention } = useFlowStore();
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const metricsRef = useRef<FlowDetectionInput>({
    typingSpeed: 0,
    tabSwitches: 0,
    mouseActivity: 0,
    errorRate: 0,
    pauseDuration: 0,
  });

  const lastActivityRef = useRef(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isInFlow || !isMonitoring) return;

    let keyCount = 0;
    let backspaceCount = 0;
    let mouseCount = 0;
    let tabSwitchCount = 0;

    // Keyboard event listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      lastActivityRef.current = Date.now();
      keyCount++;
      if (e.key === 'Backspace') backspaceCount++;
    };

    // Mouse event listeners
    const handleMouseMove = () => {
      lastActivityRef.current = Date.now();
      mouseCount++;
    };

    // Visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchCount++;
      }
    };

    // Focus/blur (window switching)
    const handleBlur = () => {
      tabSwitchCount++;
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    // Process metrics every minute
    intervalRef.current = setInterval(async () => {
      const now = Date.now();
      const pauseDuration = (now - lastActivityRef.current) / 1000;

      // Calculate per-minute rates
      const typingSpeed = keyCount * 60;
      const errorRate = backspaceCount * 60;
      const mouseActivity = mouseCount / 10;

      metricsRef.current = {
        typingSpeed,
        tabSwitches: tabSwitchCount,
        mouseActivity,
        errorRate,
        pauseDuration,
      };

      // Add to store
      addMetric('typingSpeed', typingSpeed);
      addMetric('tabSwitches', tabSwitchCount);
      addMetric('mouseActivity', mouseActivity);
      addMetric('errorRate', errorRate);
      addMetric('pauseDuration', pauseDuration);

      // Calculate flow score
      const flowScore = calculateFlowScore(metricsRef.current);
      updateFlowScore(flowScore);

      // Check for intervention triggers
      const interventionCheck = shouldTriggerIntervention(metricsRef.current, flowScore);
      if (interventionCheck?.trigger) {
        setIntervention(interventionCheck);
      }

      // Reset counters
      keyCount = 0;
      backspaceCount = 0;
      mouseCount = 0;
      tabSwitchCount = 0;
    }, 60000); // Every minute

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isInFlow, isMonitoring, addMetric, updateFlowScore, setIntervention]);

  return {
    startMonitoring: () => setIsMonitoring(true),
    stopMonitoring: () => setIsMonitoring(false),
    currentMetrics: metricsRef.current,
  };
}
