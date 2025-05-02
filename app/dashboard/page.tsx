"use client";

import { useRouter } from "next/navigation";
import { JSX, useEffect, useState, useCallback } from "react"; // Dodano useCallback
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
  Target,
  BookOpen,
  Medal,
  ArrowRight,
  Activity, // Dodano Activity dla sekcji
  RefreshCw, // Ikona do odświeżania
} from "lucide-react";
import { useAuthStore } from "@/app/store/authStore";
import { Module, UserStats, LearningPath } from "@/app/types"; // Upewnij się, że typy są poprawne
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
    icon: <BookOpen className="h-5 w-5 text-green-600" />,
    label: "Ukończono lekcję",
  },
  [UserActionType.QuizCompleted]: {
    icon: <Medal className="h-5 w-5 text-yellow-600" />,
    label: "Ukończono quiz",
  },
  [UserActionType.Login]: {
    icon: <TrendingUp className="h-5 w-5 text-blue-600" />,
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
  const { isAuthenticated, user, isLoading: authLoading } = useAuthStore();
  const router = useRouter();

  // Stany
  const [modules, setModules] = useState<Module[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // Stan dla ręcznego odświeżania
  const [error, setError] = useState<string | null>(null);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [dailyGoalCompleted, setDailyGoalCompleted] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  // Sprawdź autentykację
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Funkcja pobierająca postęp dla modułu
  const fetchModuleProgress = useCallback(async (moduleId: string) => {
    try {
      const moduleProgress = await apiService.lessons.getModuleProgress(
        moduleId
      );
      return moduleProgress as {
        completedLessons: number;
        totalLessons: number;
      }; // Dodano asercję typu
    } catch (error) {
      console.error(`Error fetching progress for module ${moduleId}:`, error);
      return { completedLessons: 0, totalLessons: 0 };
    }
  }, []); // Pusta tablica zależności, bo apiService jest stałe

  // Funkcja do pobierania i przetwarzania danych Dashboardu
  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated || !user) return; // Sprawdź czy user istnieje

    setIsRefreshing(true); // Pokaż stan ładowania/odświeżania
    setError(null); // Resetuj błąd

    try {
      const [modulesResponse, statsResponse, streakResponse, historyResponse] =
        await Promise.all([
          apiService.lessons.getAllModules(),
          apiService.user.getStats(),
          apiService.user.getStreak(),
          apiService.user.getActivityHistory
            ? apiService.user.getActivityHistory()
            : Promise.resolve([]),
        ]);

      const modulesData = modulesResponse as Module[];
      setModules(modulesData);

      const statsData = statsResponse as UserStats;
      setStats(statsData); // Zaktualizuj statystyki

      const streakData = streakResponse as { streak: number };
      setStreak(streakData.streak || 0);

      // Dzienny cel
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

      // Ostatnia aktywność
      if (Array.isArray(historyResponse)) {
        setRecentActivity(
          historyResponse.slice(0, 10).map((a: UserActivity, idx: number) => {
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
              date: new Date(a.actionTime).toLocaleDateString(),
              icon: map.icon,
            };
          })
        );
      } else {
        setRecentActivity([]);
      }

      // Całkowity postęp
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

      // Przetwarzanie ścieżek nauki
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
        if (a.progress === 0 && b.progress === 100) return -1;
        if (b.progress === 0 && a.progress === 100) return 1;
        return b.progress - a.progress; // Sortowanie od nieukończonych do ukończonych
      });
      setLearningPaths(sortedPaths);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Nie udało się pobrać danych. Spróbuj odświeżyć stronę.");
      // Można zostawić fallback data, jeśli jest potrzebne
    } finally {
      setDataLoading(false); // Zakończ główny stan ładowania
      setIsRefreshing(false); // Zakończ stan odświeżania
    }
  }, [isAuthenticated, user, fetchModuleProgress]); // Dodano fetchModuleProgress do zależności

  // Efekt do pobrania danych przy pierwszym ładowaniu
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]); // Zależność od funkcji fetch

  // NOWY EFEKT: Nasłuchiwanie na zdarzenie 'taskCompleted'
  useEffect(() => {
    const handleTaskCompleted = () => {
      console.log(
        "Dashboard: Zdarzenie taskCompleted odebrane! Odświeżam dane..."
      );
      fetchDashboardData(); // Wywołaj funkcję pobierającą dane
    };
    window.addEventListener("taskCompleted", handleTaskCompleted);
    return () =>
      window.removeEventListener("taskCompleted", handleTaskCompleted);
  }, [fetchDashboardData]); // Zależność od funkcji fetch

  // Stany ładowania i błędy (bez zmian)
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Skeleton className="h-10 w-40" />
      </div>
    );
  }
  if (!isAuthenticated || !user) {
    return null;
  }

  // Przygotowanie danych do wyświetlenia (bez zmian)
  const loadingPaths: LearningPath[] = Array(3)
    .fill(0)
    .map((_, index) => ({
      id: `loading-${index}`,
      title: "Ładowanie...",
      description: "Ładowanie danych...",
      progress: 0,
      completedLessons: 0,
      totalLessons: 0,
      icon: "",
      iconColor: "",
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
      {/* Nagłówek z przyciskiem odświeżania */}
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Witaj, {user.firstName || user.userName}!
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Oto Twój dashboard nauki. Kontynuuj swoją podróż!
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchDashboardData}
          disabled={isRefreshing}
          aria-label="Odśwież dane dashboardu"
          className="flex-shrink-0"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Odświeżanie..." : "Odśwież"}
        </Button>
      </div>

      {/* Komunikat o błędzie */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Błąd</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Sekcja z kartami - poprawiona responsywność */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Karta postępów ogólnych - zajmuje więcej miejsca na LG */}
        <Card className="lg:col-span-8 shadow-sm hover:shadow-md transition-shadow border dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg sm:text-xl">
              Twój postęp nauki
            </CardTitle>
            <CardDescription>
              Całkowity postęp we wszystkich modułach
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <h3 className="font-medium text-gray-700 dark:text-gray-300">
                  Całkowity postęp
                </h3>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {overallProgress}%
                </span>
              </div>
              <Progress
                value={overallProgress}
                className="h-2"
                aria-label={`Całkowity postęp: ${overallProgress}%`}
              />

              {/* Statystyki szczegółowe - responsywne */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                {/* Poziom */}
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg flex items-center gap-3 border border-blue-100 dark:border-blue-900">
                  <div className="bg-blue-100 dark:bg-blue-800/50 p-2 sm:p-3 rounded-full">
                    <Star className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Poziom
                    </div>
                    {dataLoading || isRefreshing ? (
                      <Skeleton className="h-6 w-10 mt-1" />
                    ) : (
                      <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {stats?.level ?? user.level ?? 1}
                      </div>
                    )}
                  </div>
                </div>
                {/* Doświadczenie */}
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg flex items-center gap-3 border border-green-100 dark:border-green-900">
                  <div className="bg-green-100 dark:bg-green-800/50 p-2 sm:p-3 rounded-full">
                    <Lightbulb className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Doświadczenie
                    </div>
                    {dataLoading || isRefreshing ? (
                      <Skeleton className="h-6 w-16 mt-1" />
                    ) : (
                      <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                        {stats?.totalXp ?? user.experiencePoints ?? 0} XP
                      </div>
                    )}
                  </div>
                </div>
                {/* Ukończone lekcje */}
                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg flex items-center gap-3 border border-yellow-100 dark:border-yellow-900">
                  <div className="bg-yellow-100 dark:bg-yellow-800/50 p-2 sm:p-3 rounded-full">
                    <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Ukończone lekcje
                    </div>
                    {dataLoading || isRefreshing ? (
                      <Skeleton className="h-6 w-14 mt-1" />
                    ) : (
                      <div className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {stats?.completedLessonsCount ?? 0}/
                        {stats?.totalLessonsCount ?? 0}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          {/* Rekomendacja - poprawiona responsywność */}
          {recommendedPath && !dataLoading && (
            <CardFooter className="pt-0">
              <div className="w-full bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border dark:border-gray-700">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">
                    Rekomendowane dla Ciebie
                  </h3>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                    {recommendedPath.progress > 0
                      ? "Kontynuuj naukę"
                      : "Rozpocznij nowy moduł"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: recommendedPath.iconColor || "#4F46E5",
                    }}
                  >
                    <span className="text-xl text-white">
                      {recommendedPath.icon || "📚"}
                    </span>
                  </div>
                  <div className="flex-grow w-full sm:w-auto">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {recommendedPath.title}
                    </h4>
                    <Progress
                      value={recommendedPath.progress}
                      className="h-1.5 mt-1"
                      aria-label={`Postęp w module ${recommendedPath.title}: ${recommendedPath.progress}%`}
                    />
                  </div>
                  <Link
                    href={`/learning/${recommendedPath.id}`}
                    className="w-full sm:w-auto mt-2 sm:mt-0"
                  >
                    <Button
                      size="sm"
                      className="w-full sm:w-auto flex items-center gap-1"
                    >
                      {recommendedPath.progress > 0
                        ? "Kontynuuj"
                        : "Rozpocznij"}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardFooter>
          )}
        </Card>

        {/* Karta codziennej aktywności - zajmuje mniej miejsca na LG */}
        <Card className="lg:col-span-4 shadow-sm hover:shadow-md transition-shadow border dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Dzienna aktywność
            </CardTitle>
            <CardDescription>Twoja seria i dzienne cele</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Streak */}
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 dark:bg-orange-800/50 p-3 sm:p-4 rounded-full">
                <Flame className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 dark:text-orange-400" />
              </div>
              <div>
                {dataLoading || isRefreshing ? (
                  <Skeleton className="h-8 w-12 mb-1" />
                ) : (
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {streak}
                  </div>
                )}
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Dni z rzędu
                </div>
              </div>
            </div>
            {/* Dzienny cel */}
            <div className="pt-2">
              <div className="flex justify-between items-center mb-2 text-sm">
                <h3 className="font-medium text-gray-700 dark:text-gray-300">
                  Dzienny cel
                </h3>
                <span
                  className={`font-medium ${
                    dailyGoalCompleted
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {dailyGoalCompleted ? "Osiągnięty" : "Nieosiągnięty"}
                </span>
              </div>
              <Progress
                value={dailyGoalCompleted ? 100 : 0}
                className="h-2"
                aria-label={`Dzienny cel: ${
                  dailyGoalCompleted ? "Osiągnięty" : "Nieosiągnięty"
                }`}
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {dailyGoalCompleted
                  ? "Gratulacje! Cel na dziś zrealizowany."
                  : "Ukończ lekcję, aby osiągnąć cel."}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zakładki z ścieżkami nauki - responsywne */}
      <Tabs defaultValue="in-progress" className="mb-8">
        {/* TabsList z lepszą responsywnością */}
        <TabsList className="grid grid-cols-3 w-full sm:w-auto sm:inline-grid mb-4 h-auto sm:h-10">
          <TabsTrigger
            value="in-progress"
            className="relative px-2 py-1.5 sm:px-4 sm:py-2 h-full"
          >
            Kontynuuj
            {inProgressPaths.length > 0 && !dataLoading && (
              <span className="hidden sm:inline-block ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-1.5 py-0.5 rounded-full">
                {inProgressPaths.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="not-started"
            className="px-2 py-1.5 sm:px-4 sm:py-2 h-full"
          >
            Rozpocznij
            {notStartedPaths.length > 0 && !dataLoading && (
              <span className="hidden sm:inline-block ml-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-1.5 py-0.5 rounded-full">
                {notStartedPaths.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="px-2 py-1.5 sm:px-4 sm:py-2 h-full"
          >
            Ukończone
            {completedPaths.length > 0 && !dataLoading && (
              <span className="hidden sm:inline-block ml-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-1.5 py-0.5 rounded-full">
                {completedPaths.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Kontener zakładek */}
        <div className="min-h-[200px]">
          {/* Stan ładowania dla zakładek */}
          {dataLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          )}

          {/* Zakładka: Kontynuuj naukę */}
          {!dataLoading && (
            <TabsContent value="in-progress">
              {inProgressPaths.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {inProgressPaths.map((path) => (
                    <Card
                      key={path.id}
                      className="overflow-hidden border-l-4 shadow-sm hover:shadow-md transition-shadow dark:border-gray-700"
                      style={{ borderLeftColor: path.iconColor || "#4F46E5" }}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: path.iconColor || "#4F46E5",
                            }}
                          >
                            <span className="text-xl text-white">
                              {path.icon || "📚"}
                            </span>
                          </div>
                          <div>
                            <CardTitle className="text-base sm:text-lg">
                              {path.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-1 text-xs sm:text-sm">
                              {path.progress}% ukończono
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4 pt-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                          {path.description}
                        </p>
                        <Progress
                          value={path.progress}
                          className="h-1.5 mb-1"
                          aria-label={`Postęp: ${path.progress}%`}
                        />
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {path.completedLessons}/{path.totalLessons} lekcji
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Link href={`/learning/${path.id}`} className="w-full">
                          <Button className="w-full">Kontynuuj</Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Brak modułów w trakcie nauki.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Rozpocznij naukę jednego z dostępnych modułów!
                  </p>
                </div>
              )}
            </TabsContent>
          )}

          {/* Zakładka: Rozpocznij naukę */}
          {!dataLoading && (
            <TabsContent value="not-started">
              {notStartedPaths.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {notStartedPaths.map((path) => (
                    <Card
                      key={path.id}
                      className="shadow-sm hover:shadow-md transition-shadow border dark:border-gray-800 flex flex-col"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: path.iconColor || "#4F46E5",
                            }}
                          >
                            <span className="text-xl text-white">
                              {path.icon || "📚"}
                            </span>
                          </div>
                          <CardTitle className="text-base sm:text-lg">
                            {path.title}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4 flex-grow">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {path.description}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Link href={`/learning/${path.id}`} className="w-full">
                          <Button variant="outline" className="w-full">
                            Rozpocznij
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <Star className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Wszystkie dostępne moduły zostały rozpoczęte.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Świetna robota!
                  </p>
                </div>
              )}
            </TabsContent>
          )}

          {/* Zakładka: Ukończone */}
          {!dataLoading && (
            <TabsContent value="completed">
              {completedPaths.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedPaths.map((path) => (
                    <Card
                      key={path.id}
                      className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: path.iconColor || "#10B981",
                            }}
                          >
                            <span className="text-xl text-white">
                              {path.icon || "✅"}
                            </span>
                          </div>
                          <div>
                            <CardTitle className="text-base sm:text-lg">
                              {path.title}
                            </CardTitle>
                            <CardDescription className="text-green-700 dark:text-green-400 font-medium">
                              Ukończono
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4 flex-grow">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {path.description}
                        </p>
                        <div className="text-sm text-green-600 dark:text-green-300 font-medium">
                          {path.completedLessons}/{path.totalLessons} lekcji
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Link href={`/learning/${path.id}`} className="w-full">
                          <Button
                            variant="outline"
                            className="w-full bg-white dark:bg-gray-950"
                          >
                            Powtórz
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <Medal className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Nie ukończono jeszcze żadnego modułu.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Kontynuuj naukę, aby zdobywać osiągnięcia!
                  </p>
                </div>
              )}
            </TabsContent>
          )}
        </div>
      </Tabs>

      {/* Ostatnia aktywność - poprawiona responsywność */}
      <Card className="shadow-sm hover:shadow-md transition-shadow border dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Ostatnia aktywność
          </CardTitle>
          <CardDescription>
            Historia Twoich ostatnich działań na platformie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Stan ładowania aktywności */}
            {(dataLoading || isRefreshing) && !recentActivity.length && (
              <>
                <div className="flex gap-4 animate-pulse">
                  <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                  <div className="space-y-2 flex-grow">
                    <Skeleton className="h-5 w-3/5" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex gap-4 animate-pulse">
                  <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                  <div className="space-y-2 flex-grow">
                    <Skeleton className="h-5 w-2/5" />
                    <Skeleton className="h-4 w-3/5" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              </>
            )}
            {/* Wyświetlanie aktywności */}
            {!dataLoading && !isRefreshing && recentActivity.length > 0 && (
              <div className="flow-root">
                <ul className="-mb-8">
                  {recentActivity.map((activity, activityIdx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {activityIdx !== recentActivity.length - 1 ? (
                          <span
                            className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex items-start space-x-3">
                          <div className="relative">
                            <span className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center ring-4 ring-white dark:ring-gray-900">
                              {activity.icon || (
                                <Clock className="h-5 w-5 text-gray-400" />
                              )}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 py-1.5">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {activity.title}
                              </span>
                              <span className="whitespace-nowrap float-right">
                                {activity.date}
                              </span>
                            </div>
                            <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">
                              {activity.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Brak aktywności */}
            {!dataLoading && !isRefreshing && recentActivity.length === 0 && (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                Brak ostatnich aktywności do wyświetlenia.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
