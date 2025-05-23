"use client";

import { useDashboard } from "@/app/hooks/dashboard/useDashboard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { ActivityCard } from "../components/dashboard/activity";
import { ModuleTabs } from "../components/dashboard/learning";
import {
  DailyStreakCard,
  ProgressCard,
} from "../components/dashboard/progress";

export default function DashboardPage() {
  const {
    state,
    isLoadingAuth,
    isAuthenticated,
    authUser,
    handleRefresh,
    isRefreshing,
  } = useDashboard();

  // Globalny loader zajmuje się ładowaniem – nie renderuj tu lokalnego spinnera!

  // Nie zalogowany – przekierowanie obsługuje AuthProvider lub useDashboard
  if (!isAuthenticated || !authUser) return null;

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
          onClick={handleRefresh}
          disabled={isRefreshing}
          aria-label="Odśwież dane"
          className="flex-shrink-0 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Odświeżanie..." : "Odśwież"}
        </Button>
      </div>

      {/* Główna siatka */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8 lg:mb-10">
        {/* Lewa kolumna */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          <ProgressCard
            stats={state.stats}
            user={state.user}
            overallProgress={state.overallProgress}
            isLoading={state.isLoading}
            isRefreshing={isRefreshing}
            recommendedPath={state.recommendedPath}
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
            isRefreshing={isRefreshing}
          />
          <ActivityCard
            activities={state.recentActivity}
            isLoading={state.isLoading}
            isRefreshing={isRefreshing}
          />
        </div>
      </div>
    </div>
  );
}
