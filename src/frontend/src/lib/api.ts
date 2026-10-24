import axios from 'axios';

// Point to our .NET API (update port if your local .NET runs on a different port)
const api = axios.create({
  baseURL: 'https://localhost:7100', // IMPORTANT: Verify this matches your .NET API port!
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach the JWT token if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('flowforge_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;