import { apiService } from "../lib/api";
import { Lesson, Step, UserProgress } from "../types";

export const lessonService = {
  // Fetch all modules
  getAllModules: (): Promise<Lesson[]> => {
    return apiService.get("/lessons/modules");
  },

  // Fetch a single module by ID
  getModule: (moduleId: string): Promise<Lesson> => {
    return apiService.get(`/lessons/modules/${moduleId}`);
  },

  // Fetch lesson by ID
  getLesson: (lessonId: string): Promise<Lesson> => {
    return apiService.get(`/lessons/${lessonId}`);
  },

  // Fetch lesson progress
  getLessonProgress: (lessonId: string): Promise<UserProgress> => {
    return apiService
      .get<UserProgress>(`/lessons/${lessonId}/progress`)
      .catch((error): UserProgress => {
        // Handle 404 fallback
        if (error.response?.status === 404) {
          return {
            id: 0,
            userId: "",
            lessonId: Number(lessonId),
            isCompleted: false,
            startedAt: new Date().toISOString(),
            currentStepIndex: 0,
            xpEarned: 0,
          };
        }
        throw error;
      });
  },

  // Fetch module progress
  getModuleProgress: (moduleId: string): Promise<UserProgress> => {
    return apiService.get(`/lessons/modules/${moduleId}/progress`);
  },

  // Fetch lesson steps
  getLessonSteps: (lessonId: string): Promise<Step[]> => {
    return apiService.get<Step[]>(`/lessons/${lessonId}/steps`);
  },

  // Mark step as completed
  completeStep: (lessonId: string, stepIndex: number): Promise<void> => {
    return apiService.post(`/lessons/${lessonId}/step/${stepIndex}/complete`);
  },

  // Mark lesson as completed
  completeLesson: (lessonId: string): Promise<void> => {
    return apiService.post(`/lessons/${lessonId}/complete`);
  },
};
