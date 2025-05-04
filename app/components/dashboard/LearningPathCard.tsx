import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { LearningPathCardProps } from "./types";

export default function LearningPathCard({
  path,
  variant = "default",
}: LearningPathCardProps) {
  // Różne warianty karty
  const getCardClasses = () => {
    switch (variant) {
      case "completed":
        return "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30 shadow-sm hover:shadow-md transition-shadow flex flex-col opacity-80 hover:opacity-100";
      case "inProgress":
      case "notStarted":
      default:
        return "shadow-sm hover:shadow-md transition-shadow border dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col";
    }
  };

  // Inny nagłówek dla ukończonych modułów
  const renderHeader = () => {
    if (variant === "completed") {
      return (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">
              {path.title}
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-400 font-medium text-xs">
              Ukończono
            </CardDescription>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: path.iconColor || "#6366F1" }}
        >
          {path.icon}
        </div>
        <div>
          <CardTitle className="text-base font-semibold">
            {path.title}
          </CardTitle>
          {variant === "inProgress" && (
            <CardDescription className="text-xs">
              {path.progress}% ukończono
            </CardDescription>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className={getCardClasses()}>
      <CardHeader className="pb-3">{renderHeader()}</CardHeader>
      <CardContent
        className={`pb-4 pt-0 flex-grow ${
          variant === "inProgress" ? "pt-0" : ""
        }`}
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {path.description}
        </p>

        {variant === "inProgress" && (
          <>
            <Progress
              value={path.progress}
              className="h-1.5 mb-1 bg-gray-200 dark:bg-gray-700 [&>div]:bg-indigo-500"
              aria-label={`Postęp: ${path.progress}%`}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {path.completedLessons}/{path.totalLessons} lekcji
            </div>
          </>
        )}

        {variant === "completed" && (
          <div className="text-xs text-green-600 dark:text-green-300 font-medium">
            {path.completedLessons}/{path.totalLessons} lekcji
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link href={`/learning/${path.id}`} className="w-full">
          <Button
            size="sm"
            className={`w-full ${
              variant === "inProgress"
                ? "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
                : variant === "completed"
                ? "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                : ""
            }`}
            variant={variant === "inProgress" ? "default" : "outline"}
          >
            {variant === "inProgress"
              ? "Kontynuuj"
              : variant === "completed"
              ? "Powtórz"
              : "Rozpocznij"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
