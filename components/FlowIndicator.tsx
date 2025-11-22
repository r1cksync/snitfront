'use client';

import { useEffect, useState } from 'react';
import { useFlowStore } from '@/lib/store';
import { Circle, Square } from 'lucide-react';

export default function FlowIndicator() {
  const { isInFlow, flowScore } = useFlowStore();
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    // Smooth score animation
    const interval = setInterval(() => {
      setDisplayScore((prev) => {
        const diff = flowScore - prev;
        if (Math.abs(diff) < 1) return flowScore;
        return prev + diff * 0.1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [flowScore]);

  const getFlowLevel = (score: number) => {
    if (score >= 80) return { label: 'Deep Flow', color: 'text-green-500', bg: 'bg-green-500' };
    if (score >= 60) return { label: 'Flow', color: 'text-blue-500', bg: 'bg-blue-500' };
    if (score >= 40) return { label: 'Focused', color: 'text-yellow-500', bg: 'bg-yellow-500' };
    return { label: 'Distracted', color: 'text-red-500', bg: 'bg-red-500' };
  };

  const level = getFlowLevel(displayScore);

  if (!isInFlow) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 rounded-2xl px-6 py-3 shadow-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Circle className={`w-4 h-4 ${level.color} flow-state-active`} fill="currentColor" />
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Flow State</div>
          <div className={`text-lg font-bold ${level.color}`}>{level.label}</div>
        </div>
        <div className="ml-4 text-right">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(displayScore)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Score</div>
        </div>
      </div>
      <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${level.bg} transition-all duration-500`}
          style={{ width: `${displayScore}%` }}
        />
      </div>
    </div>
  );
}
