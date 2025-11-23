'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useFlowStore } from '@/lib/store';
import { useFlowMonitoring } from '@/hooks/useFlowMonitoring';
import FlowIndicator from '@/components/FlowIndicator';
import InterventionOverlay from '@/components/InterventionOverlay';
import AttentionTracker from '@/components/AttentionTracker';
import ReminderManager from '@/components/ReminderManager';
import { Play, Save, Download, Settings, Maximize2, Code2, Terminal, BarChart3 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { executeAPI, sessionsAPI } from '@/lib/api';
import Link from 'next/link';

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

const CODE_SAMPLES: Record<string, string> = {
  javascript: `// Welcome to JavaScript!
// Click "Run" to execute your code

console.log("Hello, World!");

// Variables and functions
const greet = (name) => {
  return \`Hello, \${name}!\`;
};

console.log(greet("Developer"));

// Arrays and loops
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((acc, num) => acc + num, 0);
console.log("Sum:", sum);

// Objects
const person = {
  name: "Alice",
  age: 25,
  city: "New York"
};
console.log("Person:", JSON.stringify(person));

console.log("\\nCode executed successfully! ✨");
`,
  typescript: `// Welcome to TypeScript!
// Static typing for safer code

interface Person {
  name: string;
  age: number;
  city: string;
}

const greet = (name: string): string => {
  return \`Hello, \${name}!\`;
};

console.log(greet("Developer"));

// Type-safe arrays
const numbers: number[] = [1, 2, 3, 4, 5];
const sum: number = numbers.reduce((acc, num) => acc + num, 0);
console.log("Sum:", sum);

// Strongly-typed objects
const person: Person = {
  name: "Alice",
  age: 25,
  city: "New York"
};
console.log("Person:", JSON.stringify(person));

console.log("\\nTypeScript executed successfully! ✨");
`,
  python: `# Welcome to Python!
# Click "Run" to execute your code

print("Hello, World!")

# Variables and functions
def greet(name):
    return f"Hello, {name}!"

print(greet("Developer"))

# Lists and loops
numbers = [1, 2, 3, 4, 5]
total = sum(numbers)
print("Sum:", total)

# Dictionaries
person = {
    "name": "Alice",
    "age": 25,
    "city": "New York"
}
print("Person:", person)

# List comprehension
squares = [x**2 for x in range(1, 6)]
print("Squares:", squares)

print("\\nCode executed successfully! ✨")
`,
  java: `// Welcome to Java!
// Object-oriented programming

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Variables
        String name = "Developer";
        System.out.println("Hello, " + name + "!");
        
        // Arrays and loops
        int[] numbers = {1, 2, 3, 4, 5};
        int sum = 0;
        for (int num : numbers) {
            sum += num;
        }
        System.out.println("Sum: " + sum);
        
        // Methods
        String result = greet("Alice");
        System.out.println(result);
        
        System.out.println("\\nCode executed successfully! ✨");
    }
    
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
}
`,
  cpp: `// Welcome to C++!
// High-performance programming

#include <iostream>
#include <vector>
#include <string>
#include <numeric>

using namespace std;

string greet(string name) {
    return "Hello, " + name + "!";
}

int main() {
    cout << "Hello, World!" << endl;
    
    // Variables and functions
    cout << greet("Developer") << endl;
    
    // Vectors and loops
    vector<int> numbers = {1, 2, 3, 4, 5};
    int sum = accumulate(numbers.begin(), numbers.end(), 0);
    cout << "Sum: " << sum << endl;
    
    // Range-based for loop
    cout << "Numbers: ";
    for (int num : numbers) {
        cout << num << " ";
    }
    cout << endl;
    
    cout << "\\nCode executed successfully! ✨" << endl;
    
    return 0;
}
`,
  csharp: `// Welcome to C#!
// Modern object-oriented language

using System;
using System.Linq;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
        
        // Variables and functions
        Console.WriteLine(Greet("Developer"));
        
        // Arrays and LINQ
        int[] numbers = {1, 2, 3, 4, 5};
        int sum = numbers.Sum();
        Console.WriteLine($"Sum: {sum}");
        
        // Objects
        var person = new {
            Name = "Alice",
            Age = 25,
            City = "New York"
        };
        Console.WriteLine($"Person: {person.Name}, {person.Age}");
        
        Console.WriteLine("\\nCode executed successfully! ✨");
    }
    
    static string Greet(string name) {
        return $"Hello, {name}!";
    }
}
`,
  go: `// Welcome to Go!
// Simple, fast, and reliable

package main

import (
    "fmt"
)

func greet(name string) string {
    return fmt.Sprintf("Hello, %s!", name)
}

func main() {
    fmt.Println("Hello, World!")
    
    // Variables and functions
    fmt.Println(greet("Developer"))
    
    // Slices and loops
    numbers := []int{1, 2, 3, 4, 5}
    sum := 0
    for _, num := range numbers {
        sum += num
    }
    fmt.Printf("Sum: %d\\n", sum)
    
    // Maps
    person := map[string]interface{}{
        "name": "Alice",
        "age":  25,
        "city": "New York",
    }
    fmt.Println("Person:", person)
    
    fmt.Println("\\nCode executed successfully! ✨")
}
`,
  rust: `// Welcome to Rust!
// Safe, concurrent, and fast

fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

fn main() {
    println!("Hello, World!");
    
    // Variables and functions
    println!("{}", greet("Developer"));
    
    // Vectors and iterators
    let numbers = vec![1, 2, 3, 4, 5];
    let sum: i32 = numbers.iter().sum();
    println!("Sum: {}", sum);
    
    // Structs
    struct Person {
        name: String,
        age: u32,
        city: String,
    }
    
    let person = Person {
        name: String::from("Alice"),
        age: 25,
        city: String::from("New York"),
    };
    println!("Person: {}, {}", person.name, person.age);
    
    println!("\\nCode executed successfully! ✨");
}
`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to HTML!</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 10px;
        }
        h1 { color: #ffd700; }
        .feature {
            margin: 15px 0;
            padding: 10px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hello, World! 👋</h1>
        <p>Welcome to HTML - the foundation of the web!</p>
        
        <h2>Features:</h2>
        <div class="feature">✨ Structure and Content</div>
        <div class="feature">🎨 Styling with CSS</div>
        <div class="feature">⚡ Interactive with JavaScript</div>
        
        <ul>
            <li>Semantic markup</li>
            <li>Accessibility</li>
            <li>Responsive design</li>
        </ul>
    </div>
</body>
</html>
`,
  css: `/* Welcome to CSS! */
/* Styling the web beautifully */

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
}

.container {
    max-width: 600px;
    padding: 40px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

h1 {
    font-size: 3rem;
    color: #ffd700;
    text-align: center;
    margin-bottom: 20px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.feature {
    padding: 15px;
    margin: 10px 0;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    transition: transform 0.3s ease;
}

.feature:hover {
    transform: translateX(10px);
}

/* Animations */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.container {
    animation: fadeIn 0.5s ease-in;
}
`,
  json: `{
  "message": "Welcome to JSON!",
  "description": "JavaScript Object Notation - data interchange format",
  "features": [
    "Lightweight",
    "Human-readable",
    "Language-independent",
    "Easy to parse"
  ],
  "person": {
    "name": "Alice",
    "age": 25,
    "city": "New York",
    "skills": ["JavaScript", "Python", "Java"]
  },
  "numbers": [1, 2, 3, 4, 5],
  "isValid": true,
  "nested": {
    "level1": {
      "level2": {
        "level3": "Deep nesting supported"
      }
    }
  },
  "metadata": {
    "version": "1.0",
    "created": "2025-11-22",
    "author": "Developer"
  }
}
`,
  markdown: `# Welcome to Markdown! 📝

Markdown is a lightweight markup language for creating formatted text.

## Features

- **Bold text** and *italic text*
- \`Inline code\` and code blocks
- Links and images
- Lists and tables

## Code Example

\`\`\`javascript
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("World"));
\`\`\`

## Lists

### Ordered List
1. First item
2. Second item
3. Third item

### Unordered List
- Markdown
- HTML
- CSS

## Blockquote

> "Markdown is intended to be as easy-to-read and easy-to-write as is feasible."
> — John Gruber

## Table

| Language   | Type       | Use Case    |
|------------|------------|-------------|
| Python     | Interpreted| General     |
| JavaScript | Interpreted| Web         |
| Rust       | Compiled   | Systems     |

---

**Happy coding!** ✨
`
};

export default function CodeEditorSpace() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isInFlow, startFlowSession, endFlowSession, flowScore } = useFlowStore();
  const { startMonitoring, stopMonitoring, currentMetrics, isMonitoring, updateSessionData, sessionId } = useFlowMonitoring();
  
  const [code, setCode] = useState(CODE_SAMPLES['python']);
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [showMetrics, setShowMetrics] = useState(true);
  const [lineCount, setLineCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(0);
  const [keystrokesPerMinute, setKeystrokesPerMinute] = useState(0);
  const [codeComplexity, setCodeComplexity] = useState(0);
  const [syntaxErrors, setSyntaxErrors] = useState(0);
  const [lastEditTime, setLastEditTime] = useState<number>(Date.now());
  const [editHistory, setEditHistory] = useState<number[]>([]);
  const [charTimestamps, setCharTimestamps] = useState<number[]>([]);
  const [focusTime, setFocusTime] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [pasteCount, setPasteCount] = useState(0);
  const [activeLineTime, setActiveLineTime] = useState(0);
  const editorRef = useRef<any>(null);
  const keystrokeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const focusTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    // Load sample code when language changes
    setCode(CODE_SAMPLES[language] || CODE_SAMPLES['python']);
    
    // Update session language if in active session
    if (isInFlow && updateSessionData && sessionId) {
      updateSessionData({ language });
    }
  }, [language, isInFlow, updateSessionData, sessionId]);

  useEffect(() => {
    // Calculate stats and complexity metrics
    const lines = code.split('\n').length;
    const words = code.split(/\s+/).filter(w => w.length > 0).length;
    const chars = code.length;
    
    setLineCount(lines);
    setWordCount(words);
    setCharCount(chars);
    
    // Calculate code complexity (simple heuristic)
    const complexityIndicators = [
      (code.match(/if|else|switch|case/g) || []).length * 2, // Conditionals
      (code.match(/for|while|do/g) || []).length * 3, // Loops
      (code.match(/function|def|class|interface/g) || []).length * 4, // Functions/Classes
      (code.match(/try|catch|throw|except/g) || []).length * 2, // Error handling
      (code.match(/async|await|promise/gi) || []).length * 3, // Async code
    ];
    const complexity = complexityIndicators.reduce((a, b) => a + b, 0);
    setCodeComplexity(Math.min(100, complexity));
    
    // Simple syntax error detection
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    const openBrackets = (code.match(/\[/g) || []).length;
    const closeBrackets = (code.match(/\]/g) || []).length;
    
    const errors = Math.abs(openBraces - closeBraces) + 
                   Math.abs(openParens - closeParens) + 
                   Math.abs(openBrackets - closeBrackets);
    setSyntaxErrors(errors);
  }, [code]);

  // Track focus time
  useEffect(() => {
    if (isInFlow) {
      focusTimerRef.current = setInterval(() => {
        setFocusTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (focusTimerRef.current) {
        clearInterval(focusTimerRef.current);
      }
    };
  }, [isInFlow]);

  // Calculate typing speed and keystrokes per minute
  useEffect(() => {
    const now = Date.now();
    const timeDiff = (now - lastEditTime) / 1000 / 60; // minutes
    
    if (timeDiff > 0 && timeDiff < 1) {
      const recentEdits = editHistory.filter(time => now - time < 60000); // Last minute
      setKeystrokesPerMinute(recentEdits.length);
    }
    
    if (keystrokeTimerRef.current) {
      clearTimeout(keystrokeTimerRef.current);
    }
    
    keystrokeTimerRef.current = setTimeout(() => {
      setKeystrokesPerMinute(0);
    }, 5000);
    
    return () => {
      if (keystrokeTimerRef.current) {
        clearTimeout(keystrokeTimerRef.current);
      }
    };
  }, [code, lastEditTime, editHistory]);

  // Calculate WPM based on 5-second window
  useEffect(() => {
    const now = Date.now();
    const fiveSecondsAgo = now - 5000;
    
    // Filter timestamps to only last 5 seconds
    const recentChars = charTimestamps.filter(timestamp => timestamp >= fiveSecondsAgo);
    
    // WPM = characters in last 5 seconds / 5
    const wpm = Math.floor(recentChars.length / 5);
    setTypingSpeed(wpm);
    
    // Clean up old timestamps (older than 5 seconds)
    if (charTimestamps.length > 0) {
      const cleanedTimestamps = charTimestamps.filter(timestamp => timestamp >= fiveSecondsAgo);
      if (cleanedTimestamps.length !== charTimestamps.length) {
        setCharTimestamps(cleanedTimestamps);
      }
    }
  }, [charTimestamps]);

  const handleStartSession = async () => {
    startFlowSession();
    await startMonitoring();
    
    // Save initial language after a brief delay to ensure session is created
    setTimeout(async () => {
      if (updateSessionData) {
        await updateSessionData({ language });
      }
    }, 500);
  };

  const handleEndSession = async () => {
    // Save final metrics before ending session
    if (updateSessionData && sessionId) {
      await updateSessionData({
        language,
        codeMetrics: {
          linesOfCode: lineCount,
          charactersTyped: charCount,
          complexityScore: codeComplexity,
          errorsFixed: backspaceCount,
        },
      });
    }
    
    stopMonitoring();
    endFlowSession();
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus();
    
    // Track keystrokes
    editor.onDidChangeModelContent((e: any) => {
      setTotalKeystrokes(prev => prev + 1);
      setLastEditTime(Date.now());
      setEditHistory(prev => [...prev.slice(-60), Date.now()]);
      
      // Track each character typed with timestamp for WPM calculation
      if (e.changes && e.changes.length > 0) {
        e.changes.forEach((change: any) => {
          if (change.text && change.text.length > 0) {
            // Add timestamp for each character typed
            const now = Date.now();
            const newTimestamps = Array(change.text.length).fill(now);
            setCharTimestamps(prev => [...prev, ...newTimestamps]);
          }
          if (change.text === '' && change.rangeLength > 0) {
            // Backspace - remove timestamps
            setCharTimestamps(prev => prev.slice(0, -change.rangeLength));
            setBackspaceCount(prev => prev + 1);
          }
        });
      }
    });
    
    // Track paste events
    editor.onDidPaste(() => {
      setPasteCount(prev => prev + 1);
    });
  };

  const handleRunCode = async () => {
    setOutput('Running code...\n');
    
    try {
      // Use backend API with Piston for real code execution
      const response = await executeAPI.run(language, code);
      const result = response.data;
      
      let output = '';
      let hasError = false;
      
      if (result.output) {
        output += '✅ Output:\n' + result.output + '\n';
      }
      
      if (result.error) {
        hasError = true;
        output += '\n❌ Error:\n' + result.error + '\n';
      }
      
      if (result.exitCode !== 0) {
        hasError = true;
        output += '\n⚠️ Exit Code: ' + result.exitCode + ' (non-zero indicates error)\n';
      }
      
      if (!output.trim()) {
        output = '✅ Code executed successfully (no output)';
      }
      
      setOutput(output);
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
            logs.push('❌ ERROR: ' + args.map(arg => String(arg)).join(' '));
          };
          console.warn = (...args: any[]) => {
            logs.push('⚠️ WARNING: ' + args.map(arg => String(arg)).join(' '));
          };
          
          const result = (function() {
            return eval(code);
          })();
          
          console.log = originalLog;
          console.error = originalError;
          console.warn = originalWarn;
          
          let output = '';
          if (logs.length > 0) {
            output = '✅ Output:\n' + logs.join('\n') + '\n';
          }
          if (result !== undefined) {
            output += '\n📤 Returned: ' + (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result));
          }
          
          setOutput(output || '✅ Code executed successfully (no output)');
        } catch (evalError: any) {
          setOutput('❌ Syntax Error:\n' + evalError.message + '\n\n📋 Stack Trace:\n' + (evalError.stack || 'No stack trace available'));
        }
      } else {
        setOutput('❌ Backend execution failed:\n' + (error.response?.data?.error || error.message) + '\n\n⚠️ Note: Backend may be offline. Try starting the backend server.');
      }
    }
  };

  const handleSaveCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'code.' + (language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'txt');
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
      <AttentionTracker isActive={isInFlow} />
      <ReminderManager isActive={isInFlow} />

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
            
            <Link
              href="/spaces/code-analytics"
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              title="View Code Analytics"
            >
              <BarChart3 size={18} />
              Analytics
            </Link>
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
                value={typingSpeed}
                unit="WPM"
                color="text-blue-400"
              />
              
              <MetricCard
                label="Keystrokes/Min"
                value={keystrokesPerMinute}
                unit="keys"
                color="text-cyan-400"
              />
              
              <MetricCard
                label="Lines of Code"
                value={lineCount}
                unit="lines"
                color="text-green-400"
              />
              
              <MetricCard
                label="Characters"
                value={charCount}
                unit="chars"
                color="text-yellow-400"
              />
              
              <MetricCard
                label="Words"
                value={wordCount}
                unit="words"
                color="text-purple-400"
              />
              
              <MetricCard
                label="Code Complexity"
                value={codeComplexity}
                unit="%"
                color="text-orange-400"
              />
              
              <MetricCard
                label="Syntax Errors"
                value={syntaxErrors}
                unit="errors"
                color="text-red-400"
              />
              
              <MetricCard
                label="Total Keystrokes"
                value={totalKeystrokes}
                unit="keys"
                color="text-indigo-400"
              />
              
              <MetricCard
                label="Backspaces"
                value={backspaceCount}
                unit="times"
                color="text-pink-400"
              />
              
              <MetricCard
                label="Paste Actions"
                value={pasteCount}
                unit="times"
                color="text-teal-400"
              />
              
              <MetricCard
                label="Focus Time"
                value={Math.floor(focusTime / 60)}
                unit="min"
                color="text-emerald-400"
              />
              
              <MetricCard
                label="Distractions"
                value={currentMetrics.tabSwitches}
                unit="switches"
                color="text-red-500"
              />
            </div>

            {/* Advanced Analytics Section */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h4 className="text-white text-sm font-semibold mb-4">Performance Analytics</h4>
              
              {/* Typing Efficiency */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-gray-400">Typing Efficiency</span>
                  <span className="text-white font-semibold">
                    {totalKeystrokes > 0 ? Math.round(((totalKeystrokes - backspaceCount) / totalKeystrokes) * 100) : 100}%
                  </span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                    style={{ width: (totalKeystrokes > 0 ? ((totalKeystrokes - backspaceCount) / totalKeystrokes) * 100 : 100) + '%' }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {backspaceCount} corrections out of {totalKeystrokes} keystrokes
                </p>
              </div>

              {/* Code Quality Score */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-gray-400">Code Quality</span>
                  <span className="text-white font-semibold">
                    {Math.max(0, 100 - (syntaxErrors * 10))}%
                  </span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                    style={{ width: Math.max(0, 100 - (syntaxErrors * 10)) + '%' }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {syntaxErrors === 0 ? 'No syntax issues detected' : syntaxErrors + ' potential issues found'}
                </p>
              </div>

              {/* Engagement Correlation */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-gray-400">Engagement Level</span>
                  <span className="text-white font-semibold">
                    {Math.round(flowScore)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-red-500 transition-all duration-500"
                    style={{ width: flowScore + '%' }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Based on attention tracking and typing patterns
                </p>
              </div>

              {/* Productivity Score */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-gray-400">Productivity Score</span>
                  <span className="text-white font-semibold">
                    {Math.round((keystrokesPerMinute * 0.3) + (flowScore * 0.5) + ((100 - currentMetrics.tabSwitches * 5) * 0.2))}%
                  </span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                    style={{ width: Math.round((keystrokesPerMinute * 0.3) + (flowScore * 0.5) + ((100 - currentMetrics.tabSwitches * 5) * 0.2)) + '%' }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Combined metric: typing speed, focus, and minimal distractions
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <h4 className="text-white text-sm font-semibold mb-3">Focus Level</h4>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-primary transition-all duration-500"
                  style={{ width: flowScore + '%' }}
                />
              </div>
            </div>

            {/* Session Summary */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h4 className="text-white text-sm font-semibold mb-3">Session Summary</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg. Typing Speed:</span>
                  <span className="text-white">{typingSpeed} WPM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Code-to-Delete Ratio:</span>
                  <span className="text-white">
                    {totalKeystrokes > 0 ? (totalKeystrokes / Math.max(1, backspaceCount)).toFixed(1) : '0'}:1
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Complexity Index:</span>
                  <span className="text-white">{codeComplexity}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Coding Time:</span>
                  <span className="text-white">{Math.floor(focusTime / 60)}m {focusTime % 60}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Paste Efficiency:</span>
                  <span className="text-white">
                    {totalKeystrokes > 0 ? ((pasteCount / (totalKeystrokes / 100)) * 10).toFixed(1) : '0'}%
                  </span>
                </div>
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
      <div className={'text-2xl font-bold ' + color}>
        {value}
        {unit && <span className="text-sm ml-1 text-gray-500">{unit}</span>}
      </div>
    </div>
  );
}
