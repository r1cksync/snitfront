'use client';

import { useState, useEffect, useRef } from 'react';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Minimize2, Maximize2, X, GripVertical } from 'lucide-react';
import { spotifyAPI } from '@/lib/api';

interface MiniPlayerProps {
  currentTrack: any;
  isPlaying: boolean;
  onClose: () => void;
}

export default function MiniPlayer({ currentTrack, isPlaying: initialIsPlaying, onClose }: MiniPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(initialIsPlaying);
  const [isMinimized, setIsMinimized] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [playbackState, setPlaybackState] = useState<any>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(fetchPlaybackState, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      };

      const handleMouseUp = () => {
        setIsDragging(false);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const fetchPlaybackState = async () => {
    try {
      const response = await spotifyAPI.getPlaybackState();
      setPlaybackState(response.data);
      if (response.data?.is_playing !== undefined) {
        setIsPlaying(response.data.is_playing);
      }
    } catch (error) {
      console.error('Error fetching playback state:', error);
    }
  };

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        await spotifyAPI.pausePlayback();
      } else {
        await spotifyAPI.playTrack([currentTrack?.uri]);
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const handleNext = async () => {
    try {
      await spotifyAPI.nextTrack();
      setTimeout(fetchPlaybackState, 500);
    } catch (error) {
      console.error('Error skipping track:', error);
    }
  };

  const handlePrevious = async () => {
    try {
      await spotifyAPI.previousTrack();
      setTimeout(fetchPlaybackState, 500);
    } catch (error) {
      console.error('Error going to previous track:', error);
    }
  };

  const handleVolumeChange = async (newVolume: number) => {
    setVolume(newVolume);
    try {
      await spotifyAPI.setVolume(newVolume);
    } catch (error) {
      console.error('Error changing volume:', error);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      handleVolumeChange(volume);
    } else {
      handleVolumeChange(0);
    }
    setIsMuted(!isMuted);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (playerRef.current) {
      const rect = playerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  const track = playbackState?.item || currentTrack;

  // Minimized view
  if (isMinimized) {
    return (
      <div
        ref={playerRef}
        style={{
          position: 'fixed',
          bottom: `${position.y}px`,
          right: `${position.x}px`,
          zIndex: 9999,
        }}
        className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-full shadow-2xl cursor-move"
        onMouseDown={handleMouseDown}
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="w-16 h-16 flex items-center justify-center text-white hover:scale-110 transition-transform"
        >
          <Music className="w-8 h-8" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={playerRef}
      style={{
        position: 'fixed',
        bottom: `${position.y}px`,
        right: `${position.x}px`,
        zIndex: 9999,
      }}
      className="w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Drag Handle */}
      <div
        className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 flex items-center justify-between cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-white" />
          <Music className="w-5 h-5 text-white" />
          <span className="text-white font-medium text-sm">Now Playing</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <Minimize2 className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Track Info */}
      <div className="p-4">
        <div className="flex gap-3 mb-4">
          {track?.album?.images?.[1] && (
            <img
              src={track.album.images[1].url}
              alt={track.name}
              className="w-16 h-16 rounded-lg shadow-md"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {track?.name || 'No track playing'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {track?.artists?.map((a: any) => a.name).join(', ') || 'Unknown artist'}
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={handlePrevious}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <SkipBack className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={handlePlayPause}
            className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full transition-all transform hover:scale-110 shadow-lg"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white fill-white" />
            ) : (
              <Play className="w-6 h-6 text-white fill-white" />
            )}
          </button>
          <button
            onClick={handleNext}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <SkipForward className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3">
          <button onClick={toggleMute} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
            className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, rgb(147, 51, 234) 0%, rgb(147, 51, 234) ${volume}%, rgb(229, 231, 235) ${volume}%, rgb(229, 231, 235) 100%)`,
            }}
          />
          <span className="text-xs text-gray-600 dark:text-gray-400 w-8 text-right">
            {Math.round(isMuted ? 0 : volume)}%
          </span>
        </div>
      </div>
    </div>
  );
}
