import axios, { AxiosError, AxiosResponse } from "axios";
import {
  Lesson,
  LessonProgress,
  LessonRecommendation,
  Module,
  ModuleProgress,
  RecentActivity,
  StepCompletionData,
  StepVerificationResult,
  UserLearningStats,
} from "../types";

// 1. Odczytaj bazowy URL API (który już zawiera /api)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Sprawdzenie, czy zmienna środowiskowa jest ustawiona
if (!API_BASE_URL && typeof window !== "undefined") {
  console.error(
    "FATAL ERROR: NEXT_PUBLIC_API_URL environment variable is not set! Should be like https://...herokuapp.com/api"
  );
} else if (
  API_BASE_URL &&
  !API_BASE_URL.endsWith("/api") &&
  typeof window !== "undefined"
) {
  console.warn(
    `Warning: NEXT_PUBLIC_API_URL (${API_BASE_URL}) does not end with /api. Paths in apiService might be incorrect.`
  );
}

// 2. Utwórz instancję axios z poprawną konfiguracją
const api = axios.create({
  baseURL: API_BASE_URL, // Ustawia pełny URL backendu (np. https://.../api)
  withCredentials: true, // KLUCZOWE: Nakazuje axios wysyłać HttpOnly cookies
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json; charset=utf-8",
  },
});

// 3. UPROSZCZONY INTERCEPTOR ŻĄDAŃ (bez ręcznego dodawania tokenu)
api.interceptors.request.use(
  (config) => {
    // Logowanie żądania (opcjonalne)
    if (process.env.NODE_ENV === "development") {
      // Pełny URL jest tworzony przez axios z baseURL + config.url
      console.log(
        `🚀 Request: ${config.method?.toUpperCase()} ${config.baseURL}${
          config.url
        } with credentials`
      );
    }
    // NIE ustawiamy nagłówka Authorization - przeglądarka zrobi to z cookie
    return config;
  },
  (error) => {
    console.error("❌ Request Setup Error:", error);
    return Promise.reject(error);
  }
);

// 4. INTERCEPTOR ODPOWIEDZI (bez zmian, ale z lepszym logowaniem)
api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // Loguj status, URL (z config), i dane błędu
      console.error(
        `❌ Response Error: ${
          error.response.status
        } for ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        error.response.data
      );
      if (error.response.status === 401) {
        console.warn(
          "Received 401 Unauthorized. Check if cookie was sent (Network tab -> Request Headers -> Cookie) and is valid. Backend CORS/Cookie settings might be wrong."
        );
        // Rozważ globalną obsługę 401, np. wylogowanie lub przekierowanie
      } else if (error.response.status === 404) {
        console.error(
          "Received 404 Not Found. Verify the API path casing and existence on the backend."
        );
      }
    } else if (error.request) {
      console.error(
        `❌ No response received for ${error.config?.url}:`,
        error.request
      );
    } else {
      console.error("❌ Axios Request Configuration Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// 5. POPRAWIONE ŚCIEŻKI W EKSPORTOWANYM OBIEKCIE
// Ścieżki są teraz zgodne z backendem
export const apiService = {
  // Podstawowe metody - przekazują ścieżkę względną do instancji axios
  async get<T>(relativePath: string, params?: any): Promise<T> {
    // axios połączy baseURL + relativePath
    const response = await api.get<T>(relativePath, { params });
    return response.data;
  },
  async post<T>(relativePath: string, data?: any): Promise<T> {
    const response = await api.post<T>(relativePath, data);
    return response.data;
  },
  async put<T>(relativePath: string, data?: any): Promise<T> {
    const response = await api.put<T>(relativePath, data);
    return response.data;
  },
  async delete<T>(relativePath: string): Promise<T> {
    const response = await api.delete<T>(relativePath);
    return response.data;
  },

  // Metody specyficzne - używają ścieżek względnych do /api
  lessons: {
    getAllModules: () => apiService.get<Module[]>("Lessons/modules"),

    getModule: (moduleId: string) =>
      apiService.get<Module>(`Lessons/modules/${moduleId}`),

    getLesson: (lessonId: string) =>
      apiService.get<Lesson>(`Lessons/${lessonId}`),

    getLessonProgress: (lessonId: string) =>
      apiService.get<LessonProgress>(`Lessons/${lessonId}/progress`),

    getModuleProgress: (moduleId: string) =>
      apiService.get<ModuleProgress>(`Lessons/modules/${moduleId}/progress`),

    getLessonSteps: (lessonId: string) =>
      apiService.get(`Lessons/${lessonId}/steps`),

    completeStep: (
      lessonId: string,
      stepIndex: number,
      completionData: StepCompletionData
    ) =>
      apiService.post<boolean>(
        `Lessons/${lessonId}/step/${stepIndex}/complete`,
        completionData
      ),

    verifyStepAnswer: (lessonId: string, stepIndex: number, answer: any) =>
      apiService.post<StepVerificationResult>(
        `Lessons/${lessonId}/step/${stepIndex}/verify`,
        { answer }
      ),

    completeLesson: (lessonId: string) =>
      apiService.post<{ success: boolean; xpAwarded: number; message: string }>(
        `Lessons/${lessonId}/complete`
      ),

    getUserLearningStats: () =>
      apiService.get<UserLearningStats>(`Lessons/user/stats`),

    getModuleCompletionRates: () =>
      apiService.get<Record<string, number>>(`Lessons/user/completion-rates`),

    getRecentActivities: (count: number = 10) =>
      apiService.get<RecentActivity[]>(`Lessons/user/recent-activities`, {
        count,
      }),

    getPersonalizedRecommendations: () =>
      apiService.get<LessonRecommendation[]>(`Lessons/user/recommendations`),
  },

  user: {
    getStats: () => apiService.get<UserLearningStats>("User/stats"),
    getProgress: () => apiService.get("User/progress"),
    getStreak: () => apiService.get("UserActivity/streak"),
    getActivityHistory: () => apiService.get("UserActivity/history"),
    getRanking: (category: string, page: number, limit: number) =>
      apiService.get(`User/ranking/${category}`, { page, limit }),
  },

  auth: {
    login: (data: any) => apiService.post<any>("Auth/login", data),
    register: (data: any) => apiService.post<any>("Auth/register", data),
    logout: () => apiService.post<void>("Auth/logout"),
    checkStatus: () => apiService.get<any>("Auth/user"),
  },

  notifications: {
    getAll: () => apiService.get<Notification[]>("Notification"),
    markAsRead: (notificationId: string) =>
      apiService.post<void>(`Notification/${notificationId}/mark-as-read`),
  },
};
