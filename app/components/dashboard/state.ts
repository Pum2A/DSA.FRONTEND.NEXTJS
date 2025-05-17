import { LearningPath, Module, User, UserStats } from "@/app/types";
import { JSX } from "react";

// Typy dla obsługi stanu
export type DashboardState = {
  user: User | null;
  stats: UserStats | null;
  modules: Module[];
  learningPaths: LearningPath[];
  streak: number;
  recentActivity: any[];
  dailyGoalCompleted: boolean;
  overallProgress: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  // DODAJ TO POLE:
  recommendedPath?: LearningPath;
};

export type DashboardAction =
  | { type: "FETCH_START" }
  | {
      type: "FETCH_SUCCESS";
      payload: {
        user: User;
        stats: UserStats;
        modules: Module[];
        learningPaths: LearningPath[];
        streak: number;
        recentActivity: any[];
        dailyGoalCompleted: boolean;
        overallProgress: number;
        // DODAJ TO POLE:
        recommendedPath?: LearningPath;
      };
    }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "REFRESH_START" }
  | { type: "REFRESH_END" };

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
  recommendedPath: undefined, // DODAJ INICJALIZACJĘ
};

// Reducer pozostaje bez zmian, bo ...action.payload nadpisze recommendedPath jeśli będzie w payload.
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
    default:
      return state;
  }
}
