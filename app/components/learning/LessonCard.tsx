import { Lesson } from "@/app/types";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface LessonCardProps {
  lesson: Lesson;
  moduleExternalId: string;
  completed?: boolean;
  inProgress?: boolean;
}

export default function LessonCard({
  lesson,
  moduleExternalId,
  completed = false,
  inProgress = false,
}: LessonCardProps) {
  return (
    <Link
      href={`/learning/${moduleExternalId}/${lesson.externalId}`}
      className="block"
    >
      <Card
        className={`h-full border-l-4 hover:shadow-lg transition-shadow duration-200 ${
          completed
            ? "border-green-500 bg-green-50"
            : inProgress
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300"
        }`}
      >
        <CardContent>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold">{lesson.title}</h3>

            {completed && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Ukończono
              </span>
            )}

            {inProgress && !completed && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                W trakcie
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-4 line-clamp-3">
            {lesson.description}
          </p>

          <div className="flex justify-between text-sm text-gray-500">
            <span>{lesson.estimatedTime}</span>
            <span>{lesson.xpReward} XP</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
