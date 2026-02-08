import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // Add token to requests
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`[API] Success ${response.status}`, response.data);
    return response;
  },
  (error) => {
    console.error('[API] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);
