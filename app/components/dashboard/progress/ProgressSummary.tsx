import { UserStats } from "@/app/types/progress";
import { Card, CardContent } from "@/components/ui/card";

interface ProgressSummaryProps {
  stats: UserStats;
}

export default function ProgressSummary({ stats }: ProgressSummaryProps) {
  // Zakładamy, że do następnego poziomu potrzeba 100 XP
  const xpForNextLevel = 100;
  const currentLevelXp = stats.totalXp % xpForNextLevel;
  const levelProgress = (currentLevelXp / xpForNextLevel) * 100;

  // Oblicz całkowity postęp
  const totalProgress =
    stats.totalLessonsCount > 0
      ? Math.round(
          (stats.completedLessonsCount / stats.totalLessonsCount) * 100
        )
      : 0;

  return (
    <Card>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Twoje postępy</h2>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Poziom {stats.level}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between mb-1 text-sm">
            <span>XP do poziomu {stats.level + 1}</span>
            <span>
              {currentLevelXp}/{xpForNextLevel} XP
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${levelProgress}%` }}
            ></div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between mb-1 text-sm">
            <span>Całkowity postęp</span>
            <span>{totalProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${totalProgress}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-100 rounded-lg p-3 text-center">
            <div className="text-gray-600 text-sm mb-1">Całkowite XP</div>
            <div className="font-bold text-lg">{stats.totalXp}</div>
          </div>
          <div className="bg-gray-100 rounded-lg p-3 text-center">
            <div className="text-gray-600 text-sm mb-1">Ukończone lekcje</div>
            <div className="font-bold text-lg">
              {stats.completedLessonsCount}/{stats.totalLessonsCount}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
