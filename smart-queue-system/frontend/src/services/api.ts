import axios from 'axios';
import { getAuthTokens, setAuthTokens, removeAuthTokens, isTokenExpired } from '../utils/auth';

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const { accessToken } = getAuthTokens();
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const { refreshToken } = getAuthTokens();

    if (error.response.status === 401 && refreshToken && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isTokenExpired(refreshToken)) {
        removeAuthTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/users/token/refresh/`, {
          refresh: refreshToken,
        });
        const { access, refresh } = response.data;
        setAuthTokens(access, refresh);
        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        removeAuthTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
