import axios from 'axios';

const instance = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach JWT
instance.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('barber_user') || sessionStorage.getItem('barber_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('barber_user');
      sessionStorage.removeItem('barber_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;
