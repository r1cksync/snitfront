'use client';

import { useState, useEffect } from 'react';
import { Music, TrendingUp, Sparkles, Play, Send, Loader2, Plus, MessageSquare } from 'lucide-react';
import { spotifyAPI } from '@/lib/api';
import MiniPlayer from '@/components/MiniPlayer';

const FOCUS_MODES = [
  { id: 'deep-work', label: 'Deep Work', emoji: '🧠', description: 'Ambient & instrumental for maximum focus' },
  { id: 'creative', label: 'Creative Flow', emoji: '🎨', description: 'Indie & jazz for creative thinking' },
  { id: 'energetic', label: 'High Energy', emoji: '⚡', description: 'Upbeat music for active work' },
  { id: 'relaxation', label: 'Relaxation', emoji: '🧘', description: 'Calm music for breaks' },
];

export default function MusicSpace() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [insights, setInsights] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedMode, setSelectedMode] = useState('deep-work');
  const [explanation, setExplanation] = useState('');
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [playlistLength, setPlaylistLength] = useState(12);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    checkSpotifyConnection();
  }, []);

  const checkSpotifyConnection = async () => {
    try {
      setLoading(true);
      const response = await spotifyAPI.getTopTracks({ limit: 10 });
      setIsConnected(true);
      setTopTracks(response.data.items || []);
      await generateInsights(response.data);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.data?.error?.includes('not connected')) {
        setIsConnected(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const connectSpotify = async () => {
    try {
      const response = await spotifyAPI.getAuthUrl();
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error('Error connecting Spotify:', error);
    }
  };

  const generateInsights = async (topTracksData: any) => {
    try {
      const response = await spotifyAPI.getInsights({
        topTracks: topTracksData,
        userProfile: {},
      });
      setInsights(response.data.insights);
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  };

  const getRecommendations = async (focus: string) => {
    try {
      setSelectedMode(focus);
      setLoading(true);
      setIsChatOpen(true);
      setChatHistory([]);
      
      const params: any = { focus, playlistLength };
      if (customPrompt.trim()) {
        params.userMessage = customPrompt;
      }
      
      const response = await spotifyAPI.getRecommendations(params);
      const tracks = response.data.tracks || [];
      setRecommendations(tracks);
      setExplanation(response.data.explanation || '');
      
      console.log(`✅ Received ${tracks.length} tracks from API (requested: ${playlistLength})`);
      console.log('Track IDs:', tracks.map((t: any) => t.id));
      
      // Add AI explanation to chat
      setChatHistory([{
        role: 'assistant',
        content: response.data.explanation,
      }]);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      showNotification('Failed to get recommendations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const refineRecommendations = async () => {
    if (!chatMessage.trim()) return;

    try {
      setIsRefining(true);
      const userMsg = chatMessage;
      setChatMessage('');
      
      // Add user message to chat
      const newHistory = [...chatHistory, { role: 'user', content: userMsg }];
      setChatHistory(newHistory);

      const response = await spotifyAPI.chatRefine({
        userMessage: userMsg,
        currentPlaylist: recommendations,
        conversationHistory: newHistory,
        playlistLength,
      });

      setRecommendations(response.data.tracks || []);
      setExplanation(response.data.explanation || '');
      
      // Add AI response to chat
      setChatHistory([...newHistory, {
        role: 'assistant',
        content: response.data.explanation,
      }]);
    } catch (error) {
      console.error('Error refining recommendations:', error);
      showNotification('Failed to refine recommendations', 'error');
    } finally {
      setIsRefining(false);
    }
  };

  const createPlaylist = async () => {
    try {
      const trackUris = recommendations.map(track => track.uri);
      const focusMode = FOCUS_MODES.find(m => m.id === selectedMode);
      const playlistName = `AI ${focusMode?.label || 'Recommendations'} - ${new Date().toLocaleDateString()}`;
      
      const response = await spotifyAPI.createPlaylist({
        name: playlistName,
        description: explanation,
        trackUris,
      });

      showNotification(`Playlist "${playlistName}" created successfully!`, 'success');
    } catch (error: any) {
      console.error('Error creating playlist:', error);
      
      // Check if it's a permission error
      if (error.response?.status === 403 || error.response?.data?.needsReconnect) {
        showNotification('Please reconnect Spotify to grant playlist permissions', 'error');
        // Optionally redirect to reconnect
        setTimeout(async () => {
          try {
            const authResponse = await spotifyAPI.getAuthUrl();
            if (confirm('Reconnect Spotify to enable playlist creation?')) {
              window.location.href = authResponse.data.authUrl;
            }
          } catch (err) {
            console.error('Failed to get auth URL:', err);
          }
        }, 2000);
      } else {
        showNotification('Failed to create playlist', 'error');
      }
    }
  };

  const playTrack = async (trackUri: string, track: any) => {
    try {
      await spotifyAPI.playTrack([trackUri]);
      setCurrentTrack(track);
      setIsPlaying(true);
      setShowMiniPlayer(true);
      showNotification(`Now playing: ${track.name}`, 'success');
    } catch (error: any) {
      console.error('Error playing track:', error);
      const message = error.response?.data?.error?.includes('Premium') 
        ? 'Spotify Premium required for playback control' 
        : 'Failed to play track. Make sure Spotify is open on a device.';
      showNotification(message, 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), type === 'success' ? 3000 : 5000);
  };

  if (loading && !isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Music className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Connect Your Spotify
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Get AI-powered music recommendations tailored to your focus needs. 
              Control playback directly from our interface and enhance your productivity with the perfect soundtrack.
            </p>
            <button
              onClick={connectSpotify}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-full transition-all transform hover:scale-105 shadow-lg"
            >
              Connect Spotify Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                🎵 Your Music Intelligence
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                AI-powered insights and recommendations for optimal focus
              </p>
            </div>
            <button
              onClick={connectSpotify}
              className="px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              title="Reconnect to update permissions"
            >
              🔄 Reconnect Spotify
            </button>
          </div>
        </div>

        {/* Top Tracks & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Tracks */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Top Tracks</h2>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {topTracks.map((track, index) => (
                <div
                  key={track.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group cursor-pointer"
                  onClick={() => playTrack(track.uri, track)}
                >
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                    {index + 1}
                  </span>
                  {track.album?.images?.[2] && (
                    <img
                      src={track.album.images[2].url}
                      alt={track.name}
                      className="w-12 h-12 rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {track.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {track.artists.map((a: any) => a.name).join(', ')}
                    </p>
                  </div>
                  <Play className="w-5 h-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Insights</h2>
            </div>
            <div className="prose prose-sm dark:prose-invert max-h-96 overflow-y-auto">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {insights || 'Analyzing your listening patterns...'}
              </p>
            </div>
          </div>
        </div>

        {/* Focus Mode Selection */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Choose Your Focus Mode
            </h2>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Songs:
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={playlistLength}
                onChange={(e) => setPlaylistLength(Number(e.target.value) || 12)}
                className="w-20 px-3 py-2 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center"
              />
              <button
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
              >
                {showCustomInput ? '✕ Close' : '+ Custom Prompt'}
              </button>
            </div>
          </div>
          
          {/* Custom Prompt Input */}
          {showCustomInput && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom Instructions (optional)
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="E.g., 'Include more female artists', 'Focus on 90s music', 'Mix of upbeat and calm tracks'..."
                className="w-full px-4 py-3 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                rows={3}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                💡 These instructions will be combined with your selected focus mode
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FOCUS_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => getRecommendations(mode.id)}
                disabled={loading}
                className={
                  'p-4 rounded-xl border-2 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ' +
                  (selectedMode === mode.id
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300')
                }
              >
                <div className="text-3xl mb-2">{mode.emoji}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {mode.label}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {mode.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Recommendations with Chat Interface */}
        {recommendations.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Recommendations Header */}
            <div className="p-6 border-b dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  AI-Generated Playlist
                </h2>
                <button
                  onClick={createPlaylist}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Save to Spotify
                </button>
              </div>
              {explanation && (
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  {explanation}
                </p>
              )}
            </div>

            {/* Tracks Grid */}
            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Showing {recommendations.length} {recommendations.length === 1 ? 'track' : 'tracks'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 mb-6">
                {recommendations.map((track, index) => (
                  <div
                    key={`${track.id}-${index}`}
                    className="group cursor-pointer"
                    onClick={() => playTrack(track.uri, track)}
                  >
                    <div className="relative mb-2 rounded-lg overflow-hidden shadow-md">
                      {track.album?.images?.[1] && (
                        <img
                          src={track.album.images[1].url}
                          alt={track.name}
                          className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                        <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {index + 1}
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {track.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {track.artists.map((a: any) => a.name).join(', ')}
                    </p>
                  </div>
                ))}
              </div>

              {/* Chat Interface */}
              {isChatOpen && (
                <div className="border-t dark:border-gray-700 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Refine Your Playlist
                    </h3>
                  </div>

                  {/* Chat History */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto space-y-3">
                    {chatHistory.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            msg.role === 'user'
                              ? 'bg-purple-600 text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border dark:border-gray-700'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {isRefining && (
                      <div className="flex justify-start">
                        <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 border dark:border-gray-700">
                          <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && refineRecommendations()}
                      placeholder="Ask for modifications... (e.g., 'Make it more upbeat' or 'Add some classic rock')"
                      className="flex-1 px-4 py-3 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      disabled={isRefining}
                    />
                    <button
                      onClick={refineRecommendations}
                      disabled={isRefining || !chatMessage.trim()}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      {isRefining ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    💡 Try: "Add more female artists", "Make it slower", "Include some 90s hits", "More instrumental tracks"
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mini Player - Always visible after first play */}
      {showMiniPlayer && (
        <MiniPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onClose={() => setShowMiniPlayer(false)}
        />
      )}
    </div>
  );
}
