"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
} from "lucide-react";
import { useAuthStore } from "@/app/store/authStore";
import { Module, UserStats, LearningPath } from "@/app/types";
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

export default function DashboardPage() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuthStore();
  const router = useRouter();

  // Stany dla danych z API
  const [modules, setModules] = useState<Module[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);
  const [dailyGoalCompleted, setDailyGoalCompleted] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  // Sprawdź autentykację
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Funkcja pobierająca postęp dla pojedynczego modułu
  const fetchModuleProgress = async (moduleId: string) => {
    try {
      const moduleProgress = await apiService.lessons.getModuleProgress(
        moduleId
      );
      return moduleProgress;
    } catch (error) {
      console.error(`Error fetching progress for module ${moduleId}:`, error);
      return {
        completedLessons: 0,
        inProgressLessons: 0,
        totalLessons: 0,
      };
    }
  };

  // Pobierz dane z API jeśli użytkownik jest zalogowany
  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchDashboardData = async () => {
        try {
          setDataLoading(true);

          // Pobierz dane równolegle
          const [modulesResponse, statsResponse] = await Promise.all([
            apiService.lessons.getAllModules(),
            apiService.user.getStats(),
          ]);

          const modulesData = modulesResponse as Module[];
          setModules(modulesData);

          const statsData = statsResponse as UserStats;
          setStats(statsData);

          // Symulacja danych dla streak i postępu
          setStreak(Math.floor(Math.random() * 10) + 1); // Losowy streak 1-10
          setDailyGoalCompleted(Math.random() > 0.5); // Losowo czy cel dzienny jest zakończony

          // Oblicz całkowity postęp
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

          // Sortuj moduły według kolejności
          const sortedModules = [...modulesData].sort(
            (a, b) => a.order - b.order
          );

          // Pobierz postępy dla wszystkich modułów równolegle
          const moduleProgressPromises = sortedModules.map(async (module) => {
            const progress = await fetchModuleProgress(module.externalId);
            const completionPercentage =
              (progress as { totalLessons: number }).totalLessons > 0
                ? Math.min(
                    100,
                    Math.round(
                      ((
                        progress as {
                          completedLessons: number;
                          totalLessons: number;
                        }
                      ).completedLessons /
                        (
                          progress as {
                            completedLessons: number;
                            totalLessons: number;
                          }
                        ).totalLessons) *
                        100
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
              completedLessons: (progress as { completedLessons: number })
                .completedLessons,
              totalLessons:
                (progress as { totalLessons: number }).totalLessons ||
                module.lessons?.length ||
                0,
            } as LearningPath;
          });

          const processedModules = await Promise.all(moduleProgressPromises);

          // Sortuj ścieżki nauki - najpierw te w trakcie (nieukończone z postępem > 0), potem nierozpoczęte, na końcu ukończone
          const sortedPaths = processedModules.sort((a, b) => {
            // Najpierw te z postępem powyżej 0 ale poniżej 100
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

            // Następnie nierozpoczęte
            if (a.progress === 0 && b.progress === 100) return -1;
            if (b.progress === 0 && a.progress === 100) return 1;

            // Na końcu ukończone
            return b.progress - a.progress;
          });

          setLearningPaths(sortedPaths);

          // Ulepszona sekcja ostatniej aktywności z różnymi typami
          setRecentActivity([
            {
              id: 1,
              type: "lesson_complete",
              title: "Ukończono lekcję",
              description:
                sortedModules[0]?.lessons && sortedModules[0].lessons[0]
                  ? `Ukończono lekcję: ${sortedModules[0].lessons[0].title}`
                  : "Ukończono lekcję: Wprowadzenie do tablic",
              date: new Date().toLocaleDateString(),
              icon: <BookOpen className="h-5 w-5 text-green-600" />,
            },
            {
              id: 2,
              type: "level_up",
              title: "Awans na nowy poziom",
              description: `Osiągnięto poziom ${user.level}!`,
              date: new Date(
                new Date().setDate(new Date().getDate() - 1)
              ).toLocaleDateString(),
              icon: <TrendingUp className="h-5 w-5 text-purple-600" />,
            },
            {
              id: 3,
              type: "achievement",
              title: "Odblokowano osiągnięcie",
              description: "Osiągnięcie: Pierwszy krok",
              date: new Date(
                new Date().setDate(new Date().getDate() - 2)
              ).toLocaleDateString(),
              icon: <Medal className="h-5 w-5 text-yellow-600" />,
            },
            {
              id: 4,
              type: "join",
              title: "Dołączono do platformy",
              description: "Witamy w społeczności DSA Learning!",
              date: new Date(
                new Date().setDate(new Date().getDate() - 3)
              ).toLocaleDateString(),
              icon: <Target className="h-5 w-5 text-blue-600" />,
            },
          ]);
        } catch (err) {
          console.error("Error fetching dashboard data:", err);
          setError("Nie udało się pobrać danych. Spróbuj odświeżyć stronę.");

          // Ustaw domyślne dane w przypadku błędu
          setLearningPaths([
            {
              id: "data-structures",
              title: "Podstawy struktur danych",
              description:
                "Poznaj podstawowe struktury danych: tablice, listy, stosy i kolejki.",
              progress: 25,
              completedLessons: 1,
              totalLessons: 4,
              icon: "📚",
              iconColor: "#4F46E5",
            },
            {
              id: "sorting",
              title: "Algorytmy sortowania",
              description:
                "Poznaj popularne algorytmy sortowania i ich złożoność obliczeniową.",
              progress: 0,
              completedLessons: 0,
              totalLessons: 5,
              icon: "🔄",
              iconColor: "#10B981",
            },
          ]);
        } finally {
          setDataLoading(false);
        }
      };

      fetchDashboardData();
    }
  }, [isAuthenticated, user]);

  // W trakcie ładowania autoryzacji
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Ładowanie...</div>
      </div>
    );
  }

  // Gdy nie zalogowany, nie renderuj nic (przekierowanie zajmie się tym)
  if (!isAuthenticated || !user) {
    return null;
  }

  // Stan ładowania dla ścieżek nauki
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

  // Ścieżki do wyświetlenia (rzeczywiste lub stany ładowania)
  const pathsToDisplay = dataLoading ? loadingPaths : learningPaths;

  // Wykreowanie grup ścieżek nauki
  const inProgressPaths = pathsToDisplay.filter(
    (path) => path.progress > 0 && path.progress < 100
  );
  const notStartedPaths = pathsToDisplay.filter((path) => path.progress === 0);
  const completedPaths = pathsToDisplay.filter((path) => path.progress === 100);

  // Wybranie rekomendowanej ścieżki (pierwsza nieukończona z postępem)
  const recommendedPath = inProgressPaths[0] || notStartedPaths[0];

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Witaj, {user.firstName || user.userName}!
        </h1>
        <p className="mt-1 text-gray-600">
          Oto Twój dashboard nauki. Kontynuuj swoją podróż w świecie algorytmów
          i struktur danych.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Błąd</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Sekcja z kartami - nowy layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        {/* Karta postępów ogólnych */}
        <Card className="md:col-span-8">
          <CardHeader className="pb-2">
            <CardTitle>Twój postęp nauki</CardTitle>
            <CardDescription>
              Całkowity postęp we wszystkich modułach
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Całkowity postęp</h3>
                <span className="text-sm font-medium">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="bg-blue-50 p-4 rounded-lg flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <Star className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Poziom</div>
                    {dataLoading ? (
                      <Skeleton className="h-7 w-12 mt-1" />
                    ) : (
                      <div className="text-2xl font-bold text-blue-600">
                        {stats?.level || user.level || 1}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg flex items-center">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <Lightbulb className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Doświadczenie</div>
                    {dataLoading ? (
                      <Skeleton className="h-7 w-16 mt-1" />
                    ) : (
                      <div className="text-2xl font-bold text-green-600">
                        {stats?.totalXp || user.experiencePoints || 0} XP
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg flex items-center">
                  <div className="bg-yellow-100 p-3 rounded-full mr-4">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">
                      Ukończone lekcje
                    </div>
                    {dataLoading ? (
                      <Skeleton className="h-7 w-16 mt-1" />
                    ) : (
                      <div className="text-2xl font-bold text-yellow-600">
                        {stats?.completedLessonsCount || 0}/
                        {stats?.totalLessonsCount || 0}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          {recommendedPath && (
            <CardFooter className="pt-0">
              <div className="w-full bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Rekomendowane dla Ciebie</h3>
                  <span className="text-sm text-gray-500">
                    {recommendedPath.progress > 0 ? "Kontynuuj" : "Rozpocznij"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {!dataLoading && (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: recommendedPath.iconColor || "#4F46E5",
                      }}
                    >
                      <span className="text-xl text-white">
                        {recommendedPath.icon || "📚"}
                      </span>
                    </div>
                  )}
                  <div className="flex-grow">
                    <h4 className="font-medium">{recommendedPath.title}</h4>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${recommendedPath.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <Link href={`/learning/${recommendedPath.id}`}>
                    <Button size="sm" className="flex items-center gap-1">
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

        {/* Karta codziennej aktywności */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Dzienna aktywność</CardTitle>
            <CardDescription>Twoja seria i dzienne cele</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-4 rounded-full">
                <Flame className="h-8 w-8 text-orange-500" />
              </div>
              <div>
                <div className="text-3xl font-bold">{streak}</div>
                <div className="text-sm text-gray-500">Dni z rzędu</div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Dzienny cel</h3>
                <span className="text-xs font-medium text-gray-500">
                  {dailyGoalCompleted ? "100%" : "0%"}
                </span>
              </div>
              <div className="bg-gray-200 h-2 rounded-full">
                <div
                  className={`h-2 rounded-full ${
                    dailyGoalCompleted ? "bg-green-500" : "bg-gray-300"
                  }`}
                  style={{ width: dailyGoalCompleted ? "100%" : "0%" }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {dailyGoalCompleted
                  ? "Gratulacje! Cel na dziś został osiągnięty."
                  : "Ukończ przynajmniej jedną lekcję, aby zrealizować dzienny cel."}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zakładki z ścieżkami nauki */}
      <Tabs defaultValue="in-progress" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="in-progress" className="relative">
            Kontynuuj naukę
            {inProgressPaths.length > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                {inProgressPaths.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="not-started">
            Rozpocznij naukę
            {notStartedPaths.length > 0 && (
              <span className="ml-2 bg-gray-100 text-gray-800 text-xs px-1.5 py-0.5 rounded-full">
                {notStartedPaths.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">
            Ukończone
            {completedPaths.length > 0 && (
              <span className="ml-2 bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full">
                {completedPaths.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress">
          {inProgressPaths.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inProgressPaths.map((path, index) => (
                <Card
                  key={path.id || index}
                  className="overflow-hidden border-l-4"
                  style={{ borderLeftColor: path.iconColor || "#4F46E5" }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      {!dataLoading && (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: path.iconColor || "#4F46E5",
                          }}
                        >
                          <span className="text-xl text-white">
                            {path.icon || "📚"}
                          </span>
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{path.title}</CardTitle>
                        <CardDescription className="line-clamp-1">
                          {path.progress}% ukończono
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {path.description}
                    </p>
                    <div className="w-full bg-gray-100 h-2 rounded-full mb-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${path.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
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
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Brak modułów w trakcie nauki.</p>
              <p className="text-sm text-gray-400 mt-2">
                Rozpocznij naukę jednego z dostępnych modułów!
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="not-started">
          {notStartedPaths.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notStartedPaths.map((path, index) => (
                <Card key={path.id || index}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      {!dataLoading && (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: path.iconColor || "#4F46E5",
                          }}
                        >
                          <span className="text-xl text-white">
                            {path.icon || "📚"}
                          </span>
                        </div>
                      )}
                      <CardTitle className="text-lg">{path.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-sm text-gray-500">{path.description}</p>
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
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                Wszystkie moduły zostały rozpoczęte.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedPaths.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedPaths.map((path, index) => (
                <Card
                  key={path.id || index}
                  className="border-green-200 bg-green-50"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      {!dataLoading && (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: path.iconColor || "#10B981",
                          }}
                        >
                          <span className="text-xl text-white">
                            {path.icon || "✅"}
                          </span>
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{path.title}</CardTitle>
                        <CardDescription className="text-green-700">
                          Ukończono
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-gray-600 mb-2">
                      {path.description}
                    </p>
                    <div className="text-sm text-green-600 font-medium">
                      {path.completedLessons}/{path.totalLessons} lekcji
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/learning/${path.id}`} className="w-full">
                      <Button variant="outline" className="w-full bg-white">
                        Powtórz
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                Nie ukończono jeszcze żadnego modułu.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Kontynuuj naukę, aby ukończyć moduły!
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Recent Activity - Ulepszona sekcja z ikonami */}
      <Card>
        <CardHeader>
          <CardTitle>Ostatnia aktywność</CardTitle>
          <CardDescription>
            Historia Twoich ostatnich aktywności na platformie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {dataLoading ? (
              <>
                <div className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
              </>
            ) : recentActivity.length > 0 ? (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                <div className="space-y-8">
                  {recentActivity.map((activity, index) => (
                    <div key={activity.id} className="relative pl-10">
                      <div className="absolute left-0 top-0 p-2 rounded-full bg-white border">
                        {activity.icon || (
                          <Clock className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">{activity.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {activity.description}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500 whitespace-nowrap">
                          {activity.date}
                        </span>
                      </div>
                      {index < recentActivity.length - 1 && (
                        <div className="absolute left-4 top-10 bottom-0 h-full w-0.5" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">Brak ostatnich aktywności.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
