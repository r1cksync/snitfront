'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useFlowStore } from '@/lib/store';
import { useFlowMonitoring } from '@/hooks/useFlowMonitoring';
import FlowIndicator from '@/components/FlowIndicator';
import InterventionOverlay from '@/components/InterventionOverlay';
import AttentionTracker from '@/components/AttentionTracker';
import { Play, PenTool, FileText, Sparkles, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function WritingSpace() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isInFlow, startFlowSession, endFlowSession, flowScore } = useFlowStore();
  const { startMonitoring, stopMonitoring, currentMetrics } = useFlowMonitoring();
  
  const [markdown, setMarkdown] = useState('# Start writing...\n\n');
  const [showPreview, setShowPreview] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [paragraphCount, setParagraphCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [writingStreak, setWritingStreak] = useState(0);
  const [aiSuggestion, setAiSuggestion] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    // Calculate stats
    const words = markdown.split(/\s+/).filter(w => w.length > 0).length;
    const chars = markdown.length;
    const paragraphs = markdown.split(/\n\n+/).filter(p => p.trim().length > 0).length;
    const readTime = Math.ceil(words / 200);
    
    setWordCount(words);
    setCharCount(chars);
    setParagraphCount(paragraphs);
    setReadingTime(readTime);
  }, [markdown]);

  useEffect(() => {
    // Track writing streak
    if (isInFlow && currentMetrics.typingSpeed > 20) {
      setWritingStreak(prev => prev + 1);
    }
  }, [isInFlow, currentMetrics.typingSpeed]);

  const handleStartSession = async () => {
    startFlowSession();
    await startMonitoring();
  };

  const handleEndSession = () => {
    stopMonitoring();
    endFlowSession();
  };

  const handleAiAssist = async () => {
    setAiSuggestion('Generating AI suggestions...');
    
    // Simulate AI suggestion (in production, call Groq API)
    setTimeout(() => {
      const suggestions = [
        'Consider adding more specific examples to illustrate your points.',
        'Try varying your sentence length for better rhythm and flow.',
        'Your writing is clear, but could benefit from stronger transitions between paragraphs.',
        'Great work! Consider adding a compelling call-to-action at the end.',
      ];
      setAiSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)]);
    }, 1500);
  };

  const handleExport = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FlowIndicator />
      <InterventionOverlay />
      <AttentionTracker isActive={isInFlow} />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <PenTool className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-gray-900">Writing Space</h1>
          </div>

          <div className="flex items-center gap-3">
            {!isInFlow ? (
              <button
                onClick={handleStartSession}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Play size={18} />
                Start Writing
              </button>
            ) : (
              <button
                onClick={handleEndSession}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                End Session
              </button>
            )}
            
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FileText size={18} />
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
            
            <button
              onClick={handleAiAssist}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Sparkles size={18} />
              AI Assist
            </button>
            
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Writing Area */}
          <div className={showPreview ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <div className="bg-white rounded-xl shadow-sm p-8 min-h-[600px]">
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="w-full h-full min-h-[550px] border-none focus:outline-none resize-none text-gray-800 font-mono text-base leading-relaxed"
                placeholder="Start writing your masterpiece..."
              />
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-8 min-h-[600px] overflow-auto sticky top-24">
                <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase">Preview</h3>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{markdown}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {/* Stats Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Writing Stats */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Writing Stats</h3>
              <div className="space-y-3">
                <StatRow label="Words" value={wordCount.toLocaleString()} color="text-blue-600" />
                <StatRow label="Characters" value={charCount.toLocaleString()} color="text-green-600" />
                <StatRow label="Paragraphs" value={paragraphCount} color="text-purple-600" />
                <StatRow label="Reading Time" value={`${readingTime} min`} color="text-orange-600" />
              </div>
            </div>

            {/* Flow Metrics */}
            {isInFlow && (
              <div className="bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-xl shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Flow Metrics</h3>
                <div className="space-y-3">
                  <MetricBar label="Flow Score" value={flowScore} color="bg-primary" />
                  <MetricBar
                    label="Writing Speed"
                    value={Math.min(100, (currentMetrics.typingSpeed / 80) * 100)}
                    color="bg-green-500"
                  />
                  <MetricBar
                    label="Consistency"
                    value={Math.min(100, writingStreak * 2)}
                    color="bg-purple-500"
                  />
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Typing Speed</span>
                    <span className="font-semibold text-primary">
                      {Math.round(currentMetrics.typingSpeed)} keys/min
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* AI Suggestions */}
            {aiSuggestion && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl shadow-sm p-4">
                <div className="flex items-start gap-2">
                  <Sparkles size={16} className="text-purple-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-purple-900 mb-2">AI Suggestion</h3>
                    <p className="text-sm text-purple-800">{aiSuggestion}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Writing Tips */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Writing Tips</h3>
              <ul className="space-y-2 text-xs text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Write freely without editing. Polish later.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Take breaks every 25-30 minutes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Set daily word count goals.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Read your work aloud to catch errors.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, color }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-lg font-bold ${color}`}>{value}</span>
    </div>
  );
}

function MetricBar({ label, value, color }: any) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-800">{Math.round(value)}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
