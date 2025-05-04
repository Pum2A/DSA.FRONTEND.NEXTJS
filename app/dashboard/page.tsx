"use client";

import { apiService } from "@/app/lib/api";
import { useAuthStore } from "@/app/store/authStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useReducer } from "react";
import ActivityCard from "../components/dashboard/ActivityCard";
import DailyStreakCard from "../components/dashboard/DailyStreakCard";
import ModuleTabs from "../components/dashboard/ModuleTabs";
import ProgressCard from "../components/dashboard/ProgressCard";
import {
  dashboardReducer,
  initialDashboardState,
} from "../components/dashboard/state";
import {
  processModuleData,
  processStreakData,
  processUserActivity,
} from "../components/dashboard/utils";
import { Module, UserStats } from "../types";

export default function DashboardPage() {
  const {
    isAuthenticated,
    user: authUser,
    isLoading: authLoading,
  } = useAuthStore();
  const router = useRouter();
  const [state, dispatch] = useReducer(dashboardReducer, initialDashboardState);

  // Przekierowanie jeśli nie jest zalogowany
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, authLoading, router]);

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
      console.error(`Error fetching progress for module ${moduleId}:`, error);
      return { completedLessons: 0, totalLessons: 0 };
    }
  }, []);

  // Główna funkcja pobierania danych
  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated || !authUser) return;

    dispatch(
      state.isLoading ? { type: "FETCH_START" } : { type: "REFRESH_START" }
    );

    try {
      // Równoległe pobieranie wszystkich danych
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

      console.log("Debug - dane z API - streak:", streakResponse);

      // Przetwarzanie streaka poprawiając błąd z obiektem
      const streakValue = processStreakData(streakResponse);

      // Przetwarzanie aktywności
      const { dailyGoalCompleted, activity } =
        processUserActivity(historyResponse);

      // Przetwarzanie ścieżek nauki
      const learningPaths = await processModuleData(
        modulesResponse as Module[],
        fetchModuleProgress
      );

      // Obliczenie ogólnego postępu
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

      // Aktualizacja stanu przez reducer
      dispatch({
        type: "FETCH_SUCCESS",
        payload: {
          user: userDataResponse as import("../types").User,
          stats: statsResponse as UserStats,
          modules: modulesResponse as Module[],
          learningPaths,
          streak: streakValue,
          recentActivity: activity,
          dailyGoalCompleted,
          overallProgress,
        },
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      dispatch({
        type: "FETCH_ERROR",
        payload: "Nie udało się pobrać danych. Spróbuj odświeżyć stronę.",
      });
    }
  }, [isAuthenticated, authUser, fetchModuleProgress]);

  // Inicjalne pobieranie danych
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchDashboardData();
    }
  }, [fetchDashboardData, isAuthenticated, authLoading]);

  // Nasłuchiwanie na zdarzenie ukończenia zadania
  useEffect(() => {
    const handleTaskCompleted = () => {
      console.log("Dashboard: taskCompleted! Odświeżam...");
      fetchDashboardData();
    };

    window.addEventListener("taskCompleted", handleTaskCompleted);
    return () =>
      window.removeEventListener("taskCompleted", handleTaskCompleted);
  }, [fetchDashboardData]);

  // Renderowanie loadera podczas ładowania
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Zwróć null jeśli użytkownik nie jest zalogowany
  if (!isAuthenticated || !authUser) {
    return null;
  }

  // Renderowanie głównego komponentu
  return (
    <div className="py-6 md:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Nagłówek */}
      <div className="mb-6 md:mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Witaj,{" "}
            {state.user?.firstName ||
              state.user?.userName ||
              authUser.firstName ||
              authUser.userName}
            !
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Twój panel postępów w nauce algorytmów i struktur danych.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchDashboardData}
          disabled={state.isRefreshing}
          aria-label="Odśwież dane"
          className="flex-shrink-0 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${
              state.isRefreshing ? "animate-spin" : ""
            }`}
          />
          {state.isRefreshing ? "Odświeżanie..." : "Odśwież"}
        </Button>
      </div>

      {/* Komunikat o błędzie */}
      {state.error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Błąd</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Główna siatka */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8 lg:mb-10">
        {/* Lewa kolumna */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          <ProgressCard
            stats={state.stats}
            user={state.user}
            overallProgress={state.overallProgress}
            isLoading={state.isLoading}
            isRefreshing={state.isRefreshing}
            recommendedPath={
              (state.learningPaths.find(
                (p) =>
                  (p.progress > 0 &&
                    p.progress < 100 &&
                    p.icon &&
                    typeof p.icon !== "string") ||
                  false
              ) as (typeof state.learningPaths)[number] | undefined) ||
              (state.learningPaths.find(
                (p) => p.progress === 0 && p.icon && typeof p.icon !== "string"
              ) as (typeof state.learningPaths)[number] | undefined)
            }
          />

          <ModuleTabs
            learningPaths={state.learningPaths}
            isLoading={state.isLoading}
          />
        </div>

        {/* Prawa kolumna */}
        <div className="lg:col-span-1 space-y-6 lg:space-y-8">
          <DailyStreakCard
            streak={state.streak}
            dailyGoalCompleted={state.dailyGoalCompleted}
            isLoading={state.isLoading}
            isRefreshing={state.isRefreshing}
          />

          <ActivityCard
            activities={state.recentActivity}
            isLoading={state.isLoading}
            isRefreshing={state.isRefreshing}
          />
        </div>
      </div>
    </div>
  );
}
