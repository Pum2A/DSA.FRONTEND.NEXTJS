import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, BookOpen, Lightbulb, Star } from "lucide-react";
import RecommendedModule from "../learning/RecommendedModule";
import { ProgressCardProps } from "../types";

export default function ProgressCard({
  stats,
  user,
  overallProgress,
  isLoading,
  isRefreshing,
  recommendedPath,
}: ProgressCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow border dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <BarChart3 className="text-indigo-500" /> Postęp nauki
        </CardTitle>
        <CardDescription>Całkowity postęp i kluczowe wskaźniki</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-4 rounded-xl flex items-center gap-3 border border-blue-100 dark:border-blue-900 transition-transform hover:scale-[1.02]">
            <div className="bg-gradient-to-br from-blue-400 to-indigo-500 p-2 rounded-lg shadow-inner text-white">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Poziom
              </div>
              {isLoading || isRefreshing ? (
                <Skeleton className="h-6 w-10 mt-0.5" />
              ) : (
                <div className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  {user?.level || 1}
                </div>
              )}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 p-4 rounded-xl flex items-center gap-3 border border-green-100 dark:border-green-900 transition-transform hover:scale-[1.02]">
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-2 rounded-lg shadow-inner text-white">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                XP
              </div>
              {isLoading || isRefreshing ? (
                <Skeleton className="h-6 w-16 mt-0.5" />
              ) : (
                <div className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  {user?.experiencePoints || 0}
                </div>
              )}
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 p-4 rounded-xl flex items-center gap-3 border border-yellow-100 dark:border-yellow-900 transition-transform hover:scale-[1.02]">
            <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-2 rounded-lg shadow-inner text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Lekcje
              </div>
              {isLoading || isRefreshing ? (
                <Skeleton className="h-6 w-14 mt-0.5" />
              ) : (
                <div className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  {stats?.completedLessonsCount || 0}/
                  {stats?.totalLessonsCount || 0}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      {recommendedPath && !isLoading && (
        <CardFooter className="pt-0">
          <RecommendedModule path={recommendedPath} />
        </CardFooter>
      )}
    </Card>
  );
}
