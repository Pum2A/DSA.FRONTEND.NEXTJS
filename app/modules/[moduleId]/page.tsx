"use client";

import Navbar from "@/app/components/Navbar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CheckCircle, ChevronLeft, Lock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ModulePage() {
  const { moduleId } = useParams() as { moduleId: string };

  const { data: module, isLoading } = useQuery({
    queryKey: ["module", moduleId],
    queryFn: async () => {
      const response = await fetch(`/api/Lessons/modules/${moduleId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch module");
      }

      return response.json();
    },
  });

  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ["moduleLessons", moduleId],
    queryFn: async () => {
      const response = await fetch(`/api/Lessons/modules/${moduleId}/lessons`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch module lessons");
      }

      return response.json();
    },
    enabled: !!moduleId,
  });

  if (isLoading || lessonsLoading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Powrót do dashboardu
            </Link>
          </Button>
          
          <h1 className="text-3xl font-bold">{module?.title}</h1>
          <p className="text-muted-foreground mt-2">{module?.description}</p>
          
          {/* Module progress */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Postęp modułu</span>
              <span className="font-medium">{module?.progress || 0}%</span>
            </div>
            <Progress value={module?.progress || 0} className="h-2" />
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Lekcje w tym module</CardTitle>
            <CardDescription>
              Ukończ wszystkie lekcje, aby przejść do następnego modułu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lessons?.map((lesson: any) => (
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
                    <div>
                      <div className={lesson.isLocked ? "text-muted-foreground" : ""}>
                        {lesson.title}
                      </div>
                      {lesson.duration && (
                        <div className="text-xs text-muted-foreground">
                          Czas trwania: {lesson.duration}
                        </div>
                      )}
                    </div>
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
              
              {(!lessons || lessons.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  Ten moduł nie zawiera jeszcze żadnych lekcji.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Module quiz if available */}
        {module?.hasQuiz && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quiz modułowy</CardTitle>
              <CardDescription>
                Sprawdź swoją wiedzę z całego modułu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p>Quiz: {module.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {module.quizCompleted ? "Ukończony" : "Nieukończony"}
                  </p>
                </div>
                <Button asChild>
                  <Link href={`/quiz/modules/${moduleId}`}>
                    {module.quizCompleted ? "Powtórz quiz" : "Rozpocznij quiz"}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}