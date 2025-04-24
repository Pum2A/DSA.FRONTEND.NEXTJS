// Podstawowe typy danych
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
  // Dodatkowe pola dla interactive i challenge
  initialCode?: string;
  expectedOutput?: string;
  testCases?: {
    id: string;
    input: string;
    expectedOutput: string;
    description?: string;
  }[];
  solution?: string;
  hint?: string;
  // Dodatkowe pola dla list
  items?: { id: string; text: string; description?: string }[];
  additionalData?: string | any;
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
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  icon?: string; // Dodane pole
  iconColor?: string; // Dodane pole
}

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
