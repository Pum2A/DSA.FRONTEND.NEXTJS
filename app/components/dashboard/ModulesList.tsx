"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle, ChevronRight, Lock } from "lucide-react";
import Link from "next/link";

interface ModulesListProps {
  modules: any[];
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

  // If no modules, show placeholder
  if (!modules || modules.length === 0) {
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
      {modules.map((module) => (
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
                    <span>{module.lessonsCount || 0} lekcji</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span>{module.completedLessons || 0} ukończonych</span>
                  </div>
                </div>
                <div>
                  Postęp: {module.progress || 0}%
                </div>
              </div>

              {/* Progress bar */}
              <Progress value={module.progress || 0} className="h-2" />

              {/* Lesson list */}
              <div className="mt-6 space-y-3">
                {(module.lessons || []).slice(0, 3).map((lesson: any) => (
                  <div 
                    key={lesson.id} 
                    className={`p-4 border rounded-lg flex justify-between items-center ${
                      lesson.isLocked 
                        ? 'bg-gray-50 dark:bg-gray-800/50 opacity-80' 
                        : 'hover:border-brand-300 dark:hover:border-brand-700 transition-colors'
                    }`}
                  >
                    <div className="flex items-center">
                      {lesson.isCompleted ? (
                        <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
                      ) : lesson.isLocked ? (
                        <Lock className="h-5 w-5 mr-3 text-gray-400" />
                      ) : (
                        <BookOpen className="h-5 w-5 mr-3 text-brand-500" />
                      )}
                      <span className={lesson.isLocked ? "text-muted-foreground" : ""}>
                        {lesson.title}
                      </span>
                    </div>
                    
                    {lesson.isLocked ? (
                      <Button size="sm" variant="outline" disabled>Zablokowana</Button>
                    ) : lesson.isCompleted ? (
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/lessons/${lesson.id}`}>Powtórz</Link>
                      </Button>
                    ) : (
                      <Button size="sm" asChild>
                        <Link href={`/lessons/${lesson.id}`}>
                          {lesson.inProgress ? "Kontynuuj" : "Rozpocznij"}
                        </Link>
                      </Button>
                    )}
                  </div>
                ))}

                {/* More lessons indicator */}
                {(module.lessons || []).length > 3 && (
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between" 
                    asChild
                  >
                    <Link href={`/modules/${module.id}`}>
                      <span>Zobacz wszystkie lekcje ({module.lessons.length})</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}