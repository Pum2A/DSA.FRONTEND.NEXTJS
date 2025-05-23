// lesson.ts

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  description?: string;
}

export interface StepOption {
  id: string;
  text: string;
  correct?: boolean;
}

export interface StepItem {
  id: string;
  text: string;
  description?: string;
}

export type StepType = "interactive" | "text" | "video" | "quiz" | string;

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

  // Quiz
  question?: string;
  options?: StepOption[];
  correctAnswer?: string;
  explanation?: string;

  // Interactive / Challenge
  initialCode?: string;
  expectedOutput?: string;
  solution?: string;
  hint?: string;

  // List items
  items?: StepItem[];
  additionalData?: string | any;

  stepType: StepType;

  testCases?: TestCase[];
}

export interface Lesson {
  id: number;
  externalId: string;
  title: string;
  description: string;
  estimatedTime: string;
  xpReward: number;
  moduleId: number;
  steps?: Step[];
}
