import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { RecommendedModuleProps } from "../types";

export default function RecommendedModule({ path }: RecommendedModuleProps) {
  return (
    <div className="w-full bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 p-4 rounded-lg border dark:border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-base">
          Rekomendowane dla Ciebie
        </h3>
        <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full">
          {path.progress > 0 ? "Kontynuuj naukę" : "Rozpocznij nowy moduł"}
        </span>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 shadow"
          style={{
            backgroundColor: path.iconColor || "#6366F1",
          }}
        >
          {path.icon}
        </div>
        <div className="flex-grow w-full sm:w-auto">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
            {path.title}
          </h4>
          <Progress
            value={path.progress}
            className="h-1.5 mt-1 bg-gray-200 dark:bg-gray-600 [&>div]:bg-indigo-500"
            aria-label={`Postęp: ${path.progress}%`}
          />
        </div>
        <Link
          href={`/learning/${path.id}`}
          className="w-full sm:w-auto mt-2 sm:mt-0"
        >
          <Button
            size="sm"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
          >
            {path.progress > 0 ? "Kontynuuj" : "Rozpocznij"}{" "}
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
