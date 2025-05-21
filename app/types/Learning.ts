// ================== PODSTAWOWE TYPY EDUKACYJNE ==================

// Test case dla kroków coding/interaktywnych
export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  description?: string;
  isHidden?: boolean;
}

// Opcja quizu
export interface QuizOption {
  id: string; // TYLKO string!
  text: string;
  isCorrect?: boolean;
}

// Element listy
export interface ListItem {
  id: string;
  text: string;
  description?: string;
}

// Wynik pojedynczego testu
export interface TestResult {
  id: string;
  status: "pass" | "fail" | "error";
  inputDisplay: string;
  expectedOutputDisplay: string;
  actualOutputDisplay: string | null;
  error: string | null;
}

// Dane quizu
export interface QuizData {
  question: string;
  options: QuizOption[];
  correctAnswer: string;
  explanation?: string;
}

// Dane interaktywne
export interface InteractiveData {
  items?: ListItem[];
  testCases?: TestCase[];
  taskDescription?: string;
  expectedOrder?: string;
}

// Coding/Challenge data
export interface ChallengeData {
  initialCode?: string;
  testCases?: TestCase[];
  hint?: string;
  language?: string;
  solution?: string;
}

// Dane wideo
export interface VideoData {
  url?: string;
  duration?: number;
  requireFullWatch?: boolean;
  chapters?: string[];
}

// Typy kroków lekcji
export type StepType =
  | "text"
  | "image"
  | "code"
  | "quiz"
  | "list"
  | "interactive"
  | "challenge"
  | "video"
  // Dodaj typy backendu
  | "theory"
  | "visualization"
  | "coding";

// Główna definicja kroku lekcji
export interface Step {
  id: number;
  lessonId: number;
  order: number;
  type: StepType;
  title?: string;
  content?: string;
  code?: string;
  language?: string;
  imageUrl?: string;

  // Quiz
  question?: string;
  options?: QuizOption[];
  correctAnswer?: string;
  explanation?: string;

  // Interaktywne
  items?: ListItem[];
  initialCode?: string;
  testCases?: TestCase[];
  hint?: string;
  solution?: string;

  // Wideo
  videoUrl?: string;
  duration?: number;
  requireFullWatch?: boolean;

  // Mocno typowane dane dodatkowe
  additionalData?: string;
  quizData?: QuizData;
  interactiveData?: InteractiveData;
  challengeData?: ChallengeData;
  videoData?: VideoData;
}

// Lekcja
export interface Lesson {
  id: number;
  externalId: string;
  moduleId: number;
  title: string;
  description: string;
  estimatedTime: string;
  xpReward: number;
  requiredSkills: string[];
  steps: Step[];
}

// Moduł
export interface Module {
  id: number;
  externalId: string;
  title: string;
  description: string;
  order: number;
  icon: string;
  iconColor: string;
  prerequisites: string[];
  lessons: Lesson[];
  totalXP?: number;
  estimatedTotalTime?: string;
  difficulty?: string;
}

// Progres użytkownika w lekcji
export interface LessonProgress {
  lessonId: string;
  completedSteps: number;
  totalSteps: number;
  isCompleted: boolean;
  lastActivityDate?: string;
  completionPercentage: number;
  earnedXP: number;
}

// Progres w module
export interface ModuleProgress {
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  totalXPEarned: number;
  lastActivity?: string;
  completionPercentage: number;
}

// Dane dla ukończenia kroku
export interface StepCompletionData {
  isCorrect?: boolean;
  answer?: any;
  timeSpent: number;
  attempts: number;
  testsPassed?: number;
  totalTests?: number;
  completionStatus?: boolean;
}
