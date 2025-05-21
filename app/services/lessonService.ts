import { apiService } from "../lib/api";
import {
  Lesson,
  LessonProgress,
  LessonRecommendation,
  Module,
  ModuleProgress,
  Step,
  StepCompletionData,
  StepVerificationResult,
  UserLearningStats,
} from "../types";

export const lessonService = {
  // Fetch all modules
  getAllModules: (): Promise<Module[]> => {
    return apiService.lessons.getAllModules();
  },

  // Fetch a single module by ID
  getModule: (moduleId: string): Promise<Module> => {
    return apiService.lessons.getModule(moduleId);
  },

  // Fetch lesson by ID
  getLesson: (lessonId: string): Promise<Lesson> => {
    return apiService.lessons.getLesson(lessonId);
  },

  // Fetch lesson progress
  getLessonProgress: (lessonId: string): Promise<LessonProgress> => {
    return apiService.lessons
      .getLessonProgress(lessonId)
      .catch((error): LessonProgress => {
        // Handle 404 fallback
        if (error.response?.status === 404) {
          return {
            lessonId: lessonId,
            completedSteps: 0,
            totalSteps: 0,
            isCompleted: false,
            lastActivityDate: undefined,
            completionPercentage: 0,
            earnedXP: 0,
          };
        }
        throw error;
      });
  },

  // Fetch module progress
  getModuleProgress: (moduleId: string): Promise<ModuleProgress> => {
    return apiService.lessons.getModuleProgress(moduleId);
  },

  // Fetch lesson steps
  // Fetch lesson steps
  getLessonSteps: (lessonId: string): Promise<Step[]> => {
    return apiService.lessons
      .getLessonSteps(lessonId)
      .then((stepsData: unknown) => {
        // Mapuj typy backendu do typów frontendu, jeśli potrzeba
        if (!Array.isArray(stepsData)) {
          throw new Error("Expected array of steps from API");
        }
        return stepsData.map((step) => {
          // Skopiuj wszystkie pola
          const mappedStep = { ...step };

          // Mapuj typ, jeśli potrzeba
          if (step.type === "theory") mappedStep.type = "text";
          if (step.type === "visualization") mappedStep.type = "video";
          if (step.type === "coding") mappedStep.type = "challenge";

          // Parsuj dodatkoweDane, jeśli są w formacie JSON string
          if (typeof step.additionalData === "string" && step.additionalData) {
            try {
              mappedStep.additionalData = JSON.parse(step.additionalData);

              // Mapuj pola wewnętrzne
              if (step.type === "quiz" && mappedStep.additionalData.options) {
                // Popraw format opcji quizu
                mappedStep.options = mappedStep.additionalData.options.map(
                  (opt: any) => ({
                    id: opt.id,
                    text: opt.text,
                    isCorrect: opt.correct, // zmień 'correct' na 'isCorrect'
                  })
                );
                mappedStep.question = mappedStep.additionalData.question;
                mappedStep.correctAnswer =
                  mappedStep.additionalData.options.find(
                    (o: any) => o.correct
                  )?.id;
              }
            } catch (e) {
              console.error("Błąd parsowania additionalData:", e);
            }
          }

          return mappedStep;
        });
      }) as Promise<Step[]>;
  },

  // Mark step as completed
  completeStep: (
    lessonId: string,
    stepIndex: number,
    completionData: StepCompletionData
  ): Promise<boolean> => {
    return apiService.lessons.completeStep(lessonId, stepIndex, completionData);
  },

  // Verify step answer
  verifyStepAnswer: (
    lessonId: string,
    stepIndex: number,
    answer: any
  ): Promise<StepVerificationResult> => {
    return apiService.lessons.verifyStepAnswer(lessonId, stepIndex, answer);
  },

  // Mark lesson as completed
  completeLesson: (
    lessonId: string
  ): Promise<{ success: boolean; xpAwarded: number; message: string }> => {
    return apiService.lessons.completeLesson(lessonId);
  },

  // Get user learning stats
  getUserLearningStats: (): Promise<UserLearningStats> => {
    return apiService.lessons.getUserLearningStats();
  },

  // Get module completion rates
  getModuleCompletionRates: (): Promise<Record<string, number>> => {
    return apiService.lessons.getModuleCompletionRates();
  },

  // Get personalized recommendations
  getPersonalizedRecommendations: (): Promise<LessonRecommendation[]> => {
    return apiService.lessons.getPersonalizedRecommendations();
  },
};
