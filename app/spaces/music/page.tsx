'use client';

import { useState, useEffect } from 'react';
import { Music, TrendingUp, Sparkles, Play, Pause, SkipForward, SkipBack, Volume2, Search, Loader2 } from 'lucide-react';
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
      const response = await spotifyAPI.getRecommendations({ focus });
      setRecommendations(response.data.tracks || []);
      setExplanation(response.data.explanation || '');
    } catch (error) {
      console.error('Error getting recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const playTrack = async (trackUri: string, track: any) => {
    try {
      await spotifyAPI.playTrack([trackUri]);
      setCurrentTrack(track);
      setIsPlaying(true);
      setShowMiniPlayer(true);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
      notification.textContent = `Now playing: ${track.name}`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } catch (error: any) {
      console.error('Error playing track:', error);
      
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.textContent = error.response?.data?.error?.includes('Premium') 
        ? 'Spotify Premium required for playback control' 
        : 'Failed to play track. Make sure Spotify is open on a device.';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 5000);
    }
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
              Get AI-powered music insights and recommendations tailored to your focus needs. 
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🎵 Your Music Intelligence
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered insights and recommendations for optimal focus
          </p>
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Focus Mode
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FOCUS_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => getRecommendations(mode.id)}
                className={
                  'p-4 rounded-xl border-2 transition-all transform hover:scale-105 ' +
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

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Recommended for You
              </h2>
              {explanation && (
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  {explanation}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recommendations.map((track) => (
                <div
                  key={track.id}
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
