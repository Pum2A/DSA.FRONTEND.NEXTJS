import { LessonDto } from "./lessonTypes";
import { QuizListItemDto } from "./quizTypes";

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

export interface ModuleProgressDto {
  id: string; // ID modułu, do którego odnosi się ten postęp
  title: string; // Tytuł modułu (może być nadmiarowe, jeśli masz ID)
  totalLessons: number;
  completedLessons: number;
  totalQuizzes: number;
  completedQuizzes: number;
  progressPercentage: number; // (0-100)
  isCompleted: boolean;
}

export interface ModuleDetailsDto {
  id: string;
  title: string;
  description: string;
  iconUrl: string;
  lessons: LessonDto[];
  quizzes: QuizListItemDto[];
  progress?: ModuleProgressDto; // Postęp użytkownika w tym module
}
