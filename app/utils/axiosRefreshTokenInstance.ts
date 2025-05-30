import axios from 'axios';
import { refreshToken } from './tokenRefresh';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5178';

const instance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

instance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        await refreshToken();
        return instance(originalRequest);
      } catch (_err) {
        window.location.href = '/login?expired=1';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default instance;