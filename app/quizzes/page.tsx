"use client";

import Navbar from "@/app/components/Navbar";
import { QuizListItemDto } from "@/app/types/api/quizTypes";
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
import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

export default function QuizListPage() {
  // Pobierz wszystkie quizy
  const { data, isLoading } = useQuery<{ quizzes: QuizListItemDto[]; totalQuizzes: number }>({
    queryKey: ["allQuizzes"],
    queryFn: async () => {
      const response = await fetch("/api/Quiz/all", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch quizzes");
      return response.json();
    },
  });

  const quizzes = Array.isArray(data?.quizzes) ? data.quizzes : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Quizy</h1>
          <p className="text-muted-foreground mt-2">
            Przeglądaj wszystkie dostępne quizy na platformie.
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
            {quizzes.length > 0 ? quizzes.map((quiz) => {
              const isCompleted = !!quiz.isCompleted;
              const percentage = quiz.bestPercentage || 0;

              return (
                <Card 
                  key={quiz.id}
                  className={`overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md`}
                >
                  <CardHeader>
                    <CardTitle>{quiz.title}</CardTitle>
                    <CardDescription>
                      {quiz.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground mb-3 gap-3">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{Math.round(quiz.timeLimit / 60) || 1} min</span>
                      <span className="mx-2">•</span>
                      <span>{quiz.questionCount} pytań</span>
                      {quiz.xpReward > 0 && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{quiz.xpReward} XP</span>
                        </>
                      )}
                    </div>
                    <div className="mb-3">
                      {isCompleted && (
                        <>
                          <Progress value={percentage} className="h-2" />
                          <div className="text-xs text-right text-muted-foreground mt-1">
                            Twój najlepszy wynik: {percentage}%
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {isCompleted ? (
                      <Button className="w-full" variant="outline" asChild>
                        <Link href={`/quiz/${quiz.id}`}>Powtórz quiz</Link>
                      </Button>
                    ) : (
                      <Button className="w-full" asChild>
                        <Link href={`/quiz/${quiz.id}`}>
                          Rozpocznij
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            }) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-xl font-medium">Brak dostępnych quizów</h3>
                <p className="text-muted-foreground mt-2">Nowe quizy będą dostępne wkrótce.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}