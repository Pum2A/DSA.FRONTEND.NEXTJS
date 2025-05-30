export interface UserProfileDto {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  emailVerified: boolean;
  xpPoints: number;
  currentStreak: number;
  maxStreak: number;
  lastActivityDate?: string;
  createdAt: string;
  stats: UserStatsDto;
}

export interface UserStatsDto {
  completedLessons: number;
  completedModules: number;
  completedQuizzes: number;
  averageQuizScore: number;
  ranking: number;
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
  lastActivityDate?: string;
  createdAt: string;
  stats: UserStatsDto;
}

export interface UserRankingRequest {
  orderBy: string;
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
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
}

export enum ActivityType {
  LessonCompleted = 'LessonCompleted',
  QuizCompleted = 'QuizCompleted',
  StreakMilestone = 'StreakMilestone',
  LevelUp = 'LevelUp',
  ModuleCompleted = 'ModuleCompleted'
}

export interface UserActivityItemDto {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  xpEarned: number;
  createdAt: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

export interface UserActivityResponse {
  activities: UserActivityItemDto[];
  totalActivities: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ModuleProgressDto {
  id: string;
  title: string;
  totalLessons: number;
  completedLessons: number;
  totalQuizzes: number;
  completedQuizzes: number;
  progressPercentage: number;
  isCompleted: boolean;
}

export interface UserProgressResponse {
  totalModules: number;
  completedModules: number;
  totalLessons: number;
  completedLessons: number;
  totalQuizzes: number;
  completedQuizzes: number;
  overallProgressPercentage: number;
  moduleProgresses: ModuleProgressDto[];
}

export interface XpHistoryItemDto {
  id: string;
  amount: number;
  source: string;
  description: string;
  createdAt: string;
}

export interface UserXpResponse {
  totalXp: number;
  currentLevel: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpProgress: number;
  recentXpHistory: XpHistoryItemDto[];
}

export interface StreakDayDto {
  date: string;
  wasActive: boolean;
}

export interface UserStreakResponse {
  currentStreak: number;
  maxStreak: number;
  lastActivityDate?: string;
  isActiveToday: boolean;
  daysUntilStreakLost: number;
  recentDays: StreakDayDto[];
}