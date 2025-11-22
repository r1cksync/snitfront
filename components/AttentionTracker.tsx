'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Minimize2, Maximize2, Camera } from 'lucide-react';
import { useFlowStore } from '@/lib/store';

interface ClassProbabilities {
  'Actively Looking': number;
  'Confused': number;
  'Talking to Peers': number;
  'Distracted': number;
  'Bored': number;
  'Drowsy': number;
}

interface AttentionData {
  predicted_class: string;
  confidence: number;
  engagement_score: number;
  class_probabilities: ClassProbabilities;
}

interface AttentionTrackerProps {
  isActive: boolean;
}

const ENGAGEMENT_API_URL = 'https://edu-hack-class-classif.onrender.com';

// Mouse position based attention simulation
const calculateAttentionFromMouse = (x: number, y: number, screenWidth: number, screenHeight: number): ClassProbabilities => {
  // Normalize mouse position to 0-1 range
  const normX = x / screenWidth;
  const normY = y / screenHeight;

  // Calculate distance from each quadrant corner
  const topLeft = Math.sqrt(Math.pow(normX, 2) + Math.pow(normY, 2)); // 0,0
  const topRight = Math.sqrt(Math.pow(1 - normX, 2) + Math.pow(normY, 2)); // 1,0
  const bottomLeft = Math.sqrt(Math.pow(normX, 2) + Math.pow(1 - normY, 2)); // 0,1
  const bottomRight = Math.sqrt(Math.pow(1 - normX, 2) + Math.pow(1 - normY, 2)); // 1,1

  // Convert distances to proximity scores (inverse)
  const maxDist = Math.sqrt(2); // Maximum possible distance
  const topLeftScore = 1 - (topLeft / maxDist);
  const topRightScore = 1 - (topRight / maxDist);
  const bottomLeftScore = 1 - (bottomLeft / maxDist);
  const bottomRightScore = 1 - (bottomRight / maxDist);

  // Map corners to classes with heavier exponential scaling for stronger bias near corners
  const activelyLooking = Math.pow(topLeftScore, 3.0) * 0.85 + 0.03;
  const distracted = Math.pow(topRightScore, 3.0) * 0.75 + 0.03;
  const talkingToPeers = Math.pow(bottomLeftScore, 3.0) * 0.65 + 0.03;
  const drowsy = Math.pow(bottomRightScore, 3.0) * 0.7 + 0.03;

  // Confused and Bored are distributed based on middle areas
  const centerX = Math.abs(normX - 0.5);
  const centerY = Math.abs(normY - 0.5);
  const confused = (1 - centerX) * 0.2 + 0.03;
  const bored = (1 - centerY) * 0.15 + 0.03;

  // Normalize to sum to 1
  const total = activelyLooking + confused + talkingToPeers + distracted + bored + drowsy;

  return {
    'Actively Looking': activelyLooking / total,
    'Confused': confused / total,
    'Talking to Peers': talkingToPeers / total,
    'Distracted': distracted / total,
    'Bored': bored / total,
    'Drowsy': drowsy / total,
  };
};

export default function AttentionTracker({ isActive }: AttentionTrackerProps) {
  const { updateFlowScore } = useFlowStore();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [attentionData, setAttentionData] = useState<AttentionData | null>(null);
  const [displayProbabilities, setDisplayProbabilities] = useState<ClassProbabilities>({
    'Actively Looking': 0.16,
    'Confused': 0.16,
    'Talking to Peers': 0.17,
    'Distracted': 0.17,
    'Bored': 0.17,
    'Drowsy': 0.17,
  });
  const [targetProbabilities, setTargetProbabilities] = useState<ClassProbabilities>({
    'Actively Looking': 0.16,
    'Confused': 0.16,
    'Talking to Peers': 0.17,
    'Distracted': 0.17,
    'Bored': 0.17,
    'Drowsy': 0.17,
  });
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [position, setPosition] = useState({ x: window.innerWidth - 370, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [engagementScore, setEngagementScore] = useState(0.5);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const noiseIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const smoothingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track mouse position globally
  useEffect(() => {
    if (!isActive || isClosed || !showStats) return;

    console.log('AttentionTracker: Starting mouse tracking');

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Calculate new target probabilities based on mouse position
      const newTargets = calculateAttentionFromMouse(
        e.clientX,
        e.clientY,
        window.innerWidth,
        window.innerHeight
      );
      setTargetProbabilities(newTargets);
    };

    // Initialize with current mouse position immediately
    const initMousePosition = (e: MouseEvent) => {
      const initialTargets = calculateAttentionFromMouse(
        e.clientX,
        e.clientY,
        window.innerWidth,
        window.innerHeight
      );
      setTargetProbabilities(initialTargets);
      setDisplayProbabilities(initialTargets);
    };

    // Get initial position on first mousemove
    const initHandler = (e: MouseEvent) => {
      initMousePosition(e);
      window.removeEventListener('mousemove', initHandler);
    };

    window.addEventListener('mousemove', initHandler);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', initHandler);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isActive, isClosed, showStats]);

  // Smooth transition to target probabilities
  useEffect(() => {
    if (!isActive || isClosed || !showStats) return;

    smoothingIntervalRef.current = setInterval(() => {
      setDisplayProbabilities(current => {
        const newProbs: ClassProbabilities = {} as ClassProbabilities;
        const smoothingFactor = 0.15; // Lower = smoother (0.1-0.3 is good range)

        Object.keys(current).forEach(key => {
          const k = key as keyof ClassProbabilities;
          const currentVal = current[k];
          const targetVal = targetProbabilities[k];
          
          // Smooth interpolation with small random noise
          const noise = (Math.random() - 0.5) * 0.01; // Very small noise ±0.5%
          newProbs[k] = currentVal + (targetVal - currentVal) * smoothingFactor + noise;
        });

        // Normalize to ensure sum is 1
        const total = Object.values(newProbs).reduce((sum, val) => sum + val, 0);
        Object.keys(newProbs).forEach(key => {
          newProbs[key as keyof ClassProbabilities] /= total;
        });

        return newProbs;
      });
    }, 1000); // Update every 1 second

    return () => {
      if (smoothingIntervalRef.current) {
        clearInterval(smoothingIntervalRef.current);
      }
    };
  }, [isActive, isClosed, targetProbabilities, showStats]);

  // Calculate engagement score and predicted class from probabilities
  useEffect(() => {
    if (!isActive || isClosed) return;

    const engagementScores = {
      'Actively Looking': 1.0,
      'Confused': 0.6,
      'Talking to Peers': 0.5,
      'Distracted': 0.3,
      'Bored': 0.2,
      'Drowsy': 0.1,
    };

    const calculatedScore = Object.entries(displayProbabilities).reduce(
      (score, [className, prob]) => {
        return score + prob * engagementScores[className as keyof ClassProbabilities];
      },
      0
    );

    setEngagementScore(calculatedScore);

    // Update flow score to match engagement score (0-1 scale to 0-100 scale)
    updateFlowScore(calculatedScore * 100);

    // Find class with highest probability
    const maxClass = Object.entries(displayProbabilities).reduce((max, [className, prob]) =>
      prob > max[1] ? [className, prob] : max
    );

    setAttentionData({
      predicted_class: maxClass[0],
      confidence: maxClass[1],
      engagement_score: calculatedScore,
      class_probabilities: displayProbabilities,
    });
  }, [displayProbabilities, isActive, isClosed, updateFlowScore]);

  // Initialize webcam and show feed
  useEffect(() => {
    if (!isActive || isClosed) return;

    setIsVideoReady(false);
    setShowStats(false);

    const initWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsVideoReady(true);
            console.log('Webcam feed ready');
            
            // Wait 2 seconds after video is ready before showing stats
            setTimeout(() => {
              setShowStats(true);
              console.log('Stats display enabled');
            }, 2000);
          };
        }
      } catch (error) {
        console.error('Failed to access webcam:', error);
        setError('Failed to access webcam. Please grant permission.');
      }
    };

    initWebcam();

    return () => {
      // Stop webcam on cleanup
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      setIsVideoReady(false);
      setShowStats(false);
    };
  }, [isActive, isClosed]);

  /* COMMENTED OUT: API Integration with Render
  // Initialize webcam
  useEffect(() => {
    if (isActive && !isClosed) {
      initializeWebcam();
    } else {
      stopWebcam();
    }

    return () => {
      stopWebcam();
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [isActive, isClosed]);

  // Capture and analyze every minute
  useEffect(() => {
    if (isActive && !isClosed && videoRef.current) {
      // Initial capture with delay to allow webcam to initialize
      const initialTimeout = setTimeout(() => {
        captureAndAnalyze();
      }, 2000);
      
      // Capture every 60 seconds
      captureIntervalRef.current = setInterval(() => {
        captureAndAnalyze();
      }, 60000);

      return () => {
        clearTimeout(initialTimeout);
        if (captureIntervalRef.current) {
          clearInterval(captureIntervalRef.current);
        }
      };
    }

    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
    };
  }, [isActive, isClosed]);

  // Add noise to statistics every second
  useEffect(() => {
    if (attentionData && !isClosed && isActive) {
      // Start noise interval
      noiseIntervalRef.current = setInterval(() => {
        addRandomNoise();
      }, 1000);
    }

    return () => {
      if (noiseIntervalRef.current) {
        clearInterval(noiseIntervalRef.current);
      }
    };
  }, [attentionData, isClosed, isActive]);
  */

  /* COMMENTED OUT: Webcam and API functions
  const initializeWebcam = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam not supported');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 224, height: 224 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(err => {
          console.warn('Video play error:', err);
        });
      }
    } catch (err) {
      console.error('Webcam access error:', err);
      setError('Unable to access webcam');
    }
  };

  const stopWebcam = () => {
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => {
          track.stop();
        });
        videoRef.current.srcObject = null;
      }
    } catch (err) {
      console.warn('Error stopping webcam:', err);
    }
  };

  const captureImage = (): string | null => {
    try {
      if (!videoRef.current || !canvasRef.current) return null;

      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      // Check if video is ready
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        console.warn('Video not ready yet');
        return null;
      }
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      canvas.width = 224;
      canvas.height = 224;
      ctx.drawImage(video, 0, 0, 224, 224);
      
      return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    } catch (err) {
      console.error('Error capturing image:', err);
      return null;
    }
  };

  const captureAndAnalyze = async () => {
    if (isCapturing) return;
    
    setIsCapturing(true);
    setError(null);

    try {
      const imageBase64 = captureImage();
      if (!imageBase64) {
        throw new Error('Failed to capture image');
      }

      // Show loading state if this is first request or after error
      if (!attentionData || retryCount > 0) {
        setIsModelLoading(true);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout for cold start

      const response = await fetch(`${ENGAGEMENT_API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64 }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result: AttentionData = await response.json();
      setAttentionData(result);
      setDisplayProbabilities(result.class_probabilities);
      setRetryCount(0);
      setIsModelLoading(false);
    } catch (err: any) {
      console.error('Attention tracking error:', err);
      
      if (err.name === 'AbortError') {
        setError('Model is warming up, please wait...');
        setIsModelLoading(true);
      } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('Waking up model, retrying...');
        setIsModelLoading(true);
      } else {
        setError(err.message || 'Analysis failed');
        setIsModelLoading(false);
      }

      // Retry logic for cold starts
      if (retryCount < 5) {
        const retryDelay = Math.min(10000 * (retryCount + 1), 60000); // Exponential backoff, max 60s
        setRetryCount(prev => prev + 1);
        
        retryTimeoutRef.current = setTimeout(() => {
          captureAndAnalyze();
        }, retryDelay);
      } else {
        setIsModelLoading(false);
      }
    } finally {
      if (!isModelLoading) {
        setIsCapturing(false);
      }
    }
  };

  const addRandomNoise = () => {
    if (!attentionData || !isActive) return;

    setDisplayProbabilities(prev => {
      const newProbs: ClassProbabilities = { ...prev };
      let total = 0;

      // Add random noise (-0.05 to +0.05) to each probability
      Object.keys(newProbs).forEach(key => {
        const noise = (Math.random() - 0.5) * 0.1; // -0.05 to +0.05
        newProbs[key as keyof ClassProbabilities] = Math.max(0, Math.min(1, newProbs[key as keyof ClassProbabilities] + noise));
        total += newProbs[key as keyof ClassProbabilities];
      });

      // Normalize to sum to 1
      Object.keys(newProbs).forEach(key => {
        newProbs[key as keyof ClassProbabilities] /= total;
      });

      return newProbs;
    });
  };
  END OF COMMENTED OUT SECTION */

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMinimized) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (isClosed || !isActive) {
    console.log('AttentionTracker: Not rendering - isClosed:', isClosed, 'isActive:', isActive);
    return null;
  }

  console.log('AttentionTracker: Rendering with probabilities:', displayProbabilities);

  const getEngagementColor = (score: number) => {
    // Smooth color gradient from red (0) -> yellow (0.5) -> green (1)
    const r = score < 0.5 ? 255 : Math.round(255 * (1 - (score - 0.5) * 2));
    const g = score < 0.5 ? Math.round(255 * (score * 2)) : 255;
    const b = 0;
    return `rgb(${r}, ${g}, ${b})`;
  };

  const getBarColor = (className: string) => {
    switch (className) {
      case 'Actively Looking': return 'bg-green-500';
      case 'Confused': return 'bg-yellow-500';
      case 'Talking to Peers': return 'bg-blue-500';
      case 'Distracted': return 'bg-orange-500';
      case 'Bored': return 'bg-red-500';
      case 'Drowsy': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
      {/* Attention Tracker Dialog */}
      <div
        ref={dragRef}
        className="fixed z-50 bg-white rounded-lg shadow-2xl border-2 border-gray-200"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isMinimized ? '250px' : '350px',
          cursor: isDragging ? 'grabbing' : 'default',
        }}
      >
        {/* Header */}
        <div
          className="bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <Camera size={18} />
            <span className="font-semibold text-sm">Attention Tracker</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button
              onClick={() => setIsClosed(true)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="p-4">
            {/* Webcam Feed */}
            <div className="mb-4 relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-40 object-cover rounded-lg bg-gray-900"
              />
              {!isVideoReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2" />
                    <p className="text-white text-sm">Initializing webcam...</p>
                  </div>
                </div>
              )}
              {isVideoReady && !showStats && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <p className="text-white text-sm">Preparing analysis...</p>
                </div>
              )}
            </div>

            {error ? (
              <div className="text-red-600 text-sm text-center py-4">{error}</div>
            ) : showStats && displayProbabilities ? (
              <>
                {/* Engagement Score */}
                <div className="mb-4 text-center">
                  <div className="text-xs text-gray-500 mb-1">Engagement Score</div>
                  <div className="text-3xl font-bold" style={{ color: getEngagementColor(engagementScore) }}>
                    {(engagementScore * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {Object.entries(displayProbabilities).reduce((max, [cls, prob]) => 
                      prob > max[1] ? [cls, prob] : max, ['', 0])[0]}
                  </div>
                </div>

                {/* Class Probabilities */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-700 mb-2">
                    Attention Breakdown
                  </div>
                  {Object.entries(displayProbabilities)
                    .sort((a, b) => b[1] - a[1])
                    .map(([className, probability]) => (
                      <div key={className}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-700">{className}</span>
                          <span className="font-semibold text-gray-900">
                            {(probability * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getBarColor(className)} transition-all duration-500`}
                            style={{ width: `${probability * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>

                {/* Last Update */}
                <div className="mt-3 text-xs text-gray-500 text-center">
                  {isModelLoading ? 'Model warming up...' : isCapturing ? 'Analyzing...' : 'Tracking active'}
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                <div className="text-sm text-gray-600">
                  {isModelLoading ? 'Waking up model...' : 'Initializing tracker...'}
                </div>
                {retryCount > 0 && (
                  <div className="text-xs text-gray-500 mt-2">
                    Retry attempt {retryCount}/5
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
