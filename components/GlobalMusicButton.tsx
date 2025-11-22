'use client';

import { useState, useEffect } from 'react';
import { Music } from 'lucide-react';
import MiniPlayer from './MiniPlayer';
import { spotifyAPI } from '@/lib/api';

export default function GlobalMusicButton() {
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasSpotify, setHasSpotify] = useState(false);

  useEffect(() => {
    checkSpotifyConnection();
    const interval = setInterval(checkPlaybackState, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkSpotifyConnection = async () => {
    try {
      await spotifyAPI.getTopTracks({ limit: 1 });
      setHasSpotify(true);
    } catch (error) {
      setHasSpotify(false);
    }
  };

  const checkPlaybackState = async () => {
    if (!hasSpotify) return;
    
    try {
      const response = await spotifyAPI.getPlaybackState();
      if (response.data?.item) {
        setCurrentTrack(response.data.item);
        setIsPlaying(response.data.is_playing);
      }
    } catch (error) {
      // Silent fail
    }
  };

  if (!hasSpotify) {
    return null;
  }

  return (
    <>
      {/* Floating Music Button */}
      <button
        onClick={() => setShowPlayer(!showPlayer)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110"
        style={{ zIndex: 9998 }}
      >
        <Music className={isPlaying ? 'w-6 h-6 animate-pulse' : 'w-6 h-6'} />
      </button>

      {/* Mini Player */}
      {showPlayer && currentTrack && (
        <MiniPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onClose={() => setShowPlayer(false)}
        />
      )}
    </>
  );
}
