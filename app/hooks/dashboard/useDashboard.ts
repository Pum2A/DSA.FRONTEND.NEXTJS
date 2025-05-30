import { apiService } from "@/app/lib/api";
import { useAuthStore } from "@/app/store/authStore";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useReducer } from "react";

import {
  processModuleData,
  processStreakData,
  processUserActivity,
} from "@/app/components/utils";
import { useNotificationStore } from "@/app/store/notificationStore";
import { dashboardReducer, initialDashboardState } from "@/app/types/dashboard";
import { Module } from "@/app/types/module";
import { UserStats } from "@/app/types/progress";
import { User } from "@/app/types/user";

export function useDashboard() {
  const {
    isAuthenticated,
    user: authUser,
    isLoading: isLoadingAuth,
  } = useAuthStore();
  const router = useRouter();
  const [state, dispatch] = useReducer(dashboardReducer, initialDashboardState);

  const setNotification = useNotificationStore((s) => s.setNotification);

  // Przekierowanie jeśli nie jest zalogowany (opcjonalne jeśli masz AuthProvider)
  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, isLoadingAuth, router]);

  // Pobieranie postępu modułu
  const fetchModuleProgress = useCallback(async (moduleId: string) => {
    try {
      const moduleProgress = await apiService.lessons.getModuleProgress(
        moduleId
      );
      return moduleProgress as {
        completedLessons: number;
        totalLessons: number;
      };
    } catch (error) {
      return { completedLessons: 0, totalLessons: 0 };
    }
  }, []);

  // Główna funkcja pobierania danych
  const fetchDashboardData = useCallback(
    async (isRefresh = false) => {
      if (!isAuthenticated || !authUser) return;
      dispatch(isRefresh ? { type: "REFRESH_START" } : { type: "FETCH_START" });
      try {
        const [
          userDataResponse,
          modulesResponse,
          statsResponse,
          streakResponse,
          historyResponse,
        ] = await Promise.all([
          apiService.get("Auth/user"),
          apiService.lessons.getAllModules(),
          apiService.user.getStats(),
          apiService.user.getStreak(),
          apiService.user.getActivityHistory?.() || Promise.resolve([]),
        ]);

        const streakValue = processStreakData(streakResponse);
        const { dailyGoalCompleted, activity } =
          processUserActivity(historyResponse);
        const learningPaths = await processModuleData(
          modulesResponse as Module[],
          fetchModuleProgress
        );

        const stats = statsResponse as {
          totalLessonsCount: number;
          completedLessonsCount: number;
          [key: string]: any;
        };
        const overallProgress =
          stats.totalLessonsCount > 0
            ? Math.min(
                100,
                Math.round(
                  (stats.completedLessonsCount / stats.totalLessonsCount) * 100
                )
              )
            : 0;

        // Logika wyboru ścieżki rekomendowanej
        const recommendedPath =
          (learningPaths.find(
            (p) =>
              (p.progress > 0 &&
                p.progress < 100 &&
                p.icon &&
                typeof p.icon !== "string") ||
              false
          ) as (typeof learningPaths)[number] | undefined) ||
          (learningPaths.find(
            (p) => p.progress === 0 && p.icon && typeof p.icon !== "string"
          ) as (typeof learningPaths)[number] | undefined);

        dispatch({
          type: "FETCH_SUCCESS",
          payload: {
            user: userDataResponse as User,
            stats: statsResponse as UserStats,
            modules: modulesResponse as Module[],
            learningPaths,
            streak: streakValue,
            recentActivity: activity,
            dailyGoalCompleted,
            overallProgress,
            recommendedPath,
          },
        });

        if (isRefresh) {
          setNotification({
            type: "success",
            message: "Pomyślnie odświeżono dane dashboardu.",
          });
        }
      } catch (err) {
        dispatch({
          type: "FETCH_ERROR",
          payload: "Nie udało się pobrać danych. Spróbuj odświeżyć stronę.",
        });
        setNotification({
          type: "error",
          message: "Nie udało się pobrać danych. Spróbuj odświeżyć stronę.",
        });
      }
    },
    [isAuthenticated, authUser, fetchModuleProgress, setNotification]
  );

  // Inicjalne pobieranie danych
  useEffect(() => {
    if (isAuthenticated && !isLoadingAuth) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchDashboardData, isAuthenticated, isLoadingAuth]);

  // Nasłuchiwanie na event ukończenia zadania (np. quiz)
  useEffect(() => {
    const handleTaskCompleted = () => {
      fetchDashboardData(true); // tryb refresh
    };
    window.addEventListener("taskCompleted", handleTaskCompleted);
    return () =>
      window.removeEventListener("taskCompleted", handleTaskCompleted);
  }, [fetchDashboardData]);

  // Funkcja do odświeżania dashboardu z UI
  const handleRefresh = () => fetchDashboardData(true);

  return {
    state,
    isLoadingAuth,
    isAuthenticated,
    authUser,
    handleRefresh,
    isRefreshing: state.isRefreshing,
    error: state.error,
  };
}
