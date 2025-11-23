'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useFlowStore } from '@/lib/store';
import { useFlowMonitoring } from '@/hooks/useFlowMonitoring';
import FlowIndicator from '@/components/FlowIndicator';
import InterventionOverlay from '@/components/InterventionOverlay';
import AttentionTracker from '@/components/AttentionTracker';
import { sessionsAPI } from '@/lib/api';
import {
  Play,
  Pencil,
  Eraser,
  Square,
  Circle,
  Type,
  Minus,
  Download,
  Trash2,
  Palette,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';

type Tool = 'pen' | 'eraser' | 'rectangle' | 'circle' | 'line' | 'text';

const COLORS = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF'];

export default function WhiteboardSpace() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isInFlow, startFlowSession, endFlowSession, flowScore } = useFlowStore();
  const { startMonitoring, stopMonitoring, currentMetrics } = useFlowMonitoring();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [strokes, setStrokes] = useState(0);
  
  // Whiteboard-specific analytics
  const [shapesDrawn, setShapesDrawn] = useState(0);
  const [colorsUsedSet, setColorsUsedSet] = useState<Set<string>>(new Set(['#000000']));
  const [eraserUses, setEraserUses] = useState(0);
  const [toolSwitches, setToolSwitches] = useState(0);
  const [strokeStartTime, setStrokeStartTime] = useState(0);
  const [totalStrokeTime, setTotalStrokeTime] = useState(0);
  const [pixelsDrawn, setPixelsDrawn] = useState(0);
  const [lastTool, setLastTool] = useState<Tool>('pen');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const handleStartSession = async () => {
    startFlowSession();
    await startMonitoring();
    
    // Reset whiteboard metrics
    setStrokes(0);
    setShapesDrawn(0);
    setColorsUsedSet(new Set([color]));
    setEraserUses(0);
    setToolSwitches(0);
    setTotalStrokeTime(0);
    setPixelsDrawn(0);
  };

  const calculateCanvasCoverage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let nonWhitePixels = 0;
    
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      // Check if pixel is not white
      if (r < 250 || g < 250 || b < 250) {
        nonWhitePixels++;
      }
    }
    
    return (nonWhitePixels / (pixels.length / 4)) * 100;
  };

  const calculateCreativityScore = () => {
    const colorDiversity = Math.min((colorsUsedSet.size / COLORS.length) * 40, 40);
    const shapeComplexity = Math.min((shapesDrawn / 20) * 30, 30);
    const canvasCoverage = calculateCanvasCoverage();
    const coverageScore = Math.min(canvasCoverage, 30);
    
    return Math.round(colorDiversity + shapeComplexity + coverageScore);
  };

  const handleEndSession = async () => {
    stopMonitoring();
    endFlowSession();
    
    // Metrics will be saved through the flow store
    console.log('Whiteboard session ended with metrics:', {
      strokes,
      shapesDrawn,
      colorsUsed: colorsUsedSet.size,
      creativityScore: calculateCreativityScore(),
    });
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setIsDrawing(true);
    setStartPos(pos);
    setStrokeStartTime(Date.now());

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 3 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Track color usage
    if (tool !== 'eraser' && !colorsUsedSet.has(color)) {
      setColorsUsedSet(prev => new Set(prev).add(color));
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const pos = getMousePos(e);

    if (tool === 'pen' || tool === 'eraser') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const pos = getMousePos(e);
    
    // Track stroke time
    const strokeTime = (Date.now() - strokeStartTime) / 1000; // in seconds
    setTotalStrokeTime(prev => prev + strokeTime);

    if (tool === 'rectangle') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(
        startPos.x,
        startPos.y,
        pos.x - startPos.x,
        pos.y - startPos.y
      );
      setShapesDrawn(prev => prev + 1);
    } else if (tool === 'circle') {
      const radius = Math.sqrt(
        Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2)
      );
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
      setShapesDrawn(prev => prev + 1);
    } else if (tool === 'line') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      setShapesDrawn(prev => prev + 1);
    }
    
    if (tool === 'eraser') {
      setEraserUses(prev => prev + 1);
    }

    setIsDrawing(false);
    setStrokes(prev => prev + 1);
  };
  
  // Track tool switches
  useEffect(() => {
    if (isInFlow && tool !== lastTool) {
      setToolSwitches(prev => prev + 1);
      setLastTool(tool);
    }
  }, [tool, isInFlow, lastTool]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Reset metrics
    if (!isInFlow) {
      setStrokes(0);
      setShapesDrawn(0);
      setColorsUsedSet(new Set([color]));
      setEraserUses(0);
      setToolSwitches(0);
      setTotalStrokeTime(0);
      setPixelsDrawn(0);
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <FlowIndicator />
      <InterventionOverlay />
      <AttentionTracker isActive={isInFlow} />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Pencil className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-gray-900">Whiteboard</h1>
            {isInFlow && (
              <div className="flex items-center gap-3 ml-4">
                <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                  Creativity: {calculateCreativityScore()}/100
                </div>
                <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  Colors: {colorsUsedSet.size}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/spaces/whiteboard-analytics">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <BarChart3 size={18} />
                Analytics
              </button>
            </Link>
            {!isInFlow ? (
              <button
                onClick={handleStartSession}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Play size={18} />
                Start Session
              </button>
            ) : (
              <button
                onClick={handleEndSession}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                End Session
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Toolbar */}
        <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-2">
          <ToolButton
            icon={Pencil}
            active={tool === 'pen'}
            onClick={() => setTool('pen')}
            tooltip="Pen"
          />
          <ToolButton
            icon={Eraser}
            active={tool === 'eraser'}
            onClick={() => setTool('eraser')}
            tooltip="Eraser"
          />
          <ToolButton
            icon={Square}
            active={tool === 'rectangle'}
            onClick={() => setTool('rectangle')}
            tooltip="Rectangle"
          />
          <ToolButton
            icon={Circle}
            active={tool === 'circle'}
            onClick={() => setTool('circle')}
            tooltip="Circle"
          />
          <ToolButton
            icon={Minus}
            active={tool === 'line'}
            onClick={() => setTool('line')}
            tooltip="Line"
          />
          
          <div className="w-full h-px bg-gray-200 my-2" />
          
          {/* Color Picker */}
          <div className="flex flex-col gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-lg border-2 transition-all ${
                  color === c ? 'border-primary scale-110' : 'border-gray-300'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          
          <div className="w-full h-px bg-gray-200 my-2" />
          
          {/* Line Width */}
          <div className="flex flex-col gap-2">
            {[2, 4, 8].map((width) => (
              <button
                key={width}
                onClick={() => setLineWidth(width)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all ${
                  lineWidth === width ? 'border-primary bg-primary/10' : 'border-gray-300'
                }`}
              >
                <div
                  className="rounded-full bg-gray-800"
                  style={{ width: width, height: width }}
                />
              </button>
            ))}
          </div>
          
          <div className="w-full h-px bg-gray-200 my-2" />
          
          <ToolButton
            icon={Download}
            active={false}
            onClick={downloadCanvas}
            tooltip="Download"
          />
          <ToolButton
            icon={Trash2}
            active={false}
            onClick={clearCanvas}
            tooltip="Clear"
          />
        </div>

        {/* Canvas */}
        <div className="flex-1 relative bg-white">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>

        {/* Stats Sidebar */}
        {isInFlow && (
          <div className="w-64 bg-white border-l border-gray-200 p-4 overflow-auto">
            <h3 className="text-gray-900 font-semibold mb-4">Session Metrics</h3>
            
            <div className="space-y-3">
              <MetricCard
                label="Flow Score"
                value={Math.round(flowScore)}
                color="text-primary"
              />
              
              <MetricCard
                label="Creativity"
                value={calculateCreativityScore()}
                color="text-purple-600"
              />
              
              <MetricCard
                label="Total Strokes"
                value={strokes}
                color="text-blue-600"
              />
              
              <MetricCard
                label="Shapes Drawn"
                value={shapesDrawn}
                color="text-green-600"
              />
              
              <MetricCard
                label="Colors Used"
                value={colorsUsedSet.size}
                color="text-pink-600"
              />
              
              <MetricCard
                label="Tool Switches"
                value={toolSwitches}
                color="text-orange-600"
              />
              
              <MetricCard
                label="Eraser Uses"
                value={eraserUses}
                color="text-gray-600"
              />
              
              <MetricCard
                label="Distractions"
                value={currentMetrics.tabSwitches}
                color="text-red-600"
              />
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-gray-700 text-sm font-semibold mb-3">Canvas Coverage</h4>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${Math.min(calculateCanvasCoverage(), 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(calculateCanvasCoverage())}% of canvas used
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-gray-700 text-sm font-semibold mb-3">Focus Level</h4>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-primary transition-all duration-500"
                  style={{ width: `${flowScore}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ToolButton({ icon: Icon, active, onClick, tooltip }: any) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
        active
          ? 'bg-primary text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Icon size={20} />
    </button>
  );
}

function MetricCard({ label, value, color }: any) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="text-gray-500 text-xs mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
