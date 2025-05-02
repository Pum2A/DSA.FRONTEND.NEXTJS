// Podstawowe typy danych

import { JSX } from "react";

export interface TestCase {
  id: string; // Unikalne ID testu w ramach kroku
  input: string; // Dane wejściowe jako string (do sparsowania)
  expectedOutput: string; // Oczekiwany wynik jako string (do sparsowania i porównania)
  description?: string; // Opcjonalny opis testu
}

export interface Step {
  id: number;
  type: string;
  title: string;
  content: string;
  code?: string;
  language?: string;
  imageUrl?: string;
  order: number;
  lessonId: number;
  // Dodatkowe pola dla quizów
  question?: string;
  options?: Array<{ id: string; text: string; correct?: boolean }>;
  correctAnswer?: string;
  explanation?: string;
  // Dodatko
  // we pola dla interactive i challenge
  initialCode?: string;
  expectedOutput?: string;
  solution?: string;
  hint?: string;
  // Dodatkowe pola dla list
  items?: { id: string; text: string; description?: string }[];
  additionalData?: string | any;
  stepType: "interactive" | "text" | "video" | "quiz" | string; // Dodaj 'interactive' i inne typy
  testCases?: TestCase[]; // Używa zdefiniowanego wyżej typu TestCase
}

export interface TestResult {
  id: string; // ID z TestCase
  status: "pass" | "fail" | "error"; // Status testu
  inputDisplay: string; // Oryginalny input jako string do wyświetlenia
  expectedOutputDisplay: string; // Oryginalny oczekiwany output jako string do wyświetlenia
  actualOutputDisplay: string | null; // Aktualny output jako string (lub null przy błędzie)
  error: string | null; // Komunikat błędu (jeśli status='error' lub czasem 'fail')
}

export interface Lesson {
  id: number;
  externalId: string;
  title: string;
  description: string;
  estimatedTime: string;
  xpReward: number;
  moduleId: number;
  steps?: Step[]; // Opcjonalne, może być puste lub undefined
}

export interface Module {
  id: number;
  externalId: string;
  title: string;
  description: string;
  order: number;
  icon: string;
  iconColor: string;
  lessons?: Lesson[]; // Opcjonalne, może być puste lub undefined
}

export interface UserProgress {
  id: number;
  userId: string;
  lessonId: number;
  isCompleted: boolean;
  startedAt: string;
  completedAt?: string;
  currentStepIndex: number;
  xpEarned: number;
  lastUpdated?: string; // Dodane pole
}

export interface ModuleProgress {
  completedLessons: number;
  inProgressLessons: number;
  totalLessons: number;
}

export interface UserStats {
  totalXp: number;
  level: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
}

// Typ dla ścieżki nauki na dashboard
export type LearningPath = {
  id: string;
  title: string;
  description: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  icon?: string | JSX.Element;
  iconColor?: string;
};

// Typ dla użytkownika z autoryzacji
export interface User {
  id: string;
  userName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  level?: number;
  experiencePoints?: number;
  createdAt?: string;
  joinedAt?: string;
}

// Typy odpowiedzi API
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}
