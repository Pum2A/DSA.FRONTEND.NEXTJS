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

export interface LessonStepDto {
  id: string;
  title: string;
  content: string; // Może zawierać Markdown lub HTML
  codeExample?: string;
  order: number;
  isCompleted?: boolean;
}

export interface LessonProgressDto {
  isCompleted: boolean;
  startedAt: string; // string ISO Date
  completedAt?: string; // string ISO Date
  currentStep: number; // Index lub ID bieżącego kroku
  completedSteps: number;
  totalSteps: number;
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
