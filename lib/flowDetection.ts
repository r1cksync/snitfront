import * as tf from '@tensorflow/tfjs';

let model: tf.LayersModel | null = null;

// Initialize a simple sequential model for flow detection
export async function initializeFlowModel() {
  if (model) return model;

  // Create a simple neural network for flow state detection
  model = tf.sequential({
    layers: [
      tf.layers.dense({ inputShape: [5], units: 16, activation: 'relu' }),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.dense({ units: 8, activation: 'relu' }),
      tf.layers.dense({ units: 1, activation: 'sigmoid' }),
    ],
  });

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy'],
  });

  return model;
}

export interface FlowDetectionInput {
  typingSpeed: number;      // characters per minute
  tabSwitches: number;       // per minute
  mouseActivity: number;     // movements per minute
  errorRate: number;         // backspaces per minute
  pauseDuration: number;     // seconds of inactivity
}

export async function detectFlowState(input: FlowDetectionInput): Promise<number> {
  try {
    await initializeFlowModel();
    
    if (!model) {
      throw new Error('Model not initialized');
    }

    // Normalize inputs
    const normalized = [
      input.typingSpeed / 100,           // normalize to 0-1 range
      input.tabSwitches / 10,
      input.mouseActivity / 100,
      input.errorRate / 20,
      Math.min(input.pauseDuration / 60, 1),
    ];

    const tensorInput = tf.tensor2d([normalized]);
    const prediction = model.predict(tensorInput) as tf.Tensor;
    const flowScore = (await prediction.data())[0];

    // Cleanup tensors
    tensorInput.dispose();
    prediction.dispose();

    return flowScore;
  } catch (error) {
    console.error('Flow detection error:', error);
    return 0;
  }
}

export function calculateFlowScore(metrics: FlowDetectionInput): number {
  // Rule-based flow score calculation (0-100)
  let score = 50; // baseline

  // High typing speed increases score
  if (metrics.typingSpeed > 60) score += 15;
  else if (metrics.typingSpeed > 40) score += 10;
  else if (metrics.typingSpeed < 20) score -= 10;

  // Low tab switching increases score
  if (metrics.tabSwitches < 3) score += 15;
  else if (metrics.tabSwitches > 10) score -= 20;

  // Moderate mouse activity is good
  if (metrics.mouseActivity > 20 && metrics.mouseActivity < 80) score += 10;
  else if (metrics.mouseActivity > 150) score -= 15;

  // Low error rate increases score
  if (metrics.errorRate < 5) score += 10;
  else if (metrics.errorRate > 15) score -= 15;

  // Short pauses are okay, long pauses decrease score
  if (metrics.pauseDuration < 5) score += 5;
  else if (metrics.pauseDuration > 30) score -= 20;

  return Math.max(0, Math.min(100, score));
}

export function shouldTriggerIntervention(
  metrics: FlowDetectionInput,
  flowScore: number
): { trigger: boolean; type: string; reason: string } | null {
  // Fatigue detection
  if (metrics.typingSpeed < 30 && metrics.errorRate > 12) {
    return {
      trigger: true,
      type: 'break',
      reason: 'Signs of fatigue detected. Time for a break.',
    };
  }

  // Eye strain detection
  if (metrics.pauseDuration < 2 && flowScore > 70) {
    return {
      trigger: true,
      type: 'eye-rest',
      reason: 'You\'ve been focused for a while. Try the 20-20-20 rule.',
    };
  }

  // Distraction detection
  if (metrics.tabSwitches > 15) {
    return {
      trigger: true,
      type: 'breathing',
      reason: 'High distraction detected. Take a moment to breathe.',
    };
  }

  return null;
}
