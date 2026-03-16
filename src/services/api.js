import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Inyectar token JWT en cada request
api.interceptors.request.use((config) => {
  const auth = localStorage.getItem('indusvit_auth');
  if (auth) {
    try {
      const { token } = JSON.parse(auth);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {}
  }
  return config;
});

export default api;
