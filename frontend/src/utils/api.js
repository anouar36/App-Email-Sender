import axios from 'axios';

// API Configuration for production deployment
const getApiUrl = () => {
  // In production, use environment variable or fallback to your actual Render backend URL
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://app-email-sender.onrender.com';
  }
  // Development
  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiUrl();

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;