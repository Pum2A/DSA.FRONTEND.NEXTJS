import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarClock, Flame } from "lucide-react";
import { DailyStreakCardProps } from "../types";

export default function DailyStreakCard({
  streak,
  dailyGoalCompleted,
  isLoading,
  isRefreshing,
}: DailyStreakCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow border dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarClock className="text-orange-500" /> Dzienna aktywność
        </CardTitle>
        <CardDescription>Twoja seria i dzienne cele</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-orange-400 to-red-500 p-3 rounded-full shadow-lg text-white">
            <Flame className="h-7 w-7" />
          </div>
          <div>
            {isLoading || isRefreshing ? (
              <Skeleton className="h-8 w-12 mb-0.5" />
            ) : (
              <>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {/* Ważne: bezpieczne renderowanie streak jako liczby */}
                  {typeof streak === "number" ? streak : 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Dni serii
                </div>
              </>
            )}
          </div>
        </div>
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
  );
}
