import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

console.log('API_URL configured as:', API_URL); // Debug log

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add auth token to requests if available
apiClient.interceptors.request.use((config) => {
  console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
  return config;
});

// Add response interceptor for better error logging
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; name: string }) =>
    apiClient.post('/api/auth/register', data),
  
  // Profile routes go through frontend proxy to use NextAuth session
  getUserProfile: () =>
    axios.get('/api/auth/profile'),
  
  updateUserProfile: (data: any) =>
    axios.patch('/api/auth/profile', data),
};

// Sessions API
export const sessionsAPI = {
  getAll: (params?: { limit?: number; skip?: number }) =>
    apiClient.get('/api/sessions', { params }),
  
  getById: (id: string) =>
    apiClient.get(`/api/sessions/${id}`),
  
  create: (data: any) =>
    apiClient.post('/api/sessions', data),
  
  update: (id: string, data: any) =>
    apiClient.patch(`/api/sessions/${id}`, data),
  
  delete: (id: string) =>
    apiClient.delete(`/api/sessions/${id}`),
};

// Analytics API
export const analyticsAPI = {
  get: (period: 'week' | 'month' | 'year' | 'all' = 'week') =>
    apiClient.get('/api/analytics', { params: { period } }),
};

// Interventions API
export const interventionsAPI = {
  getAll: (params?: { limit?: number; sessionId?: string }) =>
    apiClient.get('/api/interventions', { params }),
  
  create: (data: any) =>
    apiClient.post('/api/interventions', data),
  
  update: (data: { id: string; completed?: boolean; effectiveness?: number }) =>
    apiClient.patch('/api/interventions', data),
};

// Settings API
export const settingsAPI = {
  get: () =>
    apiClient.get('/api/settings'),
  
  update: (data: any) =>
    apiClient.patch('/api/settings', data),
};

// Media API
export const mediaAPI = {
  getUploadUrl: (params: { filename: string; contentType: string; type?: string }) =>
    apiClient.get('/api/media/upload', { params }),
  
  saveMetadata: (data: any) =>
    apiClient.post('/api/media/upload', data),
};

// AI Chat API
export const aiAPI = {
  chat: (data: { messages: any[]; type?: string; sessionData?: any; context?: string }) =>
    apiClient.post('/api/ai/chat', data),
};

// ML API
export const mlAPI = {
  sentiment: (text: string) =>
    apiClient.post('/api/ml', { operation: 'sentiment', data: { text } }),
  
  classify: (text: string) =>
    apiClient.post('/api/ml', { operation: 'classify', data: { text } }),
  
  predictFatigue: (metrics: any) =>
    apiClient.post('/api/ml', { operation: 'predict-fatigue', data: { metrics } }),
};

// Code Execution API
export const executeAPI = {
  run: (language: string, code: string, stdin?: string) =>
    apiClient.post('/api/execute', { language, code, stdin }),
};

// Spotify API
export const spotifyAPI = {
  getAuthUrl: () =>
    apiClient.get('/api/spotify/auth'),
  
  getTopTracks: (params?: { time_range?: string; limit?: number }) =>
    apiClient.get('/api/spotify/top-tracks', { params }),
  
  getInsights: (data: { topTracks: any; recentTracks?: any; userProfile?: any }) =>
    apiClient.post('/api/spotify/insights', data),
  
  getRecommendations: (params: { mood?: string; activity?: string; energyLevel?: number; focus?: string }) =>
    apiClient.post('/api/spotify/recommendations', params),
  
  playTrack: (trackUris: string[], deviceId?: string) =>
    apiClient.post('/api/spotify/playback', { action: 'play', trackUris, deviceId }),
  
  pausePlayback: () =>
    apiClient.post('/api/spotify/playback', { action: 'pause' }),
  
  nextTrack: () =>
    apiClient.post('/api/spotify/playback', { action: 'next' }),
  
  previousTrack: () =>
    apiClient.post('/api/spotify/playback', { action: 'previous' }),
  
  seekTo: (position: number) =>
    apiClient.post('/api/spotify/playback', { action: 'seek', position }),
  
  setVolume: (volume: number) =>
    apiClient.post('/api/spotify/playback', { action: 'volume', position: volume }),
  
  getPlaybackState: () =>
    apiClient.get('/api/spotify/playback'),
  
  search: (query: string, type: string = 'track', limit: number = 10) =>
    apiClient.get('/api/spotify/search', { params: { q: query, type, limit } }),
};
