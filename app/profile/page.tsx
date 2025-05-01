"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, JSX } from "react";
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
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AchievementsSection from "../components/ui/AchievementsSection";

// Typ dla statystyk użytkownika
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

// Typ dla aktywności użytkownika
type UserActivity = {
  id: number | string;
  userId: string;
  actionType: number;
  actionTime: string;
  referenceId?: string;
  additionalInfo?: string;
};

// Enum for action types (must match backend)
enum UserActionType {
  LessonCompleted = 0,
  QuizCompleted = 1,
  Login = 2,
  // Dodaj inne typy jeśli masz
}

// Mapowanie numerów enum na ikonę i label
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
  // Zwraca "YYYY-MM-DD" w UTC
  return (
    date.getUTCFullYear() +
    "-" +
    String(date.getUTCMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getUTCDate()).padStart(2, "0")
  );
}

export default function ProfilePage() {
  const { isAuthenticated, user, isLoading, updateUser } = useAuthStore();
  const router = useRouter();

  // Stan dla trybu edycji
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  // Stany dla danych statystycznych i ładowania
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Inicjały użytkownika do avatara
  const getInitials = () => {
    if (user) {
      return (
        `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}` ||
        user.userName?.[0]?.toUpperCase() ||
        "?"
      );
    }
    return "?";
  };

  // Sprawdź autentykację
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Pobierz dane użytkownika i statystyki
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });

      const fetchUserStats = async () => {
        try {
          setIsLoadingStats(true);

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

          // Recent activity (ostatnie 10)
          if (Array.isArray(historyResponse)) {
            setRecentActivity(
              historyResponse
                .slice(0, 10)
                .map((a: UserActivity, idx: number) => {
                  const map = actionTypeMap[a.actionType] || {
                    icon: <Clock className="h-5 w-5 text-gray-400" />,
                    label: `Aktywność`,
                  };

                  let description = "";
                  if (a.actionType === UserActionType.LessonCompleted) {
                    description = `Ukończono lekcję: ${a.referenceId || "?"}`;
                  } else if (a.actionType === UserActionType.QuizCompleted) {
                    description = `Ukończono quiz: ${a.referenceId || "?"}`;
                  } else if (a.actionType === UserActionType.Login) {
                    description = "Logowanie do systemu";
                  } else {
                    description = a.additionalInfo || "";
                  }

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
          setIsLoadingStats(false);
        }
      };

      fetchUserStats();
    }
  }, [isAuthenticated, user]);

  // Obliczanie procentu XP do następnego poziomu
  const calculateXpProgress = () => {
    if (!stats) return 0;

    const currentXp = stats.totalXp - stats.currentLevelMinXp;
    const requiredXp = stats.requiredXpForNextLevel - stats.currentLevelMinXp;

    if (requiredXp <= 0) return 100;
    const progress = Math.min(100, Math.round((currentXp / requiredXp) * 100));
    return progress;
  };

  const xpProgress = calculateXpProgress();
  const xpToNext = stats
    ? Math.max(0, stats.requiredXpForNextLevel - stats.totalXp)
    : 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Symulacja zapisu danych
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Aktualizacja danych użytkownika
      if (user) {
        updateUser({
          ...user,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        });
      }

      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Nie udało się zaktualizować profilu");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 border-t-4 border-b-4 border-blue-600 border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Ładowanie profilu...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profil użytkownika</h1>
            <p className="mt-2 text-blue-100">
              Zarządzaj swoimi danymi i śledź postępy na platformie.
            </p>
          </div>
          <Button
            className={`mt-4 sm:mt-0 ${
              isEditing
                ? "bg-white/80 text-blue-700 hover:bg-white"
                : "bg-white text-blue-700 hover:bg-blue-50"
            }`}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Anuluj edycję
              </>
            ) : (
              <>
                <Edit2 className="h-4 w-4 mr-2" />
                Edytuj profil
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Błąd</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {saveSuccess && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Sukces</AlertTitle>
          <AlertDescription className="text-green-700">
            Profil został pomyślnie zaktualizowany
          </AlertDescription>
        </Alert>
      )}

      {/* User Card */}
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 mb-8 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold text-white flex-shrink-0 mx-auto sm:mx-0 shadow-md">
            {getInitials()}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold mb-1 text-gray-800">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-1">
              <UserRound size={16} />
              <span>@{user.userName}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
              {user.roles?.map((role) => (
                <span
                  key={role}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium shadow-sm"
                >
                  {role}
                </span>
              ))}
              {(!user.roles || user.roles.length === 0) && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  Użytkownik
                </span>
              )}
            </div>
          </div>
          <div className="ml-auto hidden sm:block">
            <div className="flex flex-col items-center">
              <div className="text-sm text-gray-500">Dołączył(a)</div>
              <div className="font-medium">
                {stats?.joinedAt
                  ? new Intl.DateTimeFormat("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }).format(new Date(stats.joinedAt))
                  : "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nowy układ treści z zakładkami */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lewa kolumna - statystyki i aktywność */}
        <div className="lg:col-span-1 space-y-6">
          {/* Stats Overview - z poprawionym XP */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <Activity size={20} className="text-blue-500" />
              Statystyki
            </h2>
            <div className="space-y-6">
              {/* Poziom i XP z wizualnym progress barem */}
              <div className="bg-blue-50 p-5 rounded-xl shadow-sm border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-gray-700 font-medium flex items-center">
                    <Shield className="h-5 w-5 text-blue-600 mr-2" />
                    Poziom{" "}
                    {isLoadingStats ? "..." : stats?.level || user.level || 1}
                  </div>
                  <div className="text-sm text-blue-700 font-medium">
                    {isLoadingStats
                      ? "..."
                      : stats?.totalXp || user.experiencePoints || 0}{" "}
                    XP
                  </div>
                </div>

                {isLoadingStats ? (
                  <Skeleton className="h-2 w-full rounded-full mb-2" />
                ) : (
                  <>
                    <div className="w-full bg-blue-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${xpProgress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1.5 text-xs text-gray-500">
                      <span>{stats?.currentLevelMinXp || 0} XP</span>
                      <span>
                        {xpToNext} XP do poziomu {(stats?.level || 1) + 1}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Pozostałe statystyki */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-100 flex flex-col items-center">
                  <BookOpen className="h-6 w-6 text-green-600 mb-1" />
                  <div className="text-xl font-bold text-green-700">
                    {isLoadingStats ? "..." : stats?.completedLessonsCount || 0}
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    Ukończone lekcje
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-xl shadow-sm border border-orange-100 flex flex-col items-center">
                  <Flame className="h-6 w-6 text-orange-600 mb-1" />
                  <div className="text-xl font-bold text-orange-700">
                    {isLoadingStats ? "..." : stats?.streakDays || 0}
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    Dni z rzędu
                  </div>
                </div>
              </div>

              {/* Achievements Section */}
              <div className="bg-yellow-50 p-4 rounded-xl shadow-sm border border-yellow-100">
                <AchievementsSection />
              </div>

              {/* Role */}
              <div className="bg-purple-50 p-4 rounded-xl shadow-sm border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Github size={18} className="text-purple-600" />
                  <div className="text-sm font-medium text-gray-700">Role</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.roles?.map((role) => (
                    <span
                      key={role}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium shadow-sm"
                    >
                      {role}
                    </span>
                  ))}
                  {(!user.roles || user.roles.length === 0) && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      Użytkownik
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Section */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 border-b pb-2">
              <CalendarDays size={20} className="text-blue-500" />
              Ostatnia aktywność
            </h2>
            <div className="rounded-xl overflow-hidden border border-gray-200 divide-y">
              {recentActivity.length === 0 && (
                <div className="p-4 text-gray-400 text-center">
                  Brak aktywności.
                </div>
              )}
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                      {activity.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {activity.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 flex items-center gap-1">
                    <span>{activity.date}</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prawa kolumna - informacje osobowe i ustawienia w zakładkach */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="personal">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="personal">
                <UserRound className="h-4 w-4 mr-2" />
                Informacje osobowe
              </TabsTrigger>
              <TabsTrigger value="settings">
                <UserCog className="h-4 w-4 mr-2" />
                Ustawienia
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              {/* Personal Information */}
              <form onSubmit={handleSubmit}>
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 border-b pb-2">
                    <User size={20} className="text-blue-500" />
                    Dane osobowe
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Imię</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={
                          isEditing ? "" : "bg-gray-50 border-gray-200"
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nazwisko</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={
                          isEditing ? "" : "bg-gray-50 border-gray-200"
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 mr-2" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={
                            isEditing ? "" : "bg-gray-50 border-gray-200"
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Nazwa użytkownika</Label>
                      <Input
                        id="username"
                        value={user.userName || ""}
                        disabled
                        className="bg-gray-50 border-gray-200"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Nazwa użytkownika nie może zostać zmieniona
                      </p>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-6 flex justify-end">
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Zapisz zmiany
                      </Button>
                    </div>
                  )}
                </div>
              </form>
            </TabsContent>

            <TabsContent value="settings">
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 border-b pb-2">
                  <UserCog size={20} className="text-blue-500" />
                  Ustawienia konta
                </h2>

                <div className="space-y-8 mt-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Bezpieczeństwo</h3>
                    <div className="bg-white border rounded-lg p-4">
                      <p className="text-gray-700 mb-4">
                        Zalecamy regularne zmienianie hasła dla zwiększenia
                        bezpieczeństwa konta.
                      </p>
                      <Button variant="outline">Zmień hasło</Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Powiadomienia</h3>
                    <div className="bg-gray-50 border rounded-lg p-6 text-center">
                      <p className="text-gray-500">
                        Ustawienia powiadomień będą dostępne wkrótce.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Prywatność</h3>
                    <div className="bg-white border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium">Widoczność profilu</div>
                          <div className="text-sm text-gray-500">
                            Kto może widzieć Twój profil
                          </div>
                        </div>
                        <div>
                          <Button variant="outline" size="sm">
                            Tylko ja
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            Udostępnianie statystyk
                          </div>
                          <div className="text-sm text-gray-500">
                            Pokaż swoje postępy w nauce innym
                          </div>
                        </div>
                        <div>
                          <Button variant="outline" size="sm">
                            Włączone
                          </Button>
                        </div>
                      </div>
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
