import { apiService } from "@/app/lib/api";
import { Module, ModuleProgress } from "@/app/types";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ModuleProgressCardProps {
  module: Module;
}

export default function ModuleProgressCard({
  module,
}: ModuleProgressCardProps) {
  const [progress, setProgress] = useState<ModuleProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getModuleProgress = async () => {
      try {
        // Używamy apiService zamiast fetchData
        const data = await apiService.lessons.getModuleProgress(
          module.externalId
        );
        setProgress(data as ModuleProgress);
      } catch (error) {
        console.error("Error fetching module progress:", error);
        // Ustaw wartości domyślne w przypadku błędu
        setProgress({
          completedLessons: 0,
          inProgressLessons: 0,
          totalLessons: module.lessons?.length || 0,
        });
      } finally {
        setLoading(false);
      }
    };

    getModuleProgress();
  }, [module.externalId, module.lessons?.length]);

  if (loading) {
    return (
      <Card className="h-full animate-pulse">
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
            <div className="h-5 bg-gray-300 rounded w-1/2"></div>
          </div>
          <div className="w-full h-2 bg-gray-300 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </CardContent>
      </Card>
    );
  }

  if (!progress) return null;

  const totalLessons = progress.totalLessons;
  const completionPercentage =
    totalLessons > 0
      ? Math.min(
          100,
          Math.round((progress.completedLessons / totalLessons) * 100)
        )
      : 0;

  return (
    <Link href={`/learning/${module.externalId}`} className="block">
      <Card className="h-full hover:shadow-lg transition-shadow duration-200">
        <CardContent>
          <div className="flex items-center mb-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
              style={{ backgroundColor: module.iconColor }}
            >
              <span className="text-xl text-white">{module.icon}</span>
            </div>
            <h3 className="text-lg font-semibold">{module.title}</h3>
          </div>

          <div className="mb-4">
            <div className="flex justify-between mb-1 text-sm">
              <span>{completionPercentage}% ukończono</span>
              <span>
                {progress.completedLessons}/{totalLessons} lekcji
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            {progress.inProgressLessons > 0 ? (
              <span>{progress.inProgressLessons} lekcji w trakcie</span>
            ) : progress.completedLessons === totalLessons &&
              totalLessons > 0 ? (
              <span className="text-green-600 font-medium">
                Wszystkie lekcje ukończone!
              </span>
            ) : (
              <span>Rozpocznij naukę</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
