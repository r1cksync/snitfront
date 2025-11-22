'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useFlowStore } from '@/lib/store';
import { useFlowMonitoring } from '@/hooks/useFlowMonitoring';
import FlowIndicator from '@/components/FlowIndicator';
import InterventionOverlay from '@/components/InterventionOverlay';
import { Play, Save, Download, Settings, Maximize2, Code2, Terminal } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { executeAPI } from '@/lib/api';

const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
];

export default function CodeEditorSpace() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isInFlow, startFlowSession, endFlowSession, flowScore } = useFlowStore();
  const { startMonitoring, stopMonitoring, currentMetrics, isMonitoring } = useFlowMonitoring();
  
  const [code, setCode] = useState(`# Welcome to the Code Editor!
# This uses Piston API to execute code in 60+ languages
# Click "Run" to execute your code

print("Hello, World!")
print("Math calculation:", 2 + 2)

# Variables and functions
numbers = [1, 2, 3, 4, 5]
total = sum(numbers)
print("Sum of numbers:", total)

# Loops
for i in range(3):
    print(f"Iteration {i + 1}")

print("\\nCode executed successfully! ✨")
`);
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [showMetrics, setShowMetrics] = useState(true);
  const [lineCount, setLineCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    // Calculate stats
    const lines = code.split('\n').length;
    const words = code.split(/\s+/).filter(w => w.length > 0).length;
    setLineCount(lines);
    setWordCount(words);
  }, [code]);

  const handleStartSession = async () => {
    startFlowSession();
    await startMonitoring();
  };

  const handleEndSession = () => {
    stopMonitoring();
    endFlowSession();
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleRunCode = async () => {
    setOutput('Running code...\n');
    
    try {
      // Use backend API with Piston for real code execution
      const response = await executeAPI.run(language, code);
      const result = response.data;
      
      let output = '';
      
      if (result.output) {
        output += 'Output:\n' + result.output + '\n';
      }
      
      if (result.error) {
        output += '\nErrors/Warnings:\n' + result.error;
      }
      
      if (result.exitCode !== 0) {
        output += `\n\nExit Code: ${result.exitCode}`;
      }
      
      setOutput(output || 'Code executed successfully (no output)');
    } catch (error: any) {
      console.error('Execution error:', error);
      
      // Fallback to client-side execution for JavaScript/TypeScript
      if (language === 'javascript' || language === 'typescript') {
        try {
          const logs: string[] = [];
          const originalLog = console.log;
          const originalError = console.error;
          const originalWarn = console.warn;
          
          console.log = (...args: any[]) => {
            logs.push(args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '));
          };
          console.error = (...args: any[]) => {
            logs.push('ERROR: ' + args.map(arg => String(arg)).join(' '));
          };
          console.warn = (...args: any[]) => {
            logs.push('WARNING: ' + args.map(arg => String(arg)).join(' '));
          };
          
          const result = (function() {
            return eval(code);
          })();
          
          console.log = originalLog;
          console.error = originalError;
          console.warn = originalWarn;
          
          let output = '';
          if (logs.length > 0) {
            output = logs.join('\n') + '\n';
          }
          if (result !== undefined) {
            output += '\nReturned: ' + (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result));
          }
          
          setOutput(output || 'Code executed successfully (no output)');
        } catch (evalError: any) {
          setOutput(`Error: ${evalError.message}\n\nStack trace:\n${evalError.stack || 'No stack trace available'}`);
        }
      } else {
        setOutput(`Backend execution failed: ${error.response?.data?.error || error.message}\n\nBackend may be offline.`);
      }
    }
  };

  const handleSaveCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'txt'}`;
    a.click();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <FlowIndicator />
      <InterventionOverlay />

      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Code2 className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-white">Code Editor</h1>
            
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-700 text-white px-3 py-1.5 rounded-lg border border-gray-600 focus:border-primary focus:outline-none"
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            {!isInFlow ? (
              <button
                onClick={handleStartSession}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Play size={18} />
                Start Flow Session
              </button>
            ) : (
              <button
                onClick={handleEndSession}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                End Session
              </button>
            )}
            
            <button
              onClick={handleRunCode}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Terminal size={18} />
              Run
            </button>
            
            <button
              onClick={handleSaveCode}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Save size={18} />
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Maximize2 size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              onMount={handleEditorDidMount}
              theme={theme}
              options={{
                fontSize,
                minimap: { enabled: true },
                lineNumbers: 'on',
                roundedSelection: true,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                cursorBlinking: 'smooth',
                smoothScrolling: true,
              }}
            />
          </div>

          {/* Output Console */}
          <div className="h-48 bg-gray-950 border-t border-gray-700 p-4 overflow-auto">
            <div className="flex items-center gap-2 mb-2">
              <Terminal size={16} className="text-gray-400" />
              <span className="text-gray-400 text-sm font-semibold">OUTPUT</span>
            </div>
            <pre className="text-gray-300 text-sm font-mono">{output || 'No output yet. Run your code to see results.'}</pre>
          </div>
        </div>

        {/* Metrics Sidebar */}
        {showMetrics && isInFlow && (
          <div className="w-64 bg-gray-800 border-l border-gray-700 p-4 overflow-auto">
            <h3 className="text-white font-semibold mb-4">Flow Metrics</h3>
            
            <div className="space-y-4">
              <MetricCard
                label="Flow Score"
                value={Math.round(flowScore)}
                unit=""
                color="text-primary"
              />
              
              <MetricCard
                label="Typing Speed"
                value={Math.round(currentMetrics.typingSpeed)}
                unit="keys/min"
                color="text-blue-400"
              />
              
              <MetricCard
                label="Lines of Code"
                value={lineCount}
                unit="lines"
                color="text-green-400"
              />
              
              <MetricCard
                label="Words"
                value={wordCount}
                unit="words"
                color="text-purple-400"
              />
              
              <MetricCard
                label="Distractions"
                value={currentMetrics.tabSwitches}
                unit="switches"
                color="text-red-400"
              />
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <h4 className="text-white text-sm font-semibold mb-3">Focus Level</h4>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
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

function MetricCard({ label, value, unit, color }: any) {
  return (
    <div className="bg-gray-900 rounded-lg p-3">
      <div className="text-gray-400 text-xs mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>
        {value}
        {unit && <span className="text-sm ml-1 text-gray-500">{unit}</span>}
      </div>
    </div>
  );
}
