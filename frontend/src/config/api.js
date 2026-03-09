// API Configuration for production deployment
const getApiUrl = () => {
  // In production, use environment variable or fallback to Render backend URL
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://app-email-sender.onrender.com';
  }
  // Development
  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiUrl();

export default {
  baseURL: API_BASE_URL,
  timeout: 10000,
};
