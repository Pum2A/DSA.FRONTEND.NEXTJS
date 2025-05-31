"use client";

import Navbar from "@/app/components/Navbar";
import { LessonDto } from "@/app/types/api/lessonTypes";
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
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

export default function LessonsPage() {
  // Pobierz wszystkie lekcje
  const { data, isLoading } = useQuery<{ lessons: LessonDto[]; totalLessons: number }>({
    queryKey: ["allLessons"],
    queryFn: async () => {
      const response = await fetch("/api/Lessons/all", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch lessons");
      return response.json();
    },
  });

  const lessons = Array.isArray(data?.lessons) ? data.lessons : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Lekcje</h1>
          <p className="text-muted-foreground mt-2">
            Przeglądaj wszystkie dostępne lekcje na platformie.
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 rounded-lg bg-gray-200 dark:bg-gray-700 mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.length > 0 ? lessons.map((lesson) => {
              const isLocked = !lesson.isActive;
              const isCompleted = !!lesson.isCompleted;
              const totalSteps = lesson.stepCount || 0;
              const completedSteps = lesson.completedStepCount || 0;
              const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

              return (
                <Card 
                  key={lesson.id}
                  className={`overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md ${
                    isLocked ? "opacity-80 grayscale-[50%]" : ""
                  }`}
                >
                  <CardHeader>
                    <CardTitle>{lesson.title}</CardTitle>
                    <CardDescription>
                      {lesson.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>{totalSteps} kroków</span>
                      {lesson.xpReward > 0 && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{lesson.xpReward} XP</span>
                        </>
                      )}
                    </div>
                    <div className="mb-3">
                      <Progress value={percentage} className="h-2" />
                      <div className="text-xs text-right text-muted-foreground mt-1">
                        Postęp: {percentage}%
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {isLocked ? (
                      <Button className="w-full" variant="outline" disabled>
                        Zablokowana
                      </Button>
                    ) : isCompleted ? (
                      <Button className="w-full" variant="outline" asChild>
                        <Link href={`/lessons/${lesson.id}`}>Powtórz</Link>
                      </Button>
                    ) : (
                      <Button className="w-full" asChild>
                        <Link href={`/lessons/${lesson.id}`}>
                          {completedSteps > 0 ? "Kontynuuj" : "Rozpocznij"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            }) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-xl font-medium">Brak dostępnych lekcji</h3>
                <p className="text-muted-foreground mt-2">Nowe lekcje będą dostępne wkrótce.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}