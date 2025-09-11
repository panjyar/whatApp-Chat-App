import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await api.post('/auth/refresh');
        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
};

export const userAPI = {
  getMe: () => api.get('/users/me'),
  getUserById: (id) => api.get(`/users/${id}`),
};

export const contactAPI = {
  getContacts: () => api.get('/contacts'),
  addContact: (contactEmail) => api.post('/contacts', { contact_email: contactEmail }),
  removeContact: (id) => api.delete(`/contacts/${id}`),
};

export const threadAPI = {
  getThreads: () => api.get('/threads'),
  createThread: (participantId) => api.post('/threads', { participantId }),
  getMessages: (threadId, limit = 50, before = null) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (before) params.append('before', before);
    return api.get(`/threads/${threadId}/messages?${params}`);
  },
  sendMessage: (threadId, content) => api.post(`/threads/${threadId}/messages`, { content }),
  markMessageAsRead: (threadId, messageId) => api.put(`/threads/${threadId}/messages/${messageId}/read`),
  askAI: (threadId, prompt) => api.post(`/threads/${threadId}/ai`, { prompt }),
};

export const searchAPI = {
  search: (query, type = 'threads') => api.get(`/search?q=${encodeURIComponent(query)}&type=${type}`),
};
