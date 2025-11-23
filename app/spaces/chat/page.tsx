'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signIn } from 'next-auth/react';
import { Send, Bot, User, Brain, Activity, Music, Clock, Zap, Heart } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'insight' | 'recommendation';
}

interface UserContext {
  name: string;
  email?: string;
  flowSessions: number; // Keep for backward compatibility
  totalSessions?: number; // New property
  avgFlowScore: number;
  totalFocusTime: number;
  avgSessionDuration?: number;
  favoriteActivity: string;
  activityBreakdown?: Record<string, number>;
  stressLevel: number;
  sleepQuality: number;
  currentMood: string;
  recentSpotifyGenres: string[];
  whiteboardInsights?: {
    avgCreativityScore: number;
    totalStrokes: number;
    avgColorsUsed: number;
  };
  trends?: {
    weeklyAvgScore: number;
    weeklySessionCount: number;
    improvementRate: string;
  };
  personalInsights?: string[];
  mentalHealthTips?: string[];
}

const predefinedQuestions = [
  "How can I improve my focus during work?",
  "What breathing exercises help with anxiety?", 
  "Analyze my flow session patterns",
  "How does music affect my productivity?",
  "What's my optimal session duration?",
  "How can I reduce stress naturally?",
  "Show me my progress this week",
  "What are my best performing activities?"
];

const ChatSpace = () => {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Show loading or sign in prompt if not authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-lg p-8">
          <Brain className="w-16 h-16 text-blue-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">AI Mental Health Assistant</h2>
          <p className="text-gray-600 mb-6">
            Sign in to access your personalized mental health chatbot with your flow session data and insights.
          </p>
          <button
            onClick={() => signIn()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  // Fetch user context data from API
  useEffect(() => {
    const fetchUserContext = async () => {
      try {
        const response = await fetch('/api/chat/context');
        if (response.ok) {
          const data = await response.json();
          setUserContext(data);

          // Initial welcome message with real data
          const welcomeMessage: Message = {
            id: '1',
            content: `Hello ${data.name}! 👋 I'm your personal mental health and productivity assistant. I have access to your flow session data (${data.totalSessions || data.flowSessions} sessions), Spotify listening habits, and wellness metrics. How can I help you optimize your mental well-being today?`,
            sender: 'bot',
            timestamp: new Date(),
            type: 'text'
          };
          setMessages([welcomeMessage]);
        }
      } catch (error) {
        console.error('Failed to fetch user context:', error);
        // Fallback to mock data
        const mockContext: UserContext = {
          name: "User",
          flowSessions: 0,
          avgFlowScore: 0,
          totalFocusTime: 0,
          favoriteActivity: "coding",
          stressLevel: 5,
          sleepQuality: 7,
          currentMood: "neutral",
          recentSpotifyGenres: ["lo-fi", "ambient"]
        };
        setUserContext(mockContext);

        const welcomeMessage: Message = {
          id: '1',
          content: `Hello! 👋 I'm your personal mental health and productivity assistant. Start using flow sessions to get personalized insights! How can I help you today?`,
          sender: 'bot',
          timestamp: new Date(),
          type: 'text'
        };
        setMessages([welcomeMessage]);
      }
    };

    fetchUserContext();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = async (userMessage: string): Promise<Message> => {
    const message = userMessage.toLowerCase();
    let response = '';
    let type: 'text' | 'insight' | 'recommendation' = 'text';

    // Fetch fresh context data for more accurate responses
    let contextData = userContext;
    try {
      const apiResponse = await fetch('/api/chat/context');
      if (apiResponse.ok) {
        contextData = await apiResponse.json();
      }
    } catch (error) {
      console.error('Failed to fetch context:', error);
    }

    // Analyze user message and provide contextual responses
    if (message.includes('focus') || message.includes('concentration')) {
      type = 'recommendation';
      response = `Based on your ${contextData?.totalSessions || contextData?.flowSessions} flow sessions with an average score of ${contextData?.avgFlowScore}, I notice you perform best during ${contextData?.favoriteActivity} sessions. Here's what I recommend:

🎯 **Optimal Focus Strategy:**
• Schedule ${contextData?.avgSessionDuration}-minute focused blocks (your sweet spot)
• Use ${contextData?.recentSpotifyGenres?.[0] || 'instrumental'} music (your top genre)
• Take 10-15 minute breaks between sessions
• ${contextData?.personalInsights?.[0] || 'Focus during your peak energy hours'}

📊 **Your Focus Pattern:**
• Average session: ${contextData?.avgSessionDuration || 45} minutes
• Success rate: ${Math.round((contextData?.avgFlowScore || 50) * 0.85)}% in ${contextData?.favoriteActivity} sessions
• Weekly improvement: ${contextData?.trends?.improvementRate || '+5%'}
• Total focus time: ${Math.round((contextData?.totalFocusTime || 0) / 60)} hours`;
    }
    else if (message.includes('stress') || message.includes('anxiety')) {
      type = 'recommendation';
      response = `Your current stress level is ${contextData?.stressLevel}/10. Let's work on bringing that down:

🧘 **Immediate Stress Relief:**
• Try the 4-7-8 breathing technique (you've completed ${contextData?.activityBreakdown?.breathing || 0} breathing sessions)
• Listen to ${contextData?.recentSpotifyGenres?.[1] || 'ambient'} music (matches your preferences)
• Take a 5-10 minute walking break

📈 **Long-term Stress Management:**
• ${contextData?.mentalHealthTips?.[2] || 'Your stress correlates with sleep quality'}
• Consider meditation before challenging tasks
• Limit caffeine after 2 PM
• ${contextData?.mentalHealthTips?.[3] || 'Breathing exercises help reduce stress by 40%'}

💡 **Personalized for you:** Your stress drops significantly after successful flow sessions!`;
    }
    else if (message.includes('music') || message.includes('spotify')) {
      type = 'insight';
      response = `Great question! I've analyzed your Spotify data and flow sessions:

🎵 **Your Music & Productivity Insights:**
• ${contextData?.recentSpotifyGenres?.[0] || 'Lo-fi'} increases your focus significantly
• ${contextData?.recentSpotifyGenres?.[2] || 'Classical'} music helps with creative tasks
• ${contextData?.recentSpotifyGenres?.[1] || 'Ambient'} sounds reduce stress
• ${contextData?.personalInsights?.[1] || 'Music therapy aligns with your preferences'}

📊 **Recommendations based on your listening:**
• Morning: ${contextData?.recentSpotifyGenres?.[2] || 'Classical'} for creative work
• Afternoon: ${contextData?.recentSpotifyGenres?.[0] || 'Lo-fi'} for ${contextData?.favoriteActivity}
• Evening: ${contextData?.recentSpotifyGenres?.[1] || 'Ambient'} for wind-down
• Avoid lyrics during deep work (reduces performance by 15%)

🎯 **Your top genres:** ${contextData?.recentSpotifyGenres?.slice(0, 3).join(', ') || 'Lo-fi, Ambient, Classical'}`;
    }
    else if (message.includes('sleep') || message.includes('tired')) {
      type = 'recommendation';
      response = `Your sleep quality (${contextData?.sleepQuality}/10) directly affects your flow states:

😴 **Sleep Optimization for You:**
• Current sleep score impacts ${Math.round(((10 - (contextData?.sleepQuality || 7)) / 10) * 100)}% of your productivity
• ${contextData?.mentalHealthTips?.[4] || 'Better sleep improves flow states significantly'}
• Evening breathing exercises help (you've done ${contextData?.activityBreakdown?.breathing || 0} sessions)
• ${contextData?.recentSpotifyGenres?.[1] || 'Ambient'} music playlist helps you fall asleep

💡 **Sleep-Performance Connection:**
• 8+ hours sleep → 85% better flow scores
• Poor sleep → 40% more distractions during sessions
• Your sleep quality correlates with next-day performance
• ${contextData?.personalInsights?.[3] || 'Regular sleep schedule improves focus'}`;
    }
    else if (message.includes('mood') || message.includes('feeling')) {
      type = 'insight';
      response = `You're currently feeling ${contextData?.currentMood}. Here's what your data shows:

😊 **Mood Patterns:**
• Best mood during ${contextData?.favoriteActivity} sessions (your favorite)
• Music boosts mood significantly
• Flow states correlate with positive emotions
• You've completed ${contextData?.totalSessions || contextData?.flowSessions} sessions total!

🌟 **Mood Boosters for You:**
• 15-minute focused ${contextData?.favoriteActivity} session
• Play your favorite ${contextData?.recentSpotifyGenres?.[0] || 'lo-fi'} playlist
• Quick breathing exercise (${contextData?.activityBreakdown?.breathing || 0} completed so far)
• Review your progress (${contextData?.trends?.weeklySessionCount || 0} sessions this week)

📈 **Trend:** Your mood improves ${contextData?.trends?.improvementRate || '+12%'} with consistent sessions`;
    }
    else if (message.includes('improvement') || message.includes('better') || message.includes('progress')) {
      type = 'recommendation';
      response = `Based on your ${contextData?.totalSessions || contextData?.flowSessions} sessions and ${Math.round((contextData?.totalFocusTime || 0) / 60)} hours of focus data:

📈 **Your Progress:**
• Weekly sessions: ${contextData?.trends?.weeklySessionCount || 0}
• Average score: ${contextData?.avgFlowScore}/100 (${(contextData?.avgFlowScore || 0) >= 70 ? 'Above average!' : 'Room for improvement'})
• Improvement rate: ${contextData?.trends?.improvementRate || '+5%'}
• Favorite activity: ${contextData?.favoriteActivity} (${contextData?.activityBreakdown?.[contextData?.favoriteActivity as keyof typeof contextData.activityBreakdown] || 0} sessions)

🎯 **Top 3 Improvement Areas:**
1. **Consistency:** ${(contextData?.trends?.weeklySessionCount || 0) < 10 ? 'Aim for daily sessions' : 'Great consistency!'}
2. **Environment:** ${contextData?.personalInsights?.[0] || 'Optimize your workspace setup'}
3. **Recovery:** ${contextData?.mentalHealthTips?.[1] || 'Take proper breaks between sessions'}

✨ **Personalized Insights:**
${contextData?.personalInsights?.slice(0, 3).map(insight => `• ${insight}`).join('\n') || '• Keep building your flow practice!'}`;
    }
    else if (message.includes('whiteboard') || message.includes('creative')) {
      type = 'insight';
      const whiteboardData = contextData?.whiteboardInsights;
      response = whiteboardData ? `Your creative whiteboard sessions show great potential!

🎨 **Creativity Analytics:**
• Average creativity score: ${Math.round(whiteboardData.avgCreativityScore)}/100
• Total strokes across sessions: ${whiteboardData.totalStrokes}
• Colors used on average: ${Math.round(whiteboardData.avgColorsUsed)}
• Whiteboard sessions completed: ${contextData?.activityBreakdown?.whiteboard || 0}

💡 **Creative Insights:**
• Your creativity peaks during visual brainstorming
• Color variety indicates cognitive flexibility
• Stroke patterns show sustained engagement
• Best performance with ${contextData?.recentSpotifyGenres?.[2] || 'instrumental'} background music

🌟 **Tips to boost creativity:**
• Schedule creative sessions during your peak hours
• Use more varied colors (boosts innovation)
• Take breaks every 25 minutes for fresh perspective` :
      `I notice you haven't tried the whiteboard space yet! Creative visualization can:

🎨 **Benefits of Digital Whiteboarding:**
• Boost problem-solving by 40%
• Improve memory retention
• Enhance idea generation
• Provide measurable creativity metrics

💡 Try a whiteboard session to unlock creative insights!`;
    }
    else {
      response = `I understand you're asking about "${userMessage}". Based on your data:

📊 **Your Current Status:**
• Flow Sessions: ${contextData?.totalSessions || 0}
• Average Score: ${contextData?.avgFlowScore || 0}/100
• Total Focus Time: ${Math.round((contextData?.totalFocusTime || 0) / 60)} hours
• Weekly Sessions: ${contextData?.trends?.weeklySessionCount || 0}
• Favorite Activity: ${contextData?.favoriteActivity}

💡 **How I can help you:**
• Analyze your productivity patterns
• Suggest personalized breathing exercises
• Recommend music for focus (based on your ${contextData?.recentSpotifyGenres?.slice(0, 2).join(' & ') || 'preferences'})
• Track your mental health trends
• Provide stress management techniques
• Share insights from your ${contextData?.totalSessions || 0} flow sessions

${contextData?.personalInsights?.[4] || 'Feel free to ask me anything about your mental health, productivity, or how to optimize your flow states!'}`;
    }

    return {
      id: Date.now().toString(),
      content: response,
      sender: 'bot',
      timestamp: new Date(),
      type
    };
  };

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: inputValue,
        sender: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      const messageText = inputValue;
      setInputValue('');
      setIsTyping(true);

      // Simulate AI thinking time
      setTimeout(async () => {
        const botResponse = await generateBotResponse(messageText);
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
      }, 1500);
    }
  };

  const handleQuestionClick = (question: string) => {
    setInputValue(question);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white">
              <Brain className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Mental Health Assistant
            </h1>
          </div>
          <p className="text-gray-600">
            Personalized insights based on your flow sessions, music habits, and wellness data
          </p>
        </motion.div>

        {/* User Stats */}
        {userContext && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          >
            <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-600">Flow Score</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{userContext.avgFlowScore}</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-600">Sessions</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{userContext.totalSessions || userContext.flowSessions}</div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <Music className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-600">Top Genre</span>
              </div>
              <div className="text-lg font-bold text-green-600">{userContext.recentSpotifyGenres[0]}</div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-pink-100">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-pink-500" />
                <span className="text-sm font-medium text-gray-600">Mood</span>
              </div>
              <div className="text-lg font-bold text-pink-600 capitalize">{userContext.currentMood}</div>
            </div>
          </motion.div>
        )}

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : message.type === 'insight'
                        ? 'bg-purple-500 text-white'
                        : message.type === 'recommendation'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}>
                      {message.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    {/* Message Bubble */}
                    <div className={`rounded-2xl p-4 ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : message.type === 'insight'
                        ? 'bg-purple-50 border border-purple-200'
                        : message.type === 'recommendation'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}>
                      {message.type && message.sender === 'bot' && (
                        <div className={`flex items-center gap-2 mb-2 text-sm font-medium ${
                          message.type === 'insight' ? 'text-purple-600' :
                          message.type === 'recommendation' ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {message.type === 'insight' ? <Zap className="w-4 h-4" /> :
                           message.type === 'recommendation' ? <Heart className="w-4 h-4" /> : null}
                          {message.type === 'insight' ? 'Insight' :
                           message.type === 'recommendation' ? 'Recommendation' : 'Response'}
                        </div>
                      )}
                      
                      <div className={`whitespace-pre-wrap ${
                        message.sender === 'user' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {message.content}
                      </div>

                      <div className={`text-xs mt-2 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-500 text-white flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="border-t border-gray-100 p-4 bg-gray-50">
            <div className="mb-3">
              <span className="text-sm font-medium text-gray-700">Quick Questions:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {predefinedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuestionClick(question)}
                  className="text-sm bg-white border border-gray-300 rounded-full px-4 py-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors duration-200 text-gray-700 font-medium shadow-sm"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me about your mental health, productivity, or flow states..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatSpace;