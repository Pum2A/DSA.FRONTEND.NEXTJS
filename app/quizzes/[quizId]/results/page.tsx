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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ChevronLeft, Info, Loader2, Trophy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type ModuleDto = {
  id: string;
  title: string;
  quizzes?: QuizBasicDto[];
};

type QuizBasicDto = {
  id: string;
  title: string;
  moduleTitle?: string;
};

type QuizAttempt = {
  id: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  xpEarned: number;
  grade: string;
  isPassing: boolean;
  startedAt: string;
  completedAt: string;
  duration: number; // in milliseconds
};

type QuizResult = {
  quizId: string;
  quizTitle: string;
  attemptCount: number;
  bestScore?: number;
  bestPercentage?: number;
  firstAttemptDate?: string;
  lastAttemptDate?: string;
  attempts: QuizAttempt[];
};

type ModulesResponse = {
  modules: ModuleDto[];
  totalModules: number;
};

export default function ResultsPage() {
  const { toast } = useToast();
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  // Fetch all modules to get quizzes
  const { data: modules, isLoading: modulesLoading } =
    useQuery<ModulesResponse>({
      queryKey: ["allModules"],
      queryFn: async () => {
        const res = await fetch("/api/Lessons/modules", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch modules");
        return res.json();
      },
    });

  // Fetch results for selected quiz
  const { data: quizResults, isLoading: resultsLoading } = useQuery<QuizResult>(
    {
      queryKey: ["quizResults", selectedQuizId],
      queryFn: async () => {
        if (!selectedQuizId) return null;
        const res = await fetch(`/api/Quiz/${selectedQuizId}/results`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch quiz results");
        return res.json();
      },
      enabled: !!selectedQuizId,
    }
  );

  // Get quizzes from all modules
  const allQuizzes =
    modules?.modules?.flatMap((module: ModuleDto) => {
      // Quizzes might not be loaded yet in modules response
      if (!module.quizzes) return [];
      return module.quizzes.map((quiz: QuizBasicDto) => ({
        ...quiz,
        moduleTitle: module.title,
      }));
    }) || [];

  // Set first quiz as default if we have quizzes and none selected
  if (allQuizzes.length > 0 && !selectedQuizId && !modulesLoading) {
    setSelectedQuizId(allQuizzes[0].id);
  }

  const isLoading = modulesLoading || (resultsLoading && !!selectedQuizId);

  // Format the duration in minutes and seconds
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-brand-500" />
            <span className="ml-2 text-xl">Ładowanie wyników...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <Trophy className="mr-2 h-6 w-6 text-amber-500" />
            Moje wyniki quizów
          </h1>
          <Button variant="outline" asChild>
            <Link href="/quizzes">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Powrót do quizów
            </Link>
          </Button>
        </div>

        {/* Quiz selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Wybierz quiz</CardTitle>
            <CardDescription>
              Zobacz swoje wyniki dla poszczególnych quizów
            </CardDescription>
          </CardHeader>
          <CardContent>
            {allQuizzes.length > 0 ? (
              <Select
                value={selectedQuizId || ""}
                onValueChange={(value) => setSelectedQuizId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz quiz" />
                </SelectTrigger>
                <SelectContent>
                  {allQuizzes.map(
                    (quiz: QuizBasicDto & { moduleTitle?: string }) => (
                      <SelectItem key={quiz.id} value={quiz.id}>
                        {quiz.moduleTitle} - {quiz.title}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  Nie znaleziono żadnych quizów.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quiz results */}
        {quizResults ? (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">
                {quizResults.quizTitle}
              </h2>
              <div className="flex flex-wrap gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Liczba podejść
                  </p>
                  <p className="text-2xl font-bold">
                    {quizResults.attemptCount}
                  </p>
                </div>

                {quizResults.bestPercentage !== undefined && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Najlepszy wynik
                    </p>
                    <p className="text-2xl font-bold">
                      {quizResults.bestPercentage}%
                    </p>
                  </div>
                )}

                {quizResults.firstAttemptDate && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Pierwsze podejście
                    </p>
                    <p className="text-base font-medium">
                      {new Date(
                        quizResults.firstAttemptDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {quizResults.lastAttemptDate && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Ostatnie podejście
                    </p>
                    <p className="text-base font-medium">
                      {new Date(
                        quizResults.lastAttemptDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* List of attempts */}
            <h3 className="text-xl font-medium mb-4">Historia podejść</h3>

            {quizResults.attempts.length > 0 ? (
              <div className="space-y-4">
                {quizResults.attempts.map((attempt, index) => (
                  <Card
                    key={attempt.id}
                    className={
                      attempt.isPassing ? "border-green-300" : "border-red-300"
                    }
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">
                          Podejście #{quizResults.attempts.length - index}
                        </CardTitle>
                        <div
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            attempt.isPassing
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          Ocena: {attempt.grade}
                        </div>
                      </div>
                      <CardDescription className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {new Date(attempt.completedAt).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Wynik: {attempt.scorePercentage}%</span>
                            <span>
                              {attempt.correctAnswers}/{attempt.totalQuestions}{" "}
                              poprawnych
                            </span>
                          </div>
                          <Progress
                            value={attempt.scorePercentage}
                            className={`h-2 ${
                              attempt.isPassing ? "bg-green-100" : "bg-red-100"
                            }`}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="p-2 bg-muted rounded">
                            <span className="text-muted-foreground">Czas:</span>{" "}
                            <span className="font-medium">
                              {formatDuration(attempt.duration)}
                            </span>
                          </div>
                          <div className="p-2 bg-muted rounded">
                            <span className="text-muted-foreground">XP:</span>{" "}
                            <span className="font-medium">
                              {attempt.xpEarned} punktów
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <Info className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
                <p className="text-xl font-medium">Brak historii</p>
                <p className="text-muted-foreground">
                  Nie masz jeszcze podejść do tego quizu
                </p>
                <Button className="mt-4" asChild>
                  <Link href={`/quizzes/${quizResults.quizId}`}>
                    Rozpocznij quiz
                  </Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          selectedQuizId && (
            <div className="text-center py-12 border rounded-lg">
              <Info className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
              <p className="text-xl font-medium">Brak wyników</p>
              <p className="text-muted-foreground">
                Nie masz jeszcze podejść do tego quizu
              </p>
              <Button className="mt-4" asChild>
                <Link href={`/quizzes/${selectedQuizId}`}>Rozpocznij quiz</Link>
              </Button>
            </div>
          )
        )}

        {!selectedQuizId && allQuizzes.length === 0 && (
          <div className="text-center py-12 border rounded-lg">
            <Info className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
            <p className="text-xl font-medium">Brak dostępnych quizów</p>
            <p className="text-muted-foreground">
              Nie znaleziono żadnych quizów do wyświetlenia
            </p>
            <Button className="mt-4" asChild>
              <Link href="/modules">Przeglądaj moduły</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
