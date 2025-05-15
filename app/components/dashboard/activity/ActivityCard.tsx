import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Clock } from "lucide-react";
import { ActivityCardProps } from "../types";

// Komponent dla pojedynczego szkieletu karty
const SkeletonCard = ({ className = "" }: { className?: string }) => (
  <div className={`flex gap-3 animate-pulse ${className}`}>
    <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
    <div className="space-y-1.5 flex-grow">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
    </div>
  </div>
);

export default function ActivityCard({
  activities,
  isLoading,
  isRefreshing,
}: ActivityCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow border dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="text-teal-500" /> Ostatnia aktywność
        </CardTitle>
        <CardDescription>Twoje najnowsze działania</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-5 max-h-96 overflow-y-auto pr-1 -mr-1">
          {(isLoading || isRefreshing) &&
            !activities.length &&
            Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}

          {!isLoading && !isRefreshing && activities.length > 0 && (
            <ul className="-mb-5">
              {activities.map((activity, activityIdx) => (
                <li key={activity.id} className="relative pb-5">
                  {activityIdx !== activities.length - 1 && (
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

          {!isLoading && !isRefreshing && activities.length === 0 && (
            <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
              Brak aktywności.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
