import { LessonDto } from "@/app/types/lesson";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils"; // Zaimportuj cn (lub odpowiednik) do łączenia klas
import {
  ArrowRight,
  Award,
  CheckCircle,
  Clock,
  Lock,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";

interface LessonCardProps {
  lesson: LessonDto;
  moduleExternalId: string;
  completed?: boolean;
  inProgress?: boolean;
  isLocked?: boolean;
  index?: number;
  userXp?: number; // Dodane, opcjonalne pole do wyświetlania zdobytego XP
}

export default function LessonCard({
  lesson,
  moduleExternalId,
  completed = false,
  inProgress = false,
  isLocked = false,
  index = 0,
  userXp = 0, // Domyślnie 0 XP
}: LessonCardProps) {
  const statusIcon = completed ? (
    <CheckCircle className="h-5 w-5 text-green-500" />
  ) : inProgress ? (
    <X className="h-5 w-5 text-blue-500 " />
  ) : isLocked ? (
    <Lock className="h-5 w-5 text-gray-400" />
  ) : (
    <div className="h-5 w-5 rounded-full border-2 border-gray-400"></div>
  );

  const cardClasses = cn(
    "flex flex-col h-full border dark:border-gray-700 rounded-lg overflow-hidden transition-all duration-300 ease-in-out shadow-sm",
    isLocked
      ? "bg-gray-50 dark:bg-gray-800/50 opacity-70 cursor-not-allowed"
      : "bg-white dark:bg-gray-800 hover:shadow-lg hover:-translate-y-1 group"
  );

  // Oblicz postęp XP (używane do ukończonych lekcji)
  const xpProgress = completed
    ? 100
    : Math.min(Math.round((userXp / (lesson.xpReward || 1)) * 100), 99);

  const content = (
    <Card className={cardClasses}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-4 px-4">
        <CardTitle
          className={cn(
            "text-base font-semibold leading-tight tracking-tight",
            isLocked
              ? "text-gray-500 dark:text-gray-400"
              : "text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
          )}
        >
          {lesson.title}
        </CardTitle>
        {/* Ikona statusu */}
        <div className="flex-shrink-0 ml-2">{statusIcon}</div>
      </CardHeader>
      <CardContent className="px-4 pb-3 flex-grow">
        <p
          className={cn(
            "text-xs text-gray-600 dark:text-gray-400 line-clamp-2",
            isLocked && "text-gray-500"
          )}
        >
          {lesson.description}
        </p>
      </CardContent>
      <CardFooter className="px-4 pb-4 pt-1 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{lesson.estimatedTime}</span>
        </div>

        {/* XP z informacją o zdobytych punktach dla ukończonych/w trakcie lekcji */}
        <div className="flex items-center gap-1">
          {completed ? (
            <>
              <Award className="w-3 h-3 text-green-500" />
              <span className="text-green-500">{lesson.xpReward} XP</span>
            </>
          ) : userXp > 0 ? (
            <>
              <div className="relative">
                <Star className="w-3 h-3" />
                {/* Małe kółko z postępem XP */}
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              </div>
              <span>
                {userXp}/{lesson.xpReward} XP
              </span>
            </>
          ) : (
            <>
              <Star className="w-3 h-3" />
              <span>{lesson.xpReward} XP</span>
            </>
          )}
        </div>

        {/* Wskaźnik "Przejdź" na hover dla odblokowanych */}
        {!isLocked && (
          <ArrowRight className="w-4 h-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:translate-x-0.5" />
        )}
      </CardFooter>

      {/* Pasek postępu dla lekcji w trakcie */}
      {inProgress && !completed && userXp > 0 && (
        <div className="h-0.5 bg-gray-100 dark:bg-gray-700 w-full">
          <div
            className="h-full bg-blue-500"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      )}

      {/* Pasek ukończenia dla zakończonych lekcji */}
      {completed && <div className="h-0.5 w-full bg-green-500"></div>}
    </Card>
  );

  // Jeśli lekcja jest zablokowana, renderuj div zamiast linku
  if (isLocked) {
    return <div className="block h-full">{content}</div>;
  }

  // W przeciwnym razie, renderuj link
  return (
    <Link
      href={`/learning/${moduleExternalId}/${lesson.externalId}`}
      className="block h-full group"
      passHref
    >
      {content}
    </Link>
  );
}

// Szkielet dla LessonCard
export function LessonCardSkeleton() {
  return (
    <Card className="flex flex-col h-full border dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-4 px-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </CardHeader>
      <CardContent className="px-4 pb-3 flex-grow">
        <Skeleton className="h-3 w-full mb-1" />
        <Skeleton className="h-3 w-5/6" />
      </CardContent>
      <CardFooter className="px-4 pb-4 pt-1 flex justify-between items-center text-xs">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-3 w-1/4" />
      </CardFooter>
    </Card>
  );
}
