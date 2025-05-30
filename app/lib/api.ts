
import axios, { AxiosError, AxiosResponse } from "axios";
import { AuthResponse, LoginRequest, RefreshTokenRequest, RegisterRequest } from "../types/auth";
import { LessonDetailsDto, LessonProgressDto, ModuleDetailsDto, ModuleListResponse, StepProgressResponse } from "../types/lessons";
import { QuizDetailsDto, QuizResultResponse, SubmitQuizRequest, UserQuizResultsResponse } from "../types/quizzes";
import { PublicUserProfileDto, UpdateProfileRequest, UpdateProfileResult, UserActivityRequest, UserActivityResponse, UserProfileDto, UserProgressResponse, UserRankingRequest, UserRankingResponse, UserStreakResponse, UserXpResponse } from "../types/user";
import { refreshAuthToken } from "../utils/tokenRefresh";

// 1. Read the base API URL
const API_BASE_URL = "http://localhost:5178/api/";

// Check if the environment variable is set
if (!API_BASE_URL && typeof window !== "undefined") {
  console.error(
    "FATAL ERROR: NEXT_PUBLIC_API_URL environment variable is not set!"
  );
}

// 2. Create an axios instance with proper configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json; charset=utf-8",
  },
});

// 3. Request interceptor
api.interceptors.request.use(
  (config) => {
    // Optional request logging
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🚀 Request: ${config.method?.toUpperCase()} ${config.baseURL}${
          config.url
        } with credentials`
      );
    }
    
    // Get token from localStorage if needed (for non-cookie auth)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    console.error("❌ Request Setup Error:", error);
    return Promise.reject(error);
  }
);

// 4. Response interceptor with token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't tried refreshing the token yet
    if (error.response?.status === 401 && originalRequest && !originalRequest.headers._retry) {
      try {
        // Mark this request as retried
        originalRequest.headers._retry = true;
        
        // Try to refresh the token
        const newToken = await refreshAuthToken();
        
        // Update the authorization header
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        // Retry the original request with the new token
        return api(originalRequest);
      } catch (refreshError) {
        // If refreshing fails, return to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login?expired=true';
        }
        return Promise.reject(refreshError);
      }
    }
    
    // Regular error handling for other cases
    if (error.response) {
      console.error(
        `❌ Response Error: ${
          error.response.status
        } for ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        error.response.data
      );
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

// 5. Export the API service with proper paths matching our .NET backend structure
export const apiService = {
  // Basic methods
  async get<T>(relativePath: string, params?: any): Promise<T> {
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

  // Auth API endpoints
  auth: {
    login: (data: LoginRequest) => 
      apiService.post<AuthResponse>("Auth/login", data),
    register: (data: RegisterRequest) => 
      apiService.post<AuthResponse>("Auth/register", data),
    logout: () => 
      apiService.post<void>("Auth/logout"),
    refreshToken: (data: RefreshTokenRequest) => 
      apiService.post<AuthResponse>("Auth/refresh-token", data),
    verifyEmail: (token: string) => 
      apiService.post<{ success: boolean, message: string }>("Auth/verify-email", { token }),
    forgotPassword: (email: string) => 
      apiService.post<{ success: boolean, message: string }>("Auth/forgot-password", { email }),
    resetPassword: (token: string, newPassword: string) => 
      apiService.post<{ success: boolean, message: string }>("Auth/reset-password", { token, newPassword }),
    checkAuthStatus: () => 
      apiService.get<{ isAuthenticated: boolean, user?: UserProfileDto }>("Auth/status"),
  },

  // User API endpoints
  user: {
  getProfile: () =>
    apiService.get<UserProfileDto>("Users/me"),
  updateProfile: (data: UpdateProfileRequest) =>
    apiService.put<UpdateProfileResult>("Users/me", data),
  getPublicProfile: (userId: string) =>
    apiService.get<PublicUserProfileDto>(`Users/${userId}`),
  getProgress: () =>
    apiService.get<UserProgressResponse>("Users/me/progress"),
  getXp: () =>
    apiService.get<UserXpResponse>("Users/me/xp"),
  getStreak: () =>
    apiService.get<UserStreakResponse>("Users/me/streak"),
  getRanking: (request: UserRankingRequest) =>
    apiService.get<UserRankingResponse>("Users/ranking", request),
  getActivity: (request: UserActivityRequest) =>
    apiService.get<UserActivityResponse>("Users/me/activity", request),
},

  // Lesson and Module API endpoints
  lessons: {
    getAllModules: () => 
      apiService.get<ModuleListResponse>("Lessons/modules"),
    getModule: (moduleId: string) => 
      apiService.get<ModuleDetailsDto>(`Lessons/modules/${moduleId}`),
    getLesson: (lessonId: string) => 
      apiService.get<LessonDetailsDto>(`Lessons/${lessonId}`),
    getLessonProgress: (lessonId: string) => 
      apiService.get<LessonProgressDto>(`Lessons/${lessonId}/progress`),
    completeStep: (lessonId: string, stepId: string) => 
      apiService.post<StepProgressResponse>(`Lessons/${lessonId}/steps/${stepId}/complete`),
    completeLesson: (lessonId: string) => 
      apiService.post<{ success: boolean, message: string, xpEarned: number }>(`Lessons/${lessonId}/complete`),
  },

  // Quiz API endpoints
  quiz: {
    getQuiz: (quizId: string) => 
      apiService.get<QuizDetailsDto>(`Quizzes/${quizId}`),
    submitQuiz: (data: SubmitQuizRequest) => 
      apiService.post<QuizResultResponse>(`Quizzes/${data.quizId}/submit`, data),
    getQuizResults: (quizId: string) => 
      apiService.get<UserQuizResultsResponse>(`Quizzes/${quizId}/results`),
    getModuleQuizzes: (moduleId: string) => 
      apiService.get<{ quizzes: QuizDetailsDto[] }>(`Modules/${moduleId}/quizzes`),
    getUserQuizzes: () => 
      apiService.get<{ quizzes: QuizDetailsDto[] }>("User/quizzes"),
  }
};

export default apiService;