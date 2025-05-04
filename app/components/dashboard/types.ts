import { User, UserStats } from "@/app/types";
import { JSX } from "react";

export enum UserActionType {
  LessonCompleted = 0,
  QuizCompleted = 1,
  Login = 2,
}

export interface UserActivity {
  id: number | string;
  userId: string;
  actionType: number;
  actionTime: string;
  referenceId?: string;
  additionalInfo?: string;
}

export interface ProcessedActivity {
  id: string | number;
  type: number;
  title: string;
  description: string;
  date: string;
  icon: JSX.Element;
}

// Rozszerzenie istniejącego typu LearningPath dla dashboard
export interface DashboardLearningPath {
  id: string;
  title: string;
  description: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  icon?: string | JSX.Element;
  iconColor?: string;
}

// Typy dla komponentów Dashboard
export interface DashboardState {
  user: User | null;
  stats: UserStats | null;
  modules: any[]; // Używaj typu Module z app/types
  learningPaths: DashboardLearningPath[];
  streak: number; // osobne pole streak zgodnie z API
  recentActivity: ProcessedActivity[];
  dailyGoalCompleted: boolean;
  overallProgress: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

// Pozostałe typy komponentów...
export interface ProgressCardProps {
  stats: UserStats | null;
  user: User | null;
  overallProgress: number;
  isLoading: boolean;
  isRefreshing: boolean;
  recommendedPath: DashboardLearningPath | undefined;
}

export interface DailyStreakCardProps {
  streak: number;
  dailyGoalCompleted: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
}

export interface ActivityCardProps {
  activities: ProcessedActivity[];
  isLoading: boolean;
  isRefreshing: boolean;
}

export interface ModuleTabsProps {
  learningPaths: DashboardLearningPath[];
  isLoading: boolean;
}

export interface LearningPathCardProps {
  path: DashboardLearningPath;
  variant?: "default" | "inProgress" | "completed" | "notStarted";
}

export interface EmptyModuleMessageProps {
  icon: JSX.Element;
  title: string;
  subtitle: string;
}

export interface RecommendedModuleProps {
  path: DashboardLearningPath;
}
