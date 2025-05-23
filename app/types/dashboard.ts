// app/types/dashboard.ts

import { JSX } from "react";
import { UserStats } from "./progress";
import { User } from "./user";

// Akcje użytkownika
export enum UserActionType {
  LessonCompleted = 0,
  QuizCompleted = 1,
  Login = 2,
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  createdAt: string;
  read: boolean;
}

// Aktywność użytkownika
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

// Rozszerzony typ ścieżki nauki dla dashboardu
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

// ===== STAN DASHBOARDU =====

export type DashboardState = {
  user: User | null;
  stats: UserStats | null;
  modules: any[]; // Można zmienić na konkretny typ Module
  learningPaths: DashboardLearningPath[];
  streak: number;
  recentActivity: ProcessedActivity[];
  dailyGoalCompleted: boolean;
  overallProgress: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  recommendedPath?: DashboardLearningPath;
  notifications: Notification[];
  notificationsLoading?: boolean;
};

export type DashboardAction =
  | { type: "FETCH_START" }
  | {
      type: "FETCH_SUCCESS";
      payload: {
        user: User;
        stats: UserStats;
        modules: any[];
        learningPaths: DashboardLearningPath[];
        streak: number;
        recentActivity: ProcessedActivity[];
        dailyGoalCompleted: boolean;
        overallProgress: number;
        recommendedPath?: DashboardLearningPath;
      };
    }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "REFRESH_START" }
  | { type: "REFRESH_END" }
  | { type: "NOTIFICATIONS_FETCH_START" }
  | { type: "NOTIFICATIONS_FETCH_SUCCESS"; payload: Notification[] }
  | { type: "NOTIFICATIONS_FETCH_ERROR"; payload: string }
  | { type: "MARK_NOTIFICATION_AS_READ"; payload: string };

export const initialDashboardState: DashboardState = {
  user: null,
  stats: null,
  modules: [],
  learningPaths: [],
  streak: 0,
  recentActivity: [],
  dailyGoalCompleted: false,
  overallProgress: 0,
  isLoading: true,
  isRefreshing: false,
  error: null,
  recommendedPath: undefined,
  notifications: [],
  notificationsLoading: false,
};

// Reducer — możesz umieścić osobno w app/state jeśli wolisz
export function dashboardReducer(
  state: DashboardState,
  action: DashboardAction
): DashboardState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isLoading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        isRefreshing: false,
        error: null,
      };
    case "FETCH_ERROR":
      return {
        ...state,
        isLoading: false,
        isRefreshing: false,
        error: action.payload,
      };
    case "REFRESH_START":
      return { ...state, isRefreshing: true, error: null };
    case "REFRESH_END":
      return { ...state, isRefreshing: false };
    case "NOTIFICATIONS_FETCH_START":
      return { ...state, notificationsLoading: true };
    case "NOTIFICATIONS_FETCH_SUCCESS":
      return {
        ...state,
        notifications: action.payload,
        notificationsLoading: false,
      };

    case "NOTIFICATIONS_FETCH_ERROR":
      return { ...state, notificationsLoading: false, error: action.payload };

    case "MARK_NOTIFICATION_AS_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };

    default:
      return state;
  }
}

// ===== PROPSY KOMPONENTÓW =====

export interface ProgressCardProps {
  stats: UserStats | null;
  user: User | null;
  overallProgress: number;
  isLoading: boolean;
  isRefreshing: boolean;
  recommendedPath?: DashboardLearningPath;
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
