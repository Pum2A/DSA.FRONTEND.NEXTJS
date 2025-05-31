"use client";

import { ModuleDto } from "@/app/types/api/moduleTypes";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ModulesListProps {
  // Accepts either undefined or an array, so it's always safe to map.
  modules?: ModuleDto[];
  isLoading: boolean;
}

export function ModulesList({ modules, isLoading }: ModulesListProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <CardTitle className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></CardTitle>
              <CardDescription className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2"></CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </div>
                    <div className="h-2 mt-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Always default to empty array for mapping!
  const safeModules = Array.isArray(modules) ? modules : [];

  if (safeModules.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Moduły nauki</CardTitle>
          <CardDescription>Nie znaleziono żadnych modułów.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Moduły są aktualnie niedostępne.</p>
            <Button className="mt-4" asChild>
              <Link href="/lessons">Przeglądaj dostępne lekcje</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {safeModules.map((module) => {
        // Postęp można wyliczyć, jeśli API zwraca np. completedLessonCount:
        const completed = module.completedLessonCount || 0;
        const total = module.lessonCount || 0;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return (
          <Card key={module.id}>
            <CardHeader>
              <CardTitle>{module.title}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Module stats */}
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <div className="flex gap-6">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>{module.lessonCount || 0} lekcji</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>{completed} ukończonych</span>
                    </div>
                  </div>
                  <div>
                    Postęp: {percentage}%
                  </div>
                </div>

                {/* Progress bar */}
                <Progress value={percentage} className="h-2" />

                {/* Link to module page */}
                <Button 
                  variant="ghost" 
                  className="w-full justify-between mt-4" 
                  asChild
                >
                  <Link href={`/modules/${module.id}`}>
                    <span>Przejdź do modułu</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}