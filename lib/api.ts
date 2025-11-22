import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add auth token to requests if available
apiClient.interceptors.request.use((config) => {
  // NextAuth handles session cookies automatically
  return config;
});

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; name: string }) =>
    apiClient.post('/api/auth/register', data),
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
