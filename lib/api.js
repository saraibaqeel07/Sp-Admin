import axios from 'axios';

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://six-point-server-f8e839a224b2.herokuapp.com/api' });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('memberToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      document.cookie = 'adminToken=; path=/; max-age=0';
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;
