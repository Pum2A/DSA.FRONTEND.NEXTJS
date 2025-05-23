// progress.ts

export interface UserProgress {
  id: number;
  userId: string;
  lessonId: number;
  isCompleted: boolean;
  startedAt: string;
  completedAt?: string;
  currentStepIndex: number;
  xpEarned: number;
  lastUpdated?: string;
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
