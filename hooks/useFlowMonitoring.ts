import { useEffect, useRef, useState, useCallback } from 'react';
import { useFlowStore } from '@/lib/store';
import { detectFlowState, calculateFlowScore, shouldTriggerIntervention, FlowDetectionInput } from '@/lib/flowDetection';
import { sessionsAPI } from '@/lib/api';

interface MousePosition {
  x: number;
  y: number;
  timestamp: number;
}

export function useFlowMonitoring() {
  const { isInFlow, addMetric, updateFlowScore, setIntervention, sessionId, startFlowSession } = useFlowStore();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  
  const metricsRef = useRef<FlowDetectionInput>({
    typingSpeed: 0,
    tabSwitches: 0,
    mouseActivity: 0,
    errorRate: 0,
    pauseDuration: 0,
  });

  const sessionIdRef = useRef<string | null>(null);
  const lastActivityRef = useRef(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mousePositionsRef = useRef<MousePosition[]>([]);
  const keyTimestampsRef = useRef<number[]>([]);
  const clickCountRef = useRef(0);

  // Calculate mouse movement distance
  const calculateMouseDistance = useCallback(() => {
    let totalDistance = 0;
    for (let i = 1; i < mousePositionsRef.current.length; i++) {
      const prev = mousePositionsRef.current[i - 1];
      const curr = mousePositionsRef.current[i];
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      totalDistance += Math.sqrt(dx * dx + dy * dy);
    }
    return totalDistance;
  }, []);

  // Calculate typing rhythm variance (lower = more flow)
  const calculateTypingRhythm = useCallback(() => {
    if (keyTimestampsRef.current.length < 3) return 0;
    
    const intervals: number[] = [];
    for (let i = 1; i < keyTimestampsRef.current.length; i++) {
      intervals.push(keyTimestampsRef.current[i] - keyTimestampsRef.current[i - 1]);
    }
    
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - mean, 2), 0) / intervals.length;
    
    return Math.sqrt(variance);
  }, []);

  // Start a new session in backend
  const startSession = useCallback(async () => {
    try {
      const response = await sessionsAPI.create({
        startTime: new Date(),
        qualityScore: 0,
        focusScore: 0,
        metrics: {
          avgTypingSpeed: 0,
          tabSwitches: 0,
          mouseActivity: 0,
          fatigueLevel: 0,
        },
        language: 'javascript',
        distractions: 0,
        codeMetrics: {
          linesOfCode: 0,
          charactersTyped: 0,
          complexityScore: 0,
          errorsFixed: 0,
        },
      });
      
      if (response.data.session) {
        sessionIdRef.current = response.data.session._id;
        setSessionStartTime(new Date());
      }
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  }, []);

  // Update session in backend
  const updateSession = useCallback(async (metrics: any, flowScore: number) => {
    if (!sessionIdRef.current) return;
    
    try {
      await sessionsAPI.update(sessionIdRef.current, {
        endTime: new Date(),
        duration: Math.floor((Date.now() - (sessionStartTime?.getTime() || Date.now())) / 1000),
        qualityScore: flowScore,
        focusScore: flowScore,
        distractions: metrics.tabSwitches || 0,
        metrics,
      });
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  }, [sessionStartTime]);

  useEffect(() => {
    if (!isInFlow || !isMonitoring) return;

    let keyCount = 0;
    let backspaceCount = 0;
    let tabSwitchCount = 0;

    // Enhanced keyboard tracking
    const handleKeyDown = (e: KeyboardEvent) => {
      lastActivityRef.current = Date.now();
      keyTimestampsRef.current.push(Date.now());
      
      // Keep only last 100 keystrokes
      if (keyTimestampsRef.current.length > 100) {
        keyTimestampsRef.current.shift();
      }
      
      keyCount++;
      if (e.key === 'Backspace' || e.key === 'Delete') backspaceCount++;
    };

    // Enhanced mouse tracking with position
    const handleMouseMove = (e: MouseEvent) => {
      lastActivityRef.current = Date.now();
      mousePositionsRef.current.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
      });
      
      // Keep only last 50 positions
      if (mousePositionsRef.current.length > 50) {
        mousePositionsRef.current.shift();
      }
    };

    const handleMouseClick = () => {
      clickCountRef.current++;
    };

    // Track visibility changes (tab switching)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchCount++;
      }
    };

    const handleBlur = () => {
      tabSwitchCount++;
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleMouseClick);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    // Process metrics every 10 seconds for more responsive updates
    intervalRef.current = setInterval(async () => {
      const now = Date.now();
      const pauseDuration = (now - lastActivityRef.current) / 1000;

      // Calculate per-minute rates
      const typingSpeed = keyCount * 6; // keys per 10s * 6 = keys per minute
      const errorRate = backspaceCount * 6;
      const mouseDistance = calculateMouseDistance();
      const mouseActivity = mouseDistance / 10; // normalize
      const typingRhythm = calculateTypingRhythm();

      metricsRef.current = {
        typingSpeed,
        tabSwitches: tabSwitchCount,
        mouseActivity,
        errorRate,
        pauseDuration,
      };

      // Add to store for historical tracking
      addMetric('typingSpeed', typingSpeed);
      addMetric('tabSwitches', tabSwitchCount);
      addMetric('mouseActivity', mouseActivity);
      addMetric('errorRate', errorRate);
      addMetric('pauseDuration', pauseDuration);

      // Calculate flow score with enhanced algorithm
      let flowScore = calculateFlowScore(metricsRef.current);
      
      // Bonus for consistent typing rhythm (low variance)
      if (typingRhythm < 100 && keyCount > 5) {
        flowScore += 5;
      }
      
      // Penalty for long pauses
      if (pauseDuration > 60) {
        flowScore -= 15;
      }
      
      flowScore = Math.max(0, Math.min(100, flowScore));
      updateFlowScore(flowScore);

      // Update session in backend
      await updateSession(metricsRef.current, flowScore);

      // Check for intervention triggers
      const interventionCheck = shouldTriggerIntervention(metricsRef.current, flowScore);
      if (interventionCheck?.trigger) {
        setIntervention(interventionCheck);
      }

      // Reset counters
      keyCount = 0;
      backspaceCount = 0;
      tabSwitchCount = 0;
      mousePositionsRef.current = [];
      clickCountRef.current = 0;
    }, 10000); // Every 10 seconds

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleMouseClick);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isInFlow, isMonitoring, addMetric, updateFlowScore, setIntervention, calculateMouseDistance, calculateTypingRhythm, updateSession]);

  return {
    startMonitoring: async () => {
      setIsMonitoring(true);
      await startSession();
    },
    stopMonitoring: () => {
      setIsMonitoring(false);
      sessionIdRef.current = null;
    },
    currentMetrics: metricsRef.current,
    isMonitoring,
    sessionId: sessionIdRef.current,
    updateSessionData: async (data: any) => {
      if (sessionIdRef.current) {
        try {
          await sessionsAPI.update(sessionIdRef.current, data);
        } catch (error) {
          console.error('Failed to update session data:', error);
        }
      }
    },
  };
}
