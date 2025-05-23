// lesson.ts - PEŁNA ZGODNOŚĆ Z BACKEND LESSONS DTO

// ===== QUIZ & CHALLENGE =====
export interface QuizOptionDto {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface TestCaseDto {
  id: string;
  input: string;
  expectedOutput: string;
  description: string;
  isHidden: boolean;
}

export interface QuizData {
  question: string;
  options: QuizOptionDto[];
  correctAnswer: string;
  explanation: string;
}

export interface ChallengeData {
  initialCode: string;
  testCases: TestCaseDto[];
  hint: string;
  language: string;
  solution: string;
}

export interface CodingData {
  initialCode: string;
  testCases: TestCaseDto[];
  hint: string;
  language: string;
  solution: string;
}

// ===== INTERACTIVE =====
export interface ListItemDto {
  id: string;
  text: string;
  description: string;
}

export interface InteractiveData {
  items: ListItemDto[];
  expectedOrder: string;
  taskDescription: string;
}

export interface VideoData {
  url: string;
  duration: number;
  requireFullWatch: boolean;
  chapters: string[];
}

// ===== STEP COMPLETION =====
export interface StepCompletionData {
  answer: any;
  isCorrect?: boolean;
  timeSpent: number;
  attempts: number;
  testsPassed?: number;
  totalTests?: number;
  completionStatus?: boolean;
}

export interface StepCompletionResult {
  success: boolean;
  error: string;
  xpEarned: number;
  nextStepIndex?: number;
  isLessonCompleted: boolean;
}

export interface StepVerificationResult {
  isCorrect: boolean;
  feedback: string;
  nextStep?: number;
}

// ===== MAIN STRUCTURES =====
export interface StepDto {
  id: number;
  type: string;
  title: string;
  content: string;
  code: string;
  language: string;
  imageUrl: string;
  order: number;
  lessonId: number;
  additionalData: string;
  StepType: StepType;
  solution: string;
  chapters: string[];
  xpReward: number;
  // Quiz fields
  question: string;
  options: QuizOptionDto[];
  correctAnswer: string;
  explanation: string;

  // Coding/Challenge fields
  initialCode: string;
  testCases: TestCaseDto[];
  hint: string;

  // Interactive fields
  items: ListItemDto[];

  // Video fields
  videoUrl: string;
  duration: number;
  requireFullWatch: boolean;

  // Additional data objects
  quizData: QuizData;
  challengeData: ChallengeData;
  interactiveData: InteractiveData;
  videoData: VideoData;
}

export interface LessonDto {
  id: number;
  externalId: string;
  title: string;
  description: string;
  estimatedTime: string;
  xpReward: number;
  moduleId: number;
  requiredSkills: string[];
  steps: StepDto[];
}

// PROGRESS & RECOMMENDATIONS
export interface LessonProgressDto {
  lessonId: string;
  completedSteps: number;
  totalSteps: number;
  isCompleted: boolean;
  lastActivityDate?: Date;
  completionPercentage: number;
  earnedXP: number;
}

export interface LessonRecommendationDto {
  lessonId: string;
  title: string;
  description: string;
  relevanceScore: number;
  recommendationType: string;
  moduleId: string;
  moduleTitle: string;
}

// COMPATIBILITY - aliasy dla starych nazw
export type Lesson = LessonDto;
export type Step = StepDto;
export type TestCase = TestCaseDto;
export type StepOption = QuizOptionDto;
export type StepItem = ListItemDto;
export type StepType = "interactive" | "text" | "video" | "quiz" | string;
