import axios, { AxiosError, AxiosResponse } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5178/api";

// Funkcja pomocnicza do pobierania tokenu
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json; charset=utf-8",
  },
  withCredentials: true, // Włącz credentials dla CORS i cookies
});

// Interceptor dodający token autoryzacji do nagłówków
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request (w trybie development)
    if (process.env.NODE_ENV === "development") {
      console.log(`🚀 Request: ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Interceptor do obsługi odpowiedzi
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response (w trybie development)
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ Response: ${response.status} ${response.config.url}`);
    }

    return response;
  },
  (error: AxiosError) => {
    // Szczegółowe logowanie błędów
    if (error.response) {
      console.error(
        "❌ Response Error:",
        error.response.status,
        error.response.data
      );

      // Obsługa błędów autoryzacji (401)
      if (error.response.status === 401) {
        // Opcjonalnie: wyloguj lub przekieruj do logowania
        localStorage.removeItem("auth_token");
      }
    } else if (error.request) {
      // Żądanie zostało wysłane, ale nie otrzymano odpowiedzi
      console.error("❌ No response received:", error.request);
    } else {
      // Coś poszło nie tak podczas tworzenia żądania
      console.error("❌ Request configuration error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Pomocnicze funkcje API do wykorzystania w aplikacji
export const apiService = {
  // Podstawowe metody HTTP
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await api.get<T>(url, { params });
    return response.data;
  },

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await api.post<T>(url, data);
    return response.data;
  },

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await api.put<T>(url, data);
    return response.data;
  },

  async delete<T>(url: string): Promise<T> {
    const response = await api.delete<T>(url);
    return response.data;
  },

  // Metody dla modułu lekcji
  lessons: {
    getAllModules: () => apiService.get("/lessons/modules"),
    getModule: (moduleId: string) =>
      apiService.get(`/lessons/modules/${moduleId}`),
    getLesson: (lessonId: string) => apiService.get(`/lessons/${lessonId}`),
    getLessonProgress: (lessonId: string) =>
      apiService.get(`/lessons/${lessonId}/progress`),
    getModuleProgress: (moduleId: string) =>
      apiService.get(`/lessons/modules/${moduleId}/progress`),
    // DODAJ TĘ METODĘ
    getLessonSteps: (lessonId: string) =>
      apiService.get(`/lessons/${lessonId}/steps`),
    completeStep: (lessonId: string, stepIndex: number) =>
      apiService.post(`/lessons/${lessonId}/step/${stepIndex}/complete`),
    completeLesson: (lessonId: string) =>
      apiService.post(`/lessons/${lessonId}/complete`),
  },

  // Metody dla użytkownika
  user: {
    getStats: () => apiService.get("/user/stats"),
    getProgress: () => apiService.get("/user/progress"),
    getStreak: () => apiService.get("/userActivity/streak"),
    getActivityHistory: () => apiService.get("/userActivity/history"),
  },
};

export default api;
