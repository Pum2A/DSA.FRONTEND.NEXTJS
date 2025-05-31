"use client";

import Navbar from "@/app/components/Navbar";
import { LessonDto } from "@/app/types/api/lessonTypes";
import { ModuleDetailsDto, ModuleProgressDto } from "@/app/types/api/moduleTypes";

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

  // Fetch module details
  const { data: moduleDetails, isLoading: moduleLoading } = useQuery<ModuleDetailsDto>({
    queryKey: ["module", moduleId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/Lessons/modules/${moduleId}`, {
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to fetch module");
        return response.json();
      } catch (error) {
        console.error("Error fetching module:", error);
        throw error;
      }
    },
  });

  const isLoading = moduleLoading;

  if (isLoading) {
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

  // Extract data
  const module = moduleDetails || {} as ModuleDetailsDto;
  const lessons = module.lessons || [];
  const progress = module.progress || {} as ModuleProgressDto;
  
  // Calculate progress percentage
  const progressPercentage = progress?.progressPercentage || 0;

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
          
          <div className="flex items-center gap-4">
            {module.iconUrl && (
              <img 
                src={module.iconUrl} 
                alt={module.title}
                className="w-12 h-12 rounded-lg"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">{module.title}</h1>
              <p className="text-muted-foreground mt-2">{module.description}</p>
            </div>
          </div>
          
          {/* Module progress */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Postęp modułu</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
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
              {lessons?.map((lesson: LessonDto) => {
                const isCompleted = !!lesson.isCompleted;
                const isLocked = !lesson.isActive;
                const lessonsCount = lesson.stepCount || 0;
                
                return (
                  <div 
                    key={lesson.id} 
                    className={`p-4 border rounded-lg flex justify-between items-center ${
                      isLocked 
                        ? 'bg-gray-50 dark:bg-gray-800/50 opacity-80' 
                        : 'hover:border-brand-300 dark:hover:border-brand-700 transition-colors'
                    }`}
                  >
                    <div className="flex items-center">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
                      ) : isLocked ? (
                        <Lock className="h-5 w-5 mr-3 text-gray-400" />
                      ) : (
                        <BookOpen className="h-5 w-5 mr-3 text-brand-500" />
                      )}
                      <div>
                        <div className={isLocked ? "text-muted-foreground" : ""}>
                          {lesson.title}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center">
                          <span>{lessonsCount} kroków</span>
                          {lesson.completedStepCount && lessonsCount > 0 && (
                            <span className="ml-2">
                              • Postęp: {Math.round((lesson.completedStepCount / lessonsCount) * 100)}%
                            </span>
                          )}
                          {lesson.xpReward > 0 && (
                            <span className="ml-2">• {lesson.xpReward} XP</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {isLocked ? (
                      <Button size="sm" variant="outline" disabled>Zablokowana</Button>
                    ) : isCompleted ? (
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/lessons/${lesson.id}`}>Powtórz</Link>
                      </Button>
                    ) : (
                      <Button size="sm" asChild>
                        <Link href={`/lessons/${lesson.id}`}>
                          {lesson.completedStepCount && lesson.completedStepCount > 0 ? "Kontynuuj" : "Rozpocznij"}
                        </Link>
                      </Button>
                    )}
                  </div>
                );
              })}
              
              {(!lessons || lessons.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  Ten moduł nie zawiera jeszcze żadnych lekcji.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Module quiz if available */}
        {module.quizzes && module.quizzes.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quizy modułowe</CardTitle>
              <CardDescription>
                Sprawdź swoją wiedzę z całego modułu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {module.quizzes.map((quiz) => (
                  <div key={quiz.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{quiz.title}</p>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <span>{quiz.questionCount} pytań</span>
                        <span className="mx-2">•</span>
                        <span>{Math.floor(quiz.timeLimit / 60)} min</span>
                        <span className="mx-2">•</span>
                        <span>{quiz.xpReward} XP</span>
                      </div>
                    </div>
                    <Button asChild>
                      <Link href={`/quiz/${quiz.id}`}>
                        {quiz.isCompleted ? "Powtórz quiz" : "Rozpocznij quiz"}
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}