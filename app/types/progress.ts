// progress.ts - ROZSZERZONE O NOWE FUNKCJE

export interface UserProgressDto {
  id: number;
  userId: string;
  lessonId: number;
  isCompleted: boolean;
  startedAt: Date;
  completedAt?: Date;
  lastUpdated?: Date;
  currentStepIndex: number;
  xpEarned: number;
}

export interface UserLearningStatsDto {
  totalLessonsCompleted: number;
  totalXPEarned: number;
  currentLevel: number;
  xpToNextLevel: number;
  averageCompletionRate: number;
  totalLearningTime: TimeSpan;
  completedLessonsByType: Record<string, number>;
}

export interface RecentActivityDto {
  activityType: string;
  description: string;
  timestamp: Date;
  xpEarned: number;
  relatedContent: string;
}

// COMPATIBILITY
export type UserProgress = UserProgressDto;

export interface UserStats {
  totalXp: number;
  level: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
}

// TimeSpan helper (C# TimeSpan equivalent)
export interface TimeSpan {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMilliseconds: number;
}
