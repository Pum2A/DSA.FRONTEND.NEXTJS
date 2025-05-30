import { QuizListItemDto } from "./quizzes";

export interface ModuleDto {
  id: string;
  title: string;
  description: string;
  iconUrl: string;
  order: number;
  isActive: boolean;
  lessonCount: number;
  quizCount: number;
}

export interface ModuleListResponse {
  modules: ModuleDto[];
}

export interface LessonDto {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  xpReward: number;
  order: number;
  isActive: boolean;
  isCompleted?: boolean;
  stepCount: number;
  completedStepCount?: number;
}

export interface ModuleDetailsDto {
  id: string;
  title: string;
  description: string;
  iconUrl: string;
  lessons: LessonDto[];
  quizzes: QuizListItemDto[];
  progress?: ModuleProgressDto;
}

export interface LessonStepDto {
  id: string;
  title: string;
  content: string;
  codeExample?: string;
  order: number;
  isCompleted?: boolean;
}

export interface LessonDetailsDto {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  xpReward: number;
  steps: LessonStepDto[];
  userProgress?: LessonProgressDto;
}

export interface LessonProgressDto {
  isCompleted: boolean;
  startedAt: string;
  completedAt?: string;
  currentStep: number;
  completedSteps: number;
  totalSteps: number;
}

export interface ModuleProgressDto {
  id: string;
  title: string;
  totalLessons: number;
  completedLessons: number;
  totalQuizzes: number;
  completedQuizzes: number;
  progressPercentage: number;
  isCompleted: boolean;
}

export interface UserProgressResponse {
  totalModules: number;
  completedModules: number;
  totalLessons: number;
  completedLessons: number;
  totalQuizzes: number;
  completedQuizzes: number;
  overallProgressPercentage: number;
  moduleProgresses: ModuleProgressDto[];
}

export interface CompleteStepRequest {
  lessonId: string;
  stepId: string;
}

export interface StepProgressResponse {
  success: boolean;
  message: string;
  xpEarned: number;
  isLessonCompleted: boolean;
  progress: LessonProgressDto;
}