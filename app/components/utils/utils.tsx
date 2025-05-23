import { BookOpen, Clock, Medal, TrendingUp } from "lucide-react";
import { JSX } from "react";

import {
  DashboardLearningPath,
  ProcessedActivity,
  UserActionType,
  UserActivity,
} from "@/app/types/dashboard";
import { Module } from "@/app/types/module";
import { getModuleIcon, toDateStringUTC } from "./helpers";

// Mapa typów aktywności na ikony i etykiety
export const actionTypeMap: Record<
  number,
  { icon: JSX.Element; label: string }
> = {
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

// Funkcja do przetwarzania danych streak z API
export function processStreakData(streakResponse: any): number {
  console.log("Surowe dane z API (streak):", streakResponse);

  if (streakResponse) {
    // Sprawdź, czy to obiekt z właściwością "Streak" (z dużej litery)
    if (typeof streakResponse === "object" && streakResponse !== null) {
      if ("Streak" in streakResponse) {
        // Konwersja na liczbę i ustawienie wartości
        const streakValue = Number(streakResponse.Streak);
        console.log("Przetworzony streak (z obj.Streak):", streakValue);
        return isNaN(streakValue) ? 0 : streakValue;
      } else if ("streak" in streakResponse) {
        // Konwersja na liczbę i ustawienie wartości (mała litera)
        const streakValue = Number(streakResponse.streak);
        console.log("Przetworzony streak (z obj.streak):", streakValue);
        return isNaN(streakValue) ? 0 : streakValue;
      }
    } else {
      // To nie jest obiekt, spróbuj bezpośredniego użycia
      const streakValue = Number(streakResponse);
      console.log("Przetworzony streak (bezpośrednio):", streakValue);
      return isNaN(streakValue) ? 0 : streakValue;
    }
  }

  // Brak danych, zwróć 0
  console.warn("Brak danych streak z API");
  return 0;
}

// Funkcja do przetwarzania aktywności użytkownika
export function processUserActivity(historyResponse: any) {
  const todayDateString = toDateStringUTC(new Date());

  const dailyGoalCompleted =
    Array.isArray(historyResponse) &&
    historyResponse.some(
      (a: UserActivity) =>
        a.actionType === UserActionType.LessonCompleted &&
        toDateStringUTC(new Date(a.actionTime)) === todayDateString
    );

  // Konwersja danych aktywności
  let activity: ProcessedActivity[] = [];

  if (Array.isArray(historyResponse)) {
    activity = historyResponse
      .slice(0, 7)
      .map((a: UserActivity, idx: number) => {
        const map = actionTypeMap[a.actionType] || {
          icon: <Clock className="h-5 w-5 text-gray-400" />,
          label: `Aktywność`,
        };

        let description = a.additionalInfo || "";
        if (a.actionType === UserActionType.LessonCompleted)
          description = `Ukończono lekcję: ${a.referenceId || "?"}`;
        else if (a.actionType === UserActionType.QuizCompleted)
          description = `Ukończono quiz: ${a.referenceId || "?"}`;
        else if (a.actionType === UserActionType.Login)
          description = "Logowanie do systemu";

        return {
          id: a.id ?? idx,
          type: a.actionType,
          title: map.label,
          description,
          date: new Date(a.actionTime).toLocaleDateString("pl-PL"),
          icon: map.icon,
        };
      });
  }

  return {
    dailyGoalCompleted,
    activity,
  };
}

// Funkcja do przetwarzania danych modułów
export async function processModuleData(
  modulesData: Module[],
  fetchModuleProgress: (
    moduleId: string
  ) => Promise<{ completedLessons: number; totalLessons: number }>
): Promise<DashboardLearningPath[]> {
  if (!Array.isArray(modulesData) || modulesData.length === 0) {
    return [];
  }

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

    const icon = getModuleIcon(module.externalId, module.title);
    return {
      id: module.externalId,
      title: module.title,
      description: module.description,
      icon: icon ?? <BookOpen className="h-5 w-5 text-gray-400" />, // fallback to a default icon
      iconColor: module.iconColor || "#6366F1",
      progress: completionPercentage,
      completedLessons: progress.completedLessons,
      totalLessons: progress.totalLessons || module.lessons?.length || 0,
    } as DashboardLearningPath;
  });

  const processedModules = await Promise.all(moduleProgressPromises);

  // Sortowanie ścieżek
  return processedModules.sort((a, b) => {
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
    if (a.progress === 0 && b.progress !== 0) return -1;
    if (b.progress === 0 && a.progress !== 0) return 1;
    return b.progress - a.progress;
  });
}
