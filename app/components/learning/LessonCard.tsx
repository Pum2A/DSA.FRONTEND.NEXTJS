import { Lesson } from "@/app/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle, Clock, Lock, Star, X } from "lucide-react";
import Link from "next/link";

interface LessonCardProps {
  lesson: Lesson;
  moduleExternalId: string;
  completed?: boolean;
  inProgress?: boolean;
  isLocked?: boolean;
  index?: number;
}

export default function LessonCard({
  lesson,
  moduleExternalId,
  completed = false,
  inProgress = false,
  isLocked = false,
  index = 0,
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

  const hasRequiredSkills =
    lesson.requiredSkills && lesson.requiredSkills.length > 0;

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

        {hasRequiredSkills && !isLocked && (
          <div className="mt-2 flex flex-wrap gap-1">
            {lesson.requiredSkills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="px-4 pb-4 pt-1 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{lesson.estimatedTime}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3" />
          <span>{lesson.xpReward} XP</span>
        </div>
        {!isLocked && (
          <ArrowRight className="w-4 h-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:translate-x-0.5" />
        )}
      </CardFooter>
    </Card>
  );

  if (isLocked) {
    return <div className="block h-full">{content}</div>;
  }

  return (
    <Link
      href={`/learning/${moduleExternalId}/${lesson.externalId || lesson.id}`}
      className="block h-full group"
      passHref
    >
      {content}
    </Link>
  );
}

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
