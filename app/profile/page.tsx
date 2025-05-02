"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, JSX, useCallback } from "react"; // Dodano useCallback
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/app/store/authStore";
import { apiService } from "@/app/lib/api";
import {
  CalendarDays,
  Mail,
  ChevronRight,
  User,
  UserRound,
  Award,
  Activity,
  Github,
  AlertCircle,
  Lightbulb,
  Clock,
  Star,
  Shield,
  Edit2,
  Save,
  UserCog,
  Flame,
  BookOpen,
  Medal,
  RefreshCw,
  CheckCircle,
  X, // Ikona do odświeżania
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AchievementsSection from "../components/ui/AchievementsSection"; // Upewnij się co do ścieżki
import { Progress } from "@/components/ui/progress"; // Dodano Progress

// Typy i Enumy (bez zmian)
interface UserStats {
  totalXp: number;
  level: number;
  requiredXpForNextLevel: number;
  currentLevelMinXp: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  streakDays: number;
  joinedAt?: string;
}
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
    icon: <User className="h-5 w-5 text-blue-600" />,
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

// GŁÓWNY KOMPONENT PROFILU
export default function ProfilePage() {
  const {
    isAuthenticated,
    user,
    isLoading: authLoading,
    updateUser,
  } = useAuthStore(); // Zmieniono isLoading na authLoading
  const router = useRouter();

  // Stany
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // Dodano stan odświeżania
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Inicjały
  const getInitials = useCallback(() => {
    if (user) {
      return (
        `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}` ||
        user.userName?.[0]?.toUpperCase() ||
        "?"
      );
    }
    return "?";
  }, [user]);

  // Sprawdź autentykację
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Funkcja do pobierania danych profilu (statystyki, aktywność)
  const fetchProfileData = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    setIsRefreshing(true); // Ustaw stan odświeżania
    setError(null);

    try {
      const [statsResponse, streakResponse, historyResponse] =
        await Promise.all([
          apiService.user.getStats(),
          apiService.user.getStreak(),
          apiService.user.getActivityHistory
            ? apiService.user.getActivityHistory()
            : Promise.resolve([]),
        ]);

      const statsData = statsResponse as UserStats;
      setStats({
        ...statsData,
        streakDays:
          (streakResponse &&
          typeof streakResponse === "object" &&
          "streak" in streakResponse
            ? (streakResponse as { streak: number }).streak
            : statsData.streakDays) || 0,
      });

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
    } catch (error) {
      console.error("Error fetching user stats:", error);
      setError("Nie udało się pobrać statystyk użytkownika");
      // Ustaw fallback stats jeśli jest błąd
      setStats({
        totalXp: user.experiencePoints || 0,
        level: user.level || 1,
        requiredXpForNextLevel: (user.level || 1) * 100,
        currentLevelMinXp: ((user.level || 1) - 1) * 100,
        completedLessonsCount: 0,
        totalLessonsCount: 0,
        streakDays: 0,
        joinedAt: user.joinedAt,
      });
    } finally {
      setIsLoadingStats(false); // Zakończ główny stan ładowania statystyk
      setIsRefreshing(false); // Zakończ stan odświeżania
    }
  }, [isAuthenticated, user]); // Zależności

  // Efekt do inicjalizacji danych i pobrania statystyk
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
      fetchProfileData(); // Pobierz dane przy ładowaniu
    }
  }, [isAuthenticated, user, fetchProfileData]); // Dodano fetchProfileData do zależności

  // NOWY EFEKT: Nasłuchiwanie na zdarzenie 'taskCompleted'
  useEffect(() => {
    const handleTaskCompleted = () => {
      console.log(
        "Profile: Zdarzenie taskCompleted odebrane! Odświeżam dane..."
      );
      fetchProfileData(); // Wywołaj funkcję pobierającą dane
    };
    window.addEventListener("taskCompleted", handleTaskCompleted);
    return () =>
      window.removeEventListener("taskCompleted", handleTaskCompleted);
  }, [fetchProfileData]); // Zależność od funkcji fetch

  // Obliczenia XP (bez zmian)
  const calculateXpProgress = useCallback(() => {
    if (!stats) return 0;
    const currentXp = stats.totalXp - stats.currentLevelMinXp;
    const requiredXp = stats.requiredXpForNextLevel - stats.currentLevelMinXp;
    if (requiredXp <= 0) return 100;
    return Math.min(100, Math.round((currentXp / requiredXp) * 100));
  }, [stats]);
  const xpProgress = calculateXpProgress();
  const xpToNext = stats
    ? Math.max(0, stats.requiredXpForNextLevel - stats.totalXp)
    : 0;

  // Handlery (bez zmian)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Tu powinna być logika API do zapisu, obecna jest tylko symulacja i update Zustand
    try {
      // await apiService.user.updateProfile(formData); // PRZYKŁAD wywołania API
      await new Promise((resolve) => setTimeout(resolve, 500)); // Symulacja
      if (user) {
        updateUser({ ...user, ...formData });
      }
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Nie udało się zaktualizować profilu");
    }
  };

  // Stany ładowania (bez zmian)
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="mt-3 text-gray-600 dark:text-gray-400 font-medium">
            Ładowanie profilu...
          </p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated || !user) {
    return null;
  }

  // === RENDEROWANIE ===
  return (
    <div className="py-6 md:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Nagłówek - poprawiona responsywność */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Profil użytkownika
            </h1>
            <p className="mt-1 sm:mt-2 text-blue-100 text-sm sm:text-base">
              Zarządzaj swoimi danymi i śledź postępy.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {/* Przycisk odświeżania danych */}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProfileData}
              disabled={isRefreshing}
              aria-label="Odśwież dane profilu"
              className="bg-white/20 text-white hover:bg-white/30 border-white/30"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
            {/* Przycisk edycji */}
            <Button
              className={` ${
                isEditing
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : "bg-white text-blue-700 hover:bg-blue-50"
              }`}
              onClick={() => setIsEditing(!isEditing)}
              size="sm"
            >
              {isEditing ? (
                <X className="h-4 w-4 mr-1 sm:mr-2" />
              ) : (
                <Edit2 className="h-4 w-4 mr-1 sm:mr-2" />
              )}
              <span className="hidden sm:inline">
                {isEditing ? "Anuluj edycję" : "Edytuj profil"}
              </span>
              <span className="sm:hidden">
                {isEditing ? "Anuluj" : "Edytuj"}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Alerty */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Błąd</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {saveSuccess && (
        <Alert className="mb-6 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-800 dark:text-green-200">
            Sukces
          </AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300">
            Profil został pomyślnie zaktualizowany.
          </AlertDescription>
        </Alert>
      )}

      {/* Karta użytkownika - poprawiona responsywność */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 mb-8 border dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-3xl sm:text-4xl font-bold text-white flex-shrink-0 mx-auto sm:mx-0 shadow-md">
            {getInitials()}
          </div>
          <div className="text-center sm:text-left flex-grow">
            <h2 className="text-xl sm:text-2xl font-bold mb-0.5 text-gray-800 dark:text-gray-100">
              {user.firstName || user.lastName
                ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                : user.userName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center sm:justify-start gap-1 text-sm sm:text-base">
              <UserRound size={16} />
              <span>@{user.userName}</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
              {user.roles?.map((role) => (
                <span
                  key={role}
                  className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium shadow-sm"
                >
                  {role}
                </span>
              ))}
              {(!user.roles || user.roles.length === 0) && (
                <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
                  Użytkownik
                </span>
              )}
            </div>
          </div>
          <div className="text-center sm:text-right mt-4 sm:mt-0 flex-shrink-0">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
              Dołączył(a)
            </div>
            {isLoadingStats || isRefreshing ? (
              <Skeleton className="h-5 w-28" />
            ) : (
              <div className="font-medium text-gray-700 dark:text-gray-300">
                {stats?.joinedAt
                  ? new Date(stats.joinedAt).toLocaleDateString("pl-PL", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Główna siatka treści - responsywna */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lewa kolumna - statystyki i aktywność (zajmuje całą szerokość na mniejszych ekranach) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Podsumowanie statystyk */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border dark:border-gray-700 hover:shadow-lg transition-shadow">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
              <Activity
                size={20}
                className="text-blue-500 dark:text-blue-400"
              />{" "}
              Statystyki
            </h2>
            <div className="space-y-5">
              {/* Poziom i XP */}
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-gray-700 dark:text-gray-300 font-medium flex items-center text-sm">
                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-1.5" />
                    Poziom{" "}
                    {isLoadingStats || isRefreshing ? (
                      <Skeleton className="h-4 w-5 inline-block ml-1" />
                    ) : (
                      stats?.level ?? user.level ?? 1
                    )}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    {isLoadingStats || isRefreshing ? (
                      <Skeleton className="h-4 w-12" />
                    ) : (
                      `${stats?.totalXp ?? user.experiencePoints ?? 0} XP`
                    )}
                  </div>
                </div>
                {isLoadingStats || isRefreshing ? (
                  <Skeleton className="h-2 w-full rounded-full mb-1" />
                ) : (
                  <>
                    <Progress
                      value={xpProgress}
                      className="h-2"
                      aria-label={`Postęp do następnego poziomu: ${xpProgress}%`}
                    />
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {xpToNext} XP do poziomu {(stats?.level ?? 1) + 1}
                    </div>
                  </>
                )}
              </div>
              {/* Pozostałe staty - responsywny grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/30 p-3 sm:p-4 rounded-xl shadow-sm border border-green-100 dark:border-green-900 flex flex-col items-center text-center">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400 mb-1" />
                  {isLoadingStats || isRefreshing ? (
                    <Skeleton className="h-6 w-10 mb-0.5" />
                  ) : (
                    <div className="text-lg sm:text-xl font-bold text-green-700 dark:text-green-300">
                      {stats?.completedLessonsCount ?? 0}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Ukończone lekcje
                  </div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/30 p-3 sm:p-4 rounded-xl shadow-sm border border-orange-100 dark:border-orange-900 flex flex-col items-center text-center">
                  <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400 mb-1" />
                  {isLoadingStats || isRefreshing ? (
                    <Skeleton className="h-6 w-8 mb-0.5" />
                  ) : (
                    <div className="text-lg sm:text-xl font-bold text-orange-700 dark:text-orange-300">
                      {stats?.streakDays ?? 0}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Dni z rzędu
                  </div>
                </div>
              </div>
              {/* Osiągnięcia */}
              <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-xl shadow-sm border border-yellow-100 dark:border-yellow-900">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                  <Award
                    size={16}
                    className="text-yellow-600 dark:text-yellow-400"
                  />{" "}
                  Osiągnięcia
                </h3>
                <AchievementsSection />{" "}
                {/* Zakładamy, że ten komponent istnieje i jest responsywny */}
              </div>
            </div>
          </div>

          {/* Ostatnia aktywność - używa tej samej logiki co Dashboard */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border dark:border-gray-700 hover:shadow-lg transition-shadow">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-2">
              <CalendarDays
                size={20}
                className="text-blue-500 dark:text-blue-400"
              />{" "}
              Ostatnia aktywność
            </h2>
            <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
              {" "}
              {/* Dodano scroll */}
              {(isLoadingStats || isRefreshing) && !recentActivity.length && (
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
              {!isLoadingStats &&
                !isRefreshing &&
                recentActivity.length > 0 && (
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
                                <span className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center ring-4 ring-white dark:ring-gray-900">
                                  {activity.icon || (
                                    <Clock className="h-5 w-5 text-gray-400" />
                                  )}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 py-1.5">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  <span className="font-medium text-gray-900 dark:text-gray-100 mr-2">
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
              {!isLoadingStats &&
                !isRefreshing &&
                recentActivity.length === 0 && (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    Brak ostatnich aktywności.
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Prawa kolumna - zakładki z informacjami i ustawieniami */}
        <div className="lg:col-span-2">
          <Tabs
            defaultValue="personal"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md border dark:border-gray-700 overflow-hidden"
          >
            {/* TabsList z lepszą responsywnością */}
            <TabsList className="grid grid-cols-2 w-full rounded-t-xl rounded-b-none h-auto">
              <TabsTrigger
                value="personal"
                className="py-3 data-[state=active]:shadow-none data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 rounded-tl-lg rounded-tr-none rounded-b-none"
              >
                <UserRound className="h-4 w-4 mr-2 hidden sm:inline-block" />{" "}
                Informacje
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="py-3 data-[state=active]:shadow-none data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 rounded-tr-lg rounded-tl-none rounded-b-none"
              >
                <UserCog className="h-4 w-4 mr-2 hidden sm:inline-block" />{" "}
                Ustawienia
              </TabsTrigger>
            </TabsList>

            {/* Zakładka: Informacje osobowe */}
            <TabsContent value="personal" className="p-6">
              <form onSubmit={handleSubmit}>
                <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                  <User
                    size={20}
                    className="text-blue-500 dark:text-blue-400"
                  />{" "}
                  Dane osobowe
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">Imię</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={
                        isEditing
                          ? ""
                          : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Nazwisko</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={
                        isEditing
                          ? ""
                          : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={
                        isEditing
                          ? ""
                          : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="username">Nazwa użytkownika</Label>
                    <Input
                      id="username"
                      value={user.userName || ""}
                      disabled
                      className="bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Nazwa użytkownika nie może zostać zmieniona.
                    </p>
                  </div>
                </div>
                {isEditing && (
                  <div className="mt-6 flex justify-end border-t dark:border-gray-700 pt-4">
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      <Save className="h-4 w-4 mr-2" /> Zapisz zmiany
                    </Button>
                  </div>
                )}
              </form>
            </TabsContent>

            {/* Zakładka: Ustawienia */}
            <TabsContent value="settings" className="p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                <UserCog
                  size={20}
                  className="text-blue-500 dark:text-blue-400"
                />{" "}
                Ustawienia konta
              </h2>
              <div className="space-y-8">
                {/* Bezpieczeństwo */}
                <div>
                  <h3 className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Bezpieczeństwo
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Zalecamy regularne zmienianie hasła dla zwiększenia
                      bezpieczeństwa konta.
                    </p>
                    <Button variant="outline" size="sm" disabled>
                      Zmień hasło (niedostępne)
                    </Button>
                  </div>
                </div>
                {/* Powiadomienia */}
                <div>
                  <h3 className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Powiadomienia
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-700 rounded-lg p-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Ustawienia powiadomień będą dostępne wkrótce.
                    </p>
                  </div>
                </div>
                {/* Prywatność */}
                <div>
                  <h3 className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Prywatność
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-700 rounded-lg p-4 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-medium text-sm text-gray-800 dark:text-gray-200">
                          Widoczność profilu
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Kto może widzieć Twój publiczny profil
                        </div>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        Tylko ja (niedostępne)
                      </Button>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-medium text-sm text-gray-800 dark:text-gray-200">
                          Udostępnianie statystyk
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Pokaż postępy w rankingach (jeśli dotyczy)
                        </div>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        Włączone (niedostępne)
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
