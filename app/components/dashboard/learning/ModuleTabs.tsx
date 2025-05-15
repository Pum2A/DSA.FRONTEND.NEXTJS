import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Medal, Star } from "lucide-react";
import { useMemo } from "react";
import { ModuleTabsProps } from "../types";
import EmptyModuleMessage from "./EmptyModuleMessage";
import LearningPathCard from "./LearningPathCard";

export default function ModuleTabs({
  learningPaths,
  isLoading,
}: ModuleTabsProps) {
  // Kategoryzacja ścieżek
  const { inProgressPaths, notStartedPaths, completedPaths } = useMemo(() => {
    const inProgress = learningPaths.filter(
      (path) => path.progress > 0 && path.progress < 100
    );
    const notStarted = learningPaths.filter((path) => path.progress === 0);
    const completed = learningPaths.filter((path) => path.progress === 100);

    return {
      inProgressPaths: inProgress,
      notStartedPaths: notStarted,
      completedPaths: completed,
    };
  }, [learningPaths]);

  return (
    <Tabs defaultValue="in-progress">
      <TabsList className="grid grid-cols-3 w-full sm:w-auto sm:inline-grid mb-4 h-auto sm:h-10 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <TabsTrigger
          value="in-progress"
          className="relative px-2 py-1.5 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-md"
        >
          W trakcie
          {inProgressPaths.length > 0 && !isLoading && (
            <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-[10px] bg-indigo-500 text-white rounded-full">
              {inProgressPaths.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="not-started"
          className="px-2 py-1.5 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-md"
        >
          Do rozpoczęcia
          {notStartedPaths.length > 0 && !isLoading && (
            <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-[10px] bg-gray-400 text-white rounded-full">
              {notStartedPaths.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="completed"
          className="px-2 py-1.5 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-md"
        >
          Ukończone
          {completedPaths.length > 0 && !isLoading && (
            <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-[10px] bg-green-500 text-white rounded-full">
              {completedPaths.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
      <div className="min-h-[250px]">
        <TabsContent value="in-progress">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <Skeleton className="h-56 w-full rounded-lg" />
              <Skeleton className="h-56 w-full rounded-lg sm:hidden lg:block" />
            </div>
          ) : inProgressPaths.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {inProgressPaths.map((path) => (
                <LearningPathCard
                  key={path.id}
                  path={path}
                  variant="inProgress"
                />
              ))}
            </div>
          ) : (
            <EmptyModuleMessage
              icon={<BookOpen className="mx-auto h-10 w-10 text-gray-400" />}
              title="Brak modułów w trakcie."
              subtitle="Rozpocznij nową ścieżkę!"
            />
          )}
        </TabsContent>

        <TabsContent value="not-started">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <Skeleton className="h-56 w-full rounded-lg" />
              <Skeleton className="h-56 w-full rounded-lg sm:hidden lg:block" />
            </div>
          ) : notStartedPaths.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {notStartedPaths.map((path) => (
                <LearningPathCard
                  key={path.id}
                  path={path}
                  variant="notStarted"
                />
              ))}
            </div>
          ) : (
            <EmptyModuleMessage
              icon={<Star className="mx-auto h-10 w-10 text-gray-400" />}
              title="Wszystkie moduły rozpoczęte."
              subtitle="Świetnie!"
            />
          )}
        </TabsContent>

        <TabsContent value="completed">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <Skeleton className="h-56 w-full rounded-lg" />
              <Skeleton className="h-56 w-full rounded-lg sm:hidden lg:block" />
            </div>
          ) : completedPaths.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {completedPaths.map((path) => (
                <LearningPathCard
                  key={path.id}
                  path={path}
                  variant="completed"
                />
              ))}
            </div>
          ) : (
            <EmptyModuleMessage
              icon={<Medal className="mx-auto h-10 w-10 text-gray-400" />}
              title="Nie ukończono jeszcze modułów."
              subtitle="Kontynuuj naukę!"
            />
          )}
        </TabsContent>
      </div>
    </Tabs>
  );
}
