"use client";

import { useRouter } from "next/navigation";
import { JSX, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  Lightbulb,
  Clock,
  Star,
  Flame,
  TrendingUp,
  BookOpen,
  Medal,
  ArrowRight,
  Activity,
  RefreshCw,
  CheckCircle,
  BarChart3,
  CalendarClock,
} from "lucide-react";
import { useAuthStore } from "@/app/store/authStore";
import { Module, UserStats, LearningPath, User } from "@/app/types"; // Dodano User
import { apiService } from "@/app/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// Typy i Enumy (bez zmian)
type UserActivity = {
  id: number | string;
  userId: string;
  actionType: number;
  actionTime: string;
  referenceId?: string;
  additionalInfo?: string;
};
enum UserActionType {
  LessonCompleted = 0,
  QuizCompleted = 1,
  Login = 2,
}
const actionTypeMap: Record<number, { icon: JSX.Element; label: string }> = {
  [UserActionType.LessonCompleted]: {
    icon: <BookOpen className="h-5 w-5 text-green-500 dark:text-green-400" />,
    label: "Ukończono lekcję",
  },
  [UserActionType.QuizCompleted]: {
    icon: <Medal className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />,
    label: "Ukończono quiz",
  },
  [UserActionType.Login]: {
    icon: <TrendingUp className="h-5 w-5 text-blue-500 dark:text-blue-400" />,
    label: "Logowanie",
  },
};
function toDateStringUTC(date: Date) {
  return (
    date.getUTCFullYear() +
    "-" +
    String(date.getUTCMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getUTCDate()).padStart(2, "0")
  );
}

// GŁÓWNY KOMPONENT DASHBOARD
export default function DashboardPage() {
  const {
    isAuthenticated,
    user: authUser,
    isLoading: authLoading,
  } = useAuthStore(); // Zmieniono user na authUser, aby uniknąć konfliktu
  const router = useRouter();

  // Stany
  const [modules, setModules] = useState<Module[]>([]);
  const [displayUser, setDisplayUser] = useState<User | null>(authUser); // Stan dla danych użytkownika z /Auth/user
  const [stats, setStats] = useState<UserStats | null>(null); // Stan dla danych z /stats
  const [dataLoading, setDataLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [dailyGoalCompleted, setDailyGoalCompleted] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  // Sprawdź autentykację
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, authLoading, router]);

  // Funkcja pobierająca postęp modułu (bez zmian)
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

  // === NOWA FUNKCJA POBIERANIA DANYCH ===
  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated || !authUser) return; // Używamy authUser ze store do warunku

    setIsRefreshing(true);
    setError(null);

    try {
      // Pobieramy WSZYSTKIE potrzebne dane równolegle
      const [
        userDataResponse, // NOWE: Pobieramy dane z /Auth/user
        modulesResponse,
        statsResponse,
        streakResponse,
        historyResponse,
      ] = await Promise.all([
        apiService.get<User>("Auth/user"), // Endpoint używany przez Navbar
        apiService.lessons.getAllModules(),
        apiService.user.getStats(),
        apiService.user.getStreak(),
        apiService.user.getActivityHistory
          ? apiService.user.getActivityHistory()
          : Promise.resolve([]),
      ]);

      // 1. Ustawiamy dane użytkownika (źródło prawdy dla poziomu/XP)
      const fetchedUser = userDataResponse as User;
      setDisplayUser(fetchedUser); // Ustawiamy aktualne dane użytkownika

      // 2. Ustawiamy statystyki (inne niż poziom/XP)
      const statsData = statsResponse as UserStats;
      setStats(statsData); // Ustawiamy statystyki z /stats

      // 3. Przetwarzamy resztę danych jak wcześniej
      const modulesData = modulesResponse as Module[];
      setModules(modulesData);

      const streakData = streakResponse as { streak: number };
      setStreak(streakData.streak || 0);

      let todayDateString = toDateStringUTC(new Date());
      let goalDone = false;
      if (Array.isArray(historyResponse)) {
        goalDone = historyResponse.some(
          (a: UserActivity) =>
            a.actionType === UserActionType.LessonCompleted &&
            toDateStringUTC(new Date(a.actionTime)) === todayDateString
        );
      }
      setDailyGoalCompleted(goalDone);

      if (Array.isArray(historyResponse)) {
        setRecentActivity(
          historyResponse.slice(0, 7).map((a: UserActivity, idx: number) => {
            // Ograniczono do 7
            const map = actionTypeMap[a.actionType] || {
              icon: <Clock className="h-5 w-5 text-gray-400" />,
              label: `Aktywność`,
            };
            let description = "";
            if (a.actionType === UserActionType.LessonCompleted)
              description = `Ukończono lekcję: ${a.referenceId || "?"}`;
            else if (a.actionType === UserActionType.QuizCompleted)
              description = `Ukończono quiz: ${a.referenceId || "?"}`;
            else if (a.actionType === UserActionType.Login)
              description = "Logowanie do systemu";
            else description = a.additionalInfo || "";
            return {
              id: a.id ?? idx,
              type: a.actionType,
              title: map.label,
              description,
              date: new Date(a.actionTime).toLocaleDateString("pl-PL"),
              icon: map.icon,
            };
          })
        );
      } else {
        setRecentActivity([]);
      }

      // Całkowity postęp (używamy danych ze statsData)
      if (statsData) {
        const totalProgress =
          statsData.totalLessonsCount > 0
            ? Math.min(
                100,
                Math.round(
                  (statsData.completedLessonsCount /
                    statsData.totalLessonsCount) *
                    100
                )
              )
            : 0;
        setOverallProgress(totalProgress);
      }

      // Przetwarzanie ścieżek nauki (bez zmian w logice, tylko użycie modulesData)
      const sortedModules = [...modulesData].sort((a, b) => a.order - b.order);
      const moduleProgressPromises = sortedModules.map(async (module) => {
        const progress = await fetchModuleProgress(module.externalId);
        const completionPercentage =
          progress.totalLessons > 0
            ? Math.min(
                100,
                Math.round(
                  (progress.completedLessons / progress.totalLessons) * 100
                )
              )
            : 0;
        return {
          id: module.externalId,
          title: module.title,
          description: module.description,
          icon: module.icon || "📚",
          iconColor: module.iconColor || "#4F46E5",
          progress: completionPercentage,
          completedLessons: progress.completedLessons,
          totalLessons: progress.totalLessons || module.lessons?.length || 0,
        } as LearningPath;
      });
      const processedModules = await Promise.all(moduleProgressPromises);
      const sortedPaths = processedModules.sort((a, b) => {
        /* sortowanie bez zmian */
        if (
          a.progress > 0 &&
          a.progress < 100 &&
          (b.progress === 0 || b.progress === 100)
        )
          return -1;
        if (
          b.progress > 0 &&
          b.progress < 100 &&
          (a.progress === 0 || a.progress === 100)
        )
          return 1;
        if (a.progress === 0 && b.progress !== 0) return -1; // Nierozpoczęte przed rozpoczętymi/ukończonymi
        if (b.progress === 0 && a.progress !== 0) return 1;
        return b.progress - a.progress; // Ukończone na końcu
      });
      setLearningPaths(sortedPaths);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Nie udało się pobrać danych. Spróbuj odświeżyć stronę.");
    } finally {
      setDataLoading(false);
      setIsRefreshing(false);
    }
  }, [isAuthenticated, authUser, fetchModuleProgress]); // Zależność od authUser

  // Efekty (bez zmian, używają nowej funkcji fetch)
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  useEffect(() => {
    const handleTaskCompleted = () => {
      console.log("Dashboard: taskCompleted! Odświeżam...");
      fetchDashboardData();
    };
    window.addEventListener("taskCompleted", handleTaskCompleted);
    return () =>
      window.removeEventListener("taskCompleted", handleTaskCompleted);
  }, [fetchDashboardData]);

  // Stany ładowania i błędy (bez zmian)
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }
  if (!isAuthenticated || !authUser) {
    return null;
  } // Używamy authUser

  // === PRZYGOTOWANIE DANYCH DO WYŚWIETLENIA ===
  // Używamy displayUser jako głównego źródła dla poziomu/XP
  const currentLevel = displayUser?.level ?? 1;
  const currentXp = displayUser?.experiencePoints ?? 0;
  // Pozostałe statystyki bierzemy ze stanu `stats`
  const completedLessons = stats?.completedLessonsCount ?? 0;
  const totalLessons = stats?.totalLessonsCount ?? 0;

  const loadingPaths: LearningPath[] = Array(3)
    .fill(0)
    .map((_, index) => ({
      id: `loading-${index}`,
      title: "Ładowanie...",
      description: "Ładowanie danych...",
      progress: 0,
      completedLessons: 0,
      totalLessons: 0,
      icon: "⏳",
      iconColor: "#9CA3AF",
    }));
  const pathsToDisplay = dataLoading ? loadingPaths : learningPaths;
  const inProgressPaths = pathsToDisplay.filter(
    (path) => path.progress > 0 && path.progress < 100
  );
  const notStartedPaths = pathsToDisplay.filter((path) => path.progress === 0);
  const completedPaths = pathsToDisplay.filter((path) => path.progress === 100);
  const recommendedPath = inProgressPaths[0] || notStartedPaths[0];

  // === RENDEROWANIE ===
  return (
    <div className="py-6 md:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Nagłówek */}
      <div className="mb-6 md:mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Witaj, {displayUser?.firstName || displayUser?.userName}!{" "}
            {/* Używamy displayUser */}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Twój panel postępów w nauce algorytmów i struktur danych.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchDashboardData}
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

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Błąd</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Główna siatka */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8 lg:mb-10">
        {/* Lewa kolumna (większa) */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          {/* Karta postępów ogólnych */}
          <Card className="shadow-sm hover:shadow-md transition-shadow border dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BarChart3 className="text-indigo-500" /> Postęp nauki
              </CardTitle>
              <CardDescription>
                Całkowity postęp i kluczowe wskaźniki
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Całkowity postęp */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">
                    Całkowity postęp
                  </h3>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {overallProgress}%
                  </span>
                </div>
                <Progress
                  value={overallProgress}
                  className="h-2 bg-gray-200 dark:bg-gray-700 [&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:to-blue-500"
                  aria-label={`Całkowity postęp: ${overallProgress}%`}
                />
              </div>
              {/* Statystyki szczegółowe */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Poziom */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-4 rounded-xl flex items-center gap-3 border border-blue-100 dark:border-blue-900 transition-transform hover:scale-[1.02]">
                  <div className="bg-gradient-to-br from-blue-400 to-indigo-500 p-2 rounded-lg shadow-inner text-white">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Poziom
                    </div>
                    {dataLoading || isRefreshing ? (
                      <Skeleton className="h-6 w-10 mt-0.5" />
                    ) : (
                      <div className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        {currentLevel}
                      </div>
                    )}
                  </div>
                </div>
                {/* Doświadczenie */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 p-4 rounded-xl flex items-center gap-3 border border-green-100 dark:border-green-900 transition-transform hover:scale-[1.02]">
                  <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-2 rounded-lg shadow-inner text-white">
                    <Lightbulb className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      XP
                    </div>
                    {dataLoading || isRefreshing ? (
                      <Skeleton className="h-6 w-16 mt-0.5" />
                    ) : (
                      <div className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        {currentXp}
                      </div>
                    )}
                  </div>
                </div>
                {/* Ukończone lekcje */}
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 p-4 rounded-xl flex items-center gap-3 border border-yellow-100 dark:border-yellow-900 transition-transform hover:scale-[1.02]">
                  <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-2 rounded-lg shadow-inner text-white">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Lekcje
                    </div>
                    {dataLoading || isRefreshing ? (
                      <Skeleton className="h-6 w-14 mt-0.5" />
                    ) : (
                      <div className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        {completedLessons}/{totalLessons}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            {/* Rekomendacja */}
            {recommendedPath && !dataLoading && (
              <CardFooter className="pt-0">
                <div className="w-full bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 p-4 rounded-lg border dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-base">
                      Rekomendowane dla Ciebie
                    </h3>
                    <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full">
                      {recommendedPath.progress > 0
                        ? "Kontynuuj naukę"
                        : "Rozpocznij nowy moduł"}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 shadow"
                      style={{
                        backgroundColor: recommendedPath.iconColor || "#6366F1",
                      }}
                    >
                      <span className="text-2xl text-white">
                        {recommendedPath.icon || "💡"}
                      </span>
                    </div>
                    <div className="flex-grow w-full sm:w-auto">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {recommendedPath.title}
                      </h4>
                      <Progress
                        value={recommendedPath.progress}
                        className="h-1.5 mt-1 bg-gray-200 dark:bg-gray-600 [&>div]:bg-indigo-500"
                        aria-label={`Postęp: ${recommendedPath.progress}%`}
                      />
                    </div>
                    <Link
                      href={`/learning/${recommendedPath.id}`}
                      className="w-full sm:w-auto mt-2 sm:mt-0"
                    >
                      <Button
                        size="sm"
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
                      >
                        {recommendedPath.progress > 0
                          ? "Kontynuuj"
                          : "Rozpocznij"}{" "}
                        <ArrowRight className="h-4 w-4 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardFooter>
            )}
          </Card>

          {/* Zakładki z ścieżkami nauki */}
          <Tabs defaultValue="in-progress">
            <TabsList className="grid grid-cols-3 w-full sm:w-auto sm:inline-grid mb-4 h-auto sm:h-10 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <TabsTrigger
                value="in-progress"
                className="relative px-2 py-1.5 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-md"
              >
                W trakcie
                {inProgressPaths.length > 0 && !dataLoading && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-[10px] bg-indigo-500 text-white rounded-full">
                    {inProgressPaths.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="not-started"
                className="px-2 py-1.5 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-md"
              >
                Do rozpoczęcia
                {notStartedPaths.length > 0 && !dataLoading && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-[10px] bg-gray-400 text-white rounded-full">
                    {notStartedPaths.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="px-2 py-1.5 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-md"
              >
                Ukończone
                {completedPaths.length > 0 && !dataLoading && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-[10px] bg-green-500 text-white rounded-full">
                    {completedPaths.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            <div className="min-h-[250px]">
              {" "}
              {/* Minimalna wysokość dla zawartości zakładek */}
              {dataLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  <Skeleton className="h-56 w-full rounded-lg" />
                  <Skeleton className="h-56 w-full rounded-lg sm:hidden lg:block" />{" "}
                  {/* Pokazuj drugi szkielet na lg */}
                </div>
              )}
              {!dataLoading && (
                <>
                  <TabsContent value="in-progress">
                    {inProgressPaths.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {inProgressPaths.map((path) => (
                          <Card
                            key={path.id}
                            className="shadow-sm hover:shadow-md transition-shadow border dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col"
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{
                                    backgroundColor:
                                      path.iconColor || "#6366F1",
                                  }}
                                >
                                  <span className="text-xl text-white">
                                    {path.icon || "📚"}
                                  </span>
                                </div>
                                <div>
                                  <CardTitle className="text-base font-semibold">
                                    {path.title}
                                  </CardTitle>
                                  <CardDescription className="text-xs">
                                    {path.progress}% ukończono
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pb-4 pt-0 flex-grow">
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                                {path.description}
                              </p>
                              <Progress
                                value={path.progress}
                                className="h-1.5 mb-1 bg-gray-200 dark:bg-gray-700 [&>div]:bg-indigo-500"
                                aria-label={`Postęp: ${path.progress}%`}
                              />
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {path.completedLessons}/{path.totalLessons}{" "}
                                lekcji
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Link
                                href={`/learning/${path.id}`}
                                className="w-full"
                              >
                                <Button
                                  size="sm"
                                  className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
                                >
                                  Kontynuuj
                                </Button>
                              </Link>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                        <BookOpen className="mx-auto h-10 w-10 text-gray-400" />
                        <p className="mt-3 text-gray-600 dark:text-gray-400">
                          Brak modułów w trakcie.
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          Rozpocznij nową ścieżkę!
                        </p>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="not-started">
                    {notStartedPaths.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {notStartedPaths.map((path) => (
                          <Card
                            key={path.id}
                            className="shadow-sm hover:shadow-md transition-shadow border dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col"
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{
                                    backgroundColor:
                                      path.iconColor || "#6366F1",
                                  }}
                                >
                                  <span className="text-xl text-white">
                                    {path.icon || "📚"}
                                  </span>
                                </div>
                                <CardTitle className="text-base font-semibold">
                                  {path.title}
                                </CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent className="pb-4 flex-grow">
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                {path.description}
                              </p>
                            </CardContent>
                            <CardFooter>
                              <Link
                                href={`/learning/${path.id}`}
                                className="w-full"
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                >
                                  Rozpocznij
                                </Button>
                              </Link>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                        <Star className="mx-auto h-10 w-10 text-gray-400" />
                        <p className="mt-3 text-gray-600 dark:text-gray-400">
                          Wszystkie moduły rozpoczęte.
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          Świetnie!
                        </p>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="completed">
                    {completedPaths.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {completedPaths.map((path) => (
                          <Card
                            key={path.id}
                            className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30 shadow-sm hover:shadow-md transition-shadow flex flex-col opacity-80 hover:opacity-100"
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow">
                                  <CheckCircle className="h-6 w-6" />
                                </div>
                                <div>
                                  <CardTitle className="text-base font-semibold">
                                    {path.title}
                                  </CardTitle>
                                  <CardDescription className="text-green-700 dark:text-green-400 font-medium text-xs">
                                    Ukończono
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pb-4 flex-grow">
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                {path.description}
                              </p>
                              <div className="text-xs text-green-600 dark:text-green-300 font-medium">
                                {path.completedLessons}/{path.totalLessons}{" "}
                                lekcji
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Link
                                href={`/learning/${path.id}`}
                                className="w-full"
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  Powtórz
                                </Button>
                              </Link>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                        <Medal className="mx-auto h-10 w-10 text-gray-400" />
                        <p className="mt-3 text-gray-600 dark:text-gray-400">
                          Nie ukończono jeszcze modułów.
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          Kontynuuj naukę!
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </>
              )}
            </div>
          </Tabs>
        </div>

        {/* Prawa kolumna (mniejsza) */}
        <div className="lg:col-span-1 space-y-6 lg:space-y-8">
          {/* Karta codziennej aktywności */}
          <Card className="shadow-sm hover:shadow-md transition-shadow border dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarClock className="text-orange-500" /> Dzienna aktywność
              </CardTitle>
              <CardDescription>Twoja seria i dzienne cele</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Streak */}
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-orange-400 to-red-500 p-3 rounded-full shadow-lg text-white">
                  <Flame className="h-7 w-7" />
                </div>
                <div>
                  {dataLoading || isRefreshing ? (
                    <Skeleton className="h-8 w-12 mb-0.5" />
                  ) : (
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {streak}
                    </div>
                  )}
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Dni serii
                  </div>
                </div>
              </div>
              {/* Dzienny cel */}
              <div className="pt-1">
                <div className="flex justify-between items-center mb-1.5 text-sm">
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">
                    Dzienny cel
                  </h3>
                  <span
                    className={`font-medium text-xs px-2 py-0.5 rounded-full ${
                      dailyGoalCompleted
                        ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {dailyGoalCompleted ? "Osiągnięty" : "Do zrobienia"}
                  </span>
                </div>
                <Progress
                  value={dailyGoalCompleted ? 100 : 0}
                  className="h-1.5 bg-gray-200 dark:bg-gray-700 [&>div]:bg-green-500"
                  aria-label={`Dzienny cel: ${
                    dailyGoalCompleted ? "Osiągnięty" : "Do zrobienia"
                  }`}
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                  {dailyGoalCompleted
                    ? "Gratulacje!"
                    : "Ukończ lekcję, aby zaliczyć cel."}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ostatnia aktywność */}
          <Card className="shadow-sm hover:shadow-md transition-shadow border dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="text-teal-500" /> Ostatnia aktywność
              </CardTitle>
              <CardDescription>Twoje najnowsze działania</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5 max-h-96 overflow-y-auto pr-1 -mr-1">
                {" "}
                {/* Scroll */}
                {(dataLoading || isRefreshing) &&
                  !recentActivity.length &&
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
                      <div className="space-y-1.5 flex-grow">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                {!dataLoading && !isRefreshing && recentActivity.length > 0 && (
                  <ul className="-mb-5">
                    {recentActivity.map((activity, activityIdx) => (
                      <li key={activity.id} className="relative pb-5">
                        {activityIdx !== recentActivity.length - 1 && (
                          <span
                            className="absolute left-4.5 top-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex items-start space-x-3">
                          <div className="relative">
                            <span className="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center ring-2 ring-white dark:ring-gray-800">
                              {activity.icon || (
                                <Clock className="h-5 w-5 text-gray-400" />
                              )}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-0.5">
                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-medium text-gray-800 dark:text-gray-100 mr-1">
                                {activity.title}
                              </span>
                              <span className="whitespace-nowrap float-right text-xs">
                                {activity.date}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                              {activity.description}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {!dataLoading &&
                  !isRefreshing &&
                  recentActivity.length === 0 && (
                    <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
                      Brak aktywności.
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
