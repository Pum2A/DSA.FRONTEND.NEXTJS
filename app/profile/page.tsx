"use client";

import { apiService } from "@/app/lib/api";
import { useAuthStore } from "@/app/store/authStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Dodano Card
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertCircle,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle,
  Clock,
  Edit2,
  Flame,
  Github,
  Lock,
  Medal,
  RefreshCw,
  Save,
  Shield,
  User,
  UserCog,
  UserRound,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { JSX, useCallback, useEffect, useState } from "react";
import AchievementsSection from "../components/ui/AchievementsSection"; // Upewnij się co do ścieżki

// Typy i Enumy (bez zmian)
interface User {
  id: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  experiencePoints: number;
  level: number;
  roles?: string[];
  joinedAt?: string;
}

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
    icon: <BookOpen className="h-5 w-5 text-green-500 dark:text-green-400" />,
    label: "Ukończono lekcję",
  },
  [UserActionType.QuizCompleted]: {
    icon: <Medal className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />,
    label: "Ukończono quiz",
  },
  [UserActionType.Login]: {
    icon: <User className="h-5 w-5 text-blue-500 dark:text-blue-400" />,
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
    user: authUser,
    isLoading: authLoading,
    updateUser,
  } = useAuthStore();
  const router = useRouter();

  // Stany
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [displayUser, setDisplayUser] = useState<User | null>(authUser); // Stan dla danych z /Auth/user
  const [stats, setStats] = useState<UserStats | null>(null); // Stan dla danych z /stats
  const [isLoadingData, setIsLoadingData] = useState(true); // Zmieniono nazwę z isLoadingStats
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Inicjały
  const getInitials = useCallback(() => {
    if (displayUser) {
      return (
        `${displayUser.firstName?.[0] || ""}${
          displayUser.lastName?.[0] || ""
        }` ||
        displayUser.userName?.[0]?.toUpperCase() ||
        "?"
      );
    }
    return "?";
  }, [displayUser]);

  // Sprawdź autentykację
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, authLoading, router]);

  // === NOWA FUNKCJA POBIERANIA DANYCH ===
  const fetchProfileData = useCallback(async () => {
    if (!isAuthenticated || !authUser) return;

    setIsRefreshing(true);
    setError(null);

    try {
      const [userDataResponse, statsResponse, streakResponse, historyResponse] =
        await Promise.all([
          apiService.get<User>("Auth/user"), // Pobieramy /Auth/user
          apiService.user.getStats(),
          apiService.user.getStreak(),
          apiService.user.getActivityHistory
            ? apiService.user.getActivityHistory()
            : Promise.resolve([]),
        ]);

      const fetchedUser = userDataResponse as User;
      setDisplayUser(fetchedUser); // Aktualizujemy displayUser
      console.log("Streak response:", streakResponse);

      // Aktualizujemy formData tylko jeśli nie edytujemy
      if (!isEditing) {
        setFormData({
          firstName: fetchedUser.firstName || "",
          lastName: fetchedUser.lastName || "",
          email: fetchedUser.email || "",
        });
      }

      const statsData = statsResponse as UserStats;
      setStats({
        ...statsData, // Rozpakowujemy dane ze /stats
        streakDays:
          (streakResponse as { streak: number })?.streak ??
          statsData.streakDays ??
          0,
        // === ZMIANA PRIORYTETU ===
        // Najpierw bierzemy joinedAt z /stats, jeśli nie ma, to z /Auth/user
        joinedAt: statsData.joinedAt ?? fetchedUser.joinedAt,
        // === KONIEC ZMIANY ===
      });

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
    } catch (error) {
      console.error("Error fetching profile data:", error);
      setError("Nie udało się pobrać danych profilu");
      // Ustaw fallback stats jeśli jest błąd, używając authUser
      setStats({
        totalXp: authUser.experiencePoints || 0,
        level: authUser.level || 1,
        requiredXpForNextLevel: (authUser.level || 1) * 100,
        currentLevelMinXp: ((authUser.level || 1) - 1) * 100,
        completedLessonsCount: 0,
        totalLessonsCount: 0,
        streakDays: 0,
        joinedAt: authUser.joinedAt,
      });
    } finally {
      setIsLoadingData(false);
      setIsRefreshing(false);
    }
  }, [isAuthenticated, authUser, isEditing]); // Dodano isEditing do zależności

  // Efekty (bez zmian, używają nowej funkcji fetch)
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);
  useEffect(() => {
    const handleTaskCompleted = () => {
      console.log("Profile: taskCompleted! Odświeżam...");
      fetchProfileData();
    };
    window.addEventListener("taskCompleted", handleTaskCompleted);
    return () =>
      window.removeEventListener("taskCompleted", handleTaskCompleted);
  }, [fetchProfileData]);

  // Obliczenia XP (używamy displayUser dla XP i poziomu)
  const calculateXpProgress = useCallback(() => {
    if (!displayUser || !stats) return 0; // Potrzebujemy obu
    // Używamy stats do min/max XP dla poziomu, ale displayUser.experiencePoints jako aktualne XP
    const currentXpInLevel =
      displayUser.experiencePoints - stats.currentLevelMinXp;
    const requiredXpForLevel =
      stats.requiredXpForNextLevel - stats.currentLevelMinXp;
    if (requiredXpForLevel <= 0) return 100;
    return Math.min(
      100,
      Math.max(0, Math.round((currentXpInLevel / requiredXpForLevel) * 100))
    );
  }, [displayUser, stats]);
  const xpProgress = calculateXpProgress();
  const xpToNext =
    stats && displayUser
      ? Math.max(0, stats.requiredXpForNextLevel - displayUser.experiencePoints)
      : 0;
  const currentLevel = displayUser?.level ?? 1; // Poziom z displayUser

  // Handlery (logika zapisu bez zmian, tylko symulacja)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaveSuccess(false);
    try {
      // await apiService.user.updateProfile(formData); // TODO: Zaimplementować wywołanie API
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (authUser) {
        updateUser({ ...authUser, ...formData });
      } // Aktualizacja w Zustand
      // Odśwież dane z /Auth/user po zapisie, aby displayUser był aktualny
      const updatedUserData = await apiService.get<User>("Auth/user");
      setDisplayUser(updatedUserData);

      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Nie udało się zaktualizować profilu");
    }
  };

  // Stan ładowania
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

  // === RENDEROWANIE ===
  return (
    <div className="py-6 md:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Nagłówek */}
      <div className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <UserRound /> Profil użytkownika
            </h1>
            <p className="mt-1 sm:mt-2 text-indigo-100 text-sm sm:text-base">
              Zarządzaj swoimi danymi i śledź postępy.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProfileData}
              disabled={isRefreshing}
              aria-label="Odśwież dane"
              className="bg-white/20 text-white hover:bg-white/30 border-white/30"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              className={`${
                isEditing
                  ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900"
                  : "bg-white text-indigo-700 hover:bg-indigo-50"
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
        <Alert className="mb-6 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-800 dark:text-green-200">
            Sukces
          </AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300">
            Profil został pomyślnie zaktualizowany.
          </AlertDescription>
        </Alert>
      )}

      {/* Karta użytkownika */}
      <Card className="shadow-md hover:shadow-lg transition-shadow border dark:border-gray-700 bg-white dark:bg-gray-800 p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-3xl sm:text-4xl font-bold text-white flex-shrink-0 mx-auto sm:mx-0 shadow-lg">
            {isLoadingData ? (
              <Skeleton className="w-12 h-12 rounded-full" />
            ) : (
              getInitials()
            )}
          </div>
          <div className="text-center sm:text-left flex-grow">
            {isLoadingData ? (
              <Skeleton className="h-7 w-48 mb-1 mx-auto sm:mx-0" />
            ) : (
              <h2 className="text-xl sm:text-2xl font-bold mb-0.5 text-gray-800 dark:text-gray-100">
                {displayUser?.firstName || displayUser?.lastName
                  ? `${displayUser.firstName || ""} ${
                      displayUser.lastName || ""
                    }`.trim()
                  : displayUser?.userName}
              </h2>
            )}
            {isLoadingData ? (
              <Skeleton className="h-5 w-32 mx-auto sm:mx-0" />
            ) : (
              <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center sm:justify-start gap-1 text-sm sm:text-base">
                <UserRound size={16} />
                <span>@{displayUser?.userName}</span>
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-1.5 justify-center sm:justify-start">
              {isLoadingData ? (
                <Skeleton className="h-5 w-16 rounded-full" />
              ) : (
                <>
                  {displayUser?.roles?.map((role) => (
                    <span
                      key={role}
                      className="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-xs font-medium"
                    >
                      {role}
                    </span>
                  ))}
                  {(!displayUser?.roles || displayUser.roles.length === 0) && (
                    <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
                      Użytkownik
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="text-center sm:text-right mt-4 sm:mt-0 flex-shrink-0 border-t sm:border-t-0 sm:border-l dark:border-gray-700 pt-4 sm:pt-0 sm:pl-6">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 uppercase tracking-wider">
              Dołączył(a)
            </div>
            {isLoadingData || isRefreshing ? (
              <Skeleton className="h-5 w-28 mx-auto sm:mx-0" />
            ) : (
              <div className="font-medium text-gray-700 dark:text-gray-300">
                {stats?.joinedAt &&
                typeof stats.joinedAt === "string" &&
                stats.joinedAt.length > 0 &&
                !stats.joinedAt.startsWith("0001-01-01") && // Nadal sprawdzamy minimalną datę
                !isNaN(new Date(stats.joinedAt).getTime())
                  ? new Date(stats.joinedAt).toLocaleDateString("pl-PL", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "N/A"}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Główna siatka treści */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lewa kolumna - statystyki i aktywność */}
        <div className="lg:col-span-1 space-y-6">
          {/* Podsumowanie statystyk */}
          <Card className="shadow-sm hover:shadow-md transition-shadow border dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity size={18} className="text-indigo-500" /> Statystyki
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Poziom i XP */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 p-4 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-900">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-gray-700 dark:text-gray-300 font-medium flex items-center text-sm">
                    <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mr-1.5" />{" "}
                    Poziom{" "}
                    {isLoadingData || isRefreshing ? (
                      <Skeleton className="h-4 w-5 inline-block ml-1" />
                    ) : (
                      currentLevel
                    )}
                  </div>
                  <div className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
                    {isLoadingData || isRefreshing ? (
                      <Skeleton className="h-4 w-12" />
                    ) : (
                      `${displayUser?.experiencePoints ?? 0} XP`
                    )}
                  </div>
                </div>
                {isLoadingData || isRefreshing ? (
                  <Skeleton className="h-2 w-full rounded-full mb-1" />
                ) : (
                  <>
                    <Progress
                      value={xpProgress}
                      className="h-2 bg-indigo-100 dark:bg-indigo-900 [&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:to-purple-500"
                      aria-label={`Postęp: ${xpProgress}%`}
                    />
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {xpToNext} XP do poz. {currentLevel + 1}
                    </div>
                  </>
                )}
              </div>
              {/* Pozostałe staty */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-xl shadow-sm border border-green-100 dark:border-green-900 flex flex-col items-center text-center">
                  <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400 mb-1" />
                  {isLoadingData || isRefreshing ? (
                    <Skeleton className="h-6 w-10 mb-0.5" />
                  ) : (
                    <div className="text-lg font-bold text-green-700 dark:text-green-300">
                      {stats?.completedLessonsCount ?? 0}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Ukończ. lekcje
                  </div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/30 p-3 rounded-xl shadow-sm border border-orange-100 dark:border-orange-900 flex flex-col items-center text-center">
                  <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400 mb-1" />
                  {isLoadingData || isRefreshing ? (
                    <Skeleton className="h-6 w-8 mb-0.5" />
                  ) : (
                    <div className="text-lg font-bold text-orange-700 dark:text-orange-300">
                      {stats?.streakDays ?? 0}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Dni serii
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
                {/* Upewnij się, że ten komponent jest responsywny */}
              </div>
            </CardContent>
          </Card>

          {/* Ostatnia aktywność */}
          <Card className="shadow-sm hover:shadow-md transition-shadow border dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays size={18} className="text-teal-500" /> Ostatnia
                aktywność
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5 max-h-80 overflow-y-auto pr-1 -mr-1">
                {" "}
                {/* Scroll */}
                {(isLoadingData || isRefreshing) &&
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
                {!isLoadingData &&
                  !isRefreshing &&
                  recentActivity.length > 0 && (
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
                {!isLoadingData &&
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

        {/* Prawa kolumna - zakładki */}
        <div className="lg:col-span-2">
          <Tabs
            defaultValue="personal"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md border dark:border-gray-700 overflow-hidden"
          >
            <TabsList className="grid grid-cols-2 w-full rounded-t-xl rounded-b-none h-auto bg-gray-50 dark:bg-gray-900/50">
              <TabsTrigger
                value="personal"
                className="py-3 data-[state=active]:shadow-inner data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-tl-lg rounded-tr-none rounded-b-none text-sm sm:text-base"
              >
                <UserRound className="h-4 w-4 mr-2 hidden sm:inline-block" />{" "}
                Informacje
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="py-3 data-[state=active]:shadow-inner data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-tr-lg rounded-tl-none rounded-b-none text-sm sm:text-base"
              >
                <UserCog className="h-4 w-4 mr-2 hidden sm:inline-block" />{" "}
                Ustawienia
              </TabsTrigger>
            </TabsList>

            {/* Zakładka: Informacje */}
            <TabsContent value="personal" className="p-6">
              <form onSubmit={handleSubmit}>
                <h2 className="text-lg sm:text-xl font-semibold mb-5 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                  <User size={18} className="text-indigo-500" /> Dane osobowe
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">Imię</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`${
                        isEditing
                          ? ""
                          : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 cursor-default"
                      }`}
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
                      className={`${
                        isEditing
                          ? ""
                          : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 cursor-default"
                      }`}
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
                      className={`${
                        isEditing
                          ? ""
                          : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 cursor-default"
                      }`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="username">Nazwa użytkownika</Label>
                    <Input
                      id="username"
                      value={displayUser?.userName || ""}
                      disabled
                      className="bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Nazwa użytkownika nie może być zmieniona.
                    </p>
                  </div>
                </div>
                {isEditing && (
                  <div className="mt-6 flex justify-end border-t dark:border-gray-700 pt-4">
                    <Button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
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
                <UserCog size={18} className="text-indigo-500" /> Ustawienia
                konta
              </h2>
              <div className="space-y-6">
                {/* Bezpieczeństwo */}
                <div>
                  <h3 className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Lock size={16} /> Bezpieczeństwo
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Zmiana hasła i zarządzanie sesjami będą dostępne w
                      przyszłości.
                    </p>
                    <Button variant="outline" size="sm" disabled>
                      Zmień hasło (niedostępne)
                    </Button>
                  </div>
                </div>
                {/* Prywatność */}
                <div>
                  <h3 className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Shield size={16} /> Prywatność
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-700 rounded-lg p-4 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex-grow">
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
                      <div className="flex-grow">
                        <div className="font-medium text-sm text-gray-800 dark:text-gray-200">
                          Udostępnianie statystyk
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Pokaż postępy w rankingach
                        </div>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        Włączone (niedostępne)
                      </Button>
                    </div>
                  </div>
                </div>
                {/* Połączone Konta (Placeholder) */}
                <div>
                  <h3 className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Github size={16} /> Połączone konta
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-700 rounded-lg p-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Możliwość połączenia konta GitHub będzie dostępna wkrótce.
                    </p>
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
