import { create } from 'zustand';

interface FlowMetrics {
  typingSpeed: number[];
  tabSwitches: number[];
  mouseActivity: number[];
  errorRate: number[];
  pauseDuration: number[];
}

interface FlowState {
  isInFlow: boolean;
  flowScore: number;
  sessionId: string | null;
  sessionStartTime: Date | null;
  metrics: FlowMetrics;
  currentIntervention: any | null;
  
  // Actions
  startFlowSession: () => void;
  endFlowSession: () => void;
  updateFlowScore: (score: number) => void;
  addMetric: (type: keyof FlowMetrics, value: number) => void;
  setIntervention: (intervention: any) => void;
  clearIntervention: () => void;
  resetMetrics: () => void;
}

export const useFlowStore = create<FlowState>((set) => ({
  isInFlow: false,
  flowScore: 0,
  sessionId: null,
  sessionStartTime: null,
  metrics: {
    typingSpeed: [],
    tabSwitches: [],
    mouseActivity: [],
    errorRate: [],
    pauseDuration: [],
  },
  currentIntervention: null,

  startFlowSession: () => set({
    isInFlow: true,
    sessionStartTime: new Date(),
    sessionId: `session-${Date.now()}`,
  }),

  endFlowSession: () => set({
    isInFlow: false,
    sessionStartTime: null,
  }),

  updateFlowScore: (score: number) => set({ flowScore: score }),

  addMetric: (type: keyof FlowMetrics, value: number) => set((state) => ({
    metrics: {
      ...state.metrics,
      [type]: [...state.metrics[type], value].slice(-30), // Keep last 30 values
    },
  })),

  setIntervention: (intervention: any) => set({ currentIntervention: intervention }),

  clearIntervention: () => set({ currentIntervention: null }),

  resetMetrics: () => set({
    metrics: {
      typingSpeed: [],
      tabSwitches: [],
      mouseActivity: [],
      errorRate: [],
      pauseDuration: [],
    },
  }),
}));
