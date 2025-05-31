export enum ActivityType {
  LessonCompleted = "LessonCompleted",
  QuizCompleted = "QuizCompleted",
  StreakMilestone = "StreakMilestone",
  LevelUp = "LevelUp",
  ModuleCompleted = "ModuleCompleted",
}

export interface UserDto {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  xpPoints: number;
  currentStreak: number;
  maxStreak: number;
  lastActivityDate?: string; // Powinien być stringiem ISO Date (np. "2023-10-26T07:49:13.748Z")
  emailVerified: boolean;
}

export interface UserStatsDto {
  completedLessons: number;
  completedModules: number;
  completedQuizzes: number;
  averageQuizScore: number;
  ranking: number;
}

export interface UserProfileDto {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  emailVerified: boolean;
  xpPoints: number;
  currentStreak: number;
  maxStreak: number;
  lastActivityDate?: string; // string ISO Date
  createdAt: string; // string ISO Date
  stats: UserStatsDto;
}

export interface UpdateProfileRequest {
  username?: string;
  avatar?: string;
}

export interface UpdateProfileResult {
  success: boolean;
  message: string;
  data?: UserProfileDto;
}

export interface PublicUserProfileDto {
  id: string;
  username: string;
  avatar?: string;
  xpPoints: number;
  currentStreak: number;
  maxStreak: number;
  lastActivityDate?: string; // string ISO Date
  createdAt: string; // string ISO Date
  stats: UserStatsDto;
}

export interface UserRankingRequest {
  orderBy: string; // np. "xpPoints", "currentStreak"
  descending: boolean;
  page: number;
  pageSize: number;
}

export interface UserRankingItemDto {
  id: string;
  username: string;
  avatar?: string;
  xpPoints: number;
  completedLessons: number;
  completedQuizzes: number;
  currentStreak: number;
  rank: number;
}

export interface UserRankingResponse {
  users: UserRankingItemDto[];
  totalUsers: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserActivityRequest {
  startDate?: string; // string ISO Date
  endDate?: string; // string ISO Date
  page: number;
  pageSize: number;
}

export interface UserActivityItemDto {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  xpEarned: number;
  createdAt: string; // string ISO Date
  relatedEntityId?: string;
  relatedEntityType?: string; // np. "Lesson", "Quiz", "Module"
}

export interface UserActivityResponse {
  activities: UserActivityItemDto[];
  totalActivities: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface XpHistoryItemDto {
  id: string;
  amount: number;
  source: string; // np. "LESSON_COMPLETION", "QUIZ_COMPLETION"
  description: string;
  createdAt: string; // string ISO Date
}

export interface UserXpResponse {
  totalXp: number;
  currentLevel: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpProgress: number; // Procent postępu do następnego poziomu (0-100)
  recentXpHistory: XpHistoryItemDto[];
}

export interface StreakDayDto {
  date: string; // string ISO Date (tylko data, np. "2023-10-26")
  wasActive: boolean;
}

export interface UserStreakResponse {
  currentStreak: number;
  maxStreak: number;
  lastActivityDate?: string; // string ISO Date
  isActiveToday: boolean;
  daysUntilStreakLost: number; // Ile dni pozostało do utraty passy (jeśli nieaktywny)
  recentDays: StreakDayDto[]; // Aktywność z ostatnich kilku dni
}
