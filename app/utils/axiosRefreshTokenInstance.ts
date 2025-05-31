import axios from "axios";
import { refreshToken } from "./tokenRefresh";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5178/api/";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Ważne dla HttpOnly cookies
});

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token; // Jeśli backend oczekuje nagłówka
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await refreshToken(); // Funkcja odświeżająca token
        // Backend powinien ustawić nowe ciasteczko HttpOnly z tokenem
        // Jeśli token jest zwracany w odpowiedzi, można go tu obsłużyć (np. zapisać w AuthContext)
        // Dla HttpOnly, backend sam zarządza ciasteczkiem.
        // Jeśli backend zwraca token w odpowiedzi i oczekuje go w nagłówku:
        // axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
        // originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        processQueue(null, newAccessToken);
        return axiosInstance(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        // Tutaj obsługa błędu odświeżania tokenu, np. wylogowanie użytkownika
        // Można wywołać funkcję logout z AuthContext lub przekierować na /login
        console.error("Token refresh failed:", refreshError);
        if (typeof window !== "undefined") {
          // Powiadom AuthContext o potrzebie wylogowania
          window.dispatchEvent(new Event("forceLogout"));
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
