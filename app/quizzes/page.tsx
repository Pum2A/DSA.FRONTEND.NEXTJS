"use client";

import Navbar from "@/app/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Activity, Clock, FileCheck, Loader2, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type ModuleDto = {
  id: string;
  title: string;
  description: string;
};

type QuizDto = {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  timeLimit: number; // w minutach
  isActive: boolean;
  questionCount: number;
  isCompleted: boolean;
  bestScore?: number;
  bestPercentage?: number;
  attemptCount: number;
};

type ModulesResponse = {
  modules: ModuleDto[];
  totalModules: number;
};

type ModuleQuizzesResponse = {
  moduleId: string;
  moduleTitle: string;
  quizzes: QuizDto[];
  totalQuizzes: number;
};

export default function QuizzesPage() {
  const { toast } = useToast();
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [allModuleIds, setAllModuleIds] = useState<string[]>([]);

  // Pobierz wszystkie moduły
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

  // Ustaw pierwszy moduł jako domyślny
  useEffect(() => {
    if (
      modules &&
      Array.isArray(modules.modules) &&
      modules.modules.length > 0
    ) {
      const moduleIds = modules.modules.map((m: ModuleDto) => m.id);
      setAllModuleIds(moduleIds);
      if (!selectedModuleId) {
        setSelectedModuleId(moduleIds[0]);
      }
    }
  }, [modules, selectedModuleId]);

  // Pobierz quizy dla wybranego modułu
  const { data: quizzes, isLoading: quizzesLoading } =
    useQuery<ModuleQuizzesResponse>({
      queryKey: ["moduleQuizzes", selectedModuleId],
      queryFn: async () => {
        if (!selectedModuleId) return null;
        const res = await fetch(`/api/Quiz/modules/${selectedModuleId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch quizzes");
        return res.json();
      },
      enabled: !!selectedModuleId,
    });

  const isLoading = modulesLoading || (quizzesLoading && !!selectedModuleId);

  // Zmień wybrany moduł
  const handleModuleChange = (moduleId: string) => {
    setSelectedModuleId(moduleId);
  };

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-brand-500" />
            <span className="ml-2 text-xl">Ładowanie quizów...</span>
          </div>
        </div>
      </div>
    );
  }

  const modulesList = modules?.modules || [];
  const moduleQuizzes = quizzes?.quizzes || [];
  const currentModule = modulesList.find(
    (module: ModuleDto) => module.id === selectedModuleId
  );

  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Quizy</h1>
          <Link href="/results">
            <Button variant="outline" className="flex items-center">
              <Trophy className="mr-2 h-4 w-4" />
              Moje wyniki
            </Button>
          </Link>
        </div>

        {/* Module selector */}
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-3">Wybierz moduł:</h2>
          <div className="flex flex-wrap gap-2">
            {modulesList.map((module: ModuleDto) => (
              <Button
                key={module.id}
                variant={selectedModuleId === module.id ? "default" : "outline"}
                onClick={() => handleModuleChange(module.id)}
              >
                {module.title}
              </Button>
            ))}
          </div>
        </div>

        {/* Current module info */}
        {currentModule && (
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <h2 className="text-xl font-semibold">{currentModule.title}</h2>
            <p className="text-muted-foreground">{currentModule.description}</p>
          </div>
        )}

        {/* Quizzes list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {moduleQuizzes.length > 0 ? (
            moduleQuizzes.map((quiz: QuizDto) => (
              <Card key={quiz.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{quiz.title}</span>
                    {quiz.isCompleted && (
                      <span className="text-green-600 bg-green-100 dark:bg-green-900/20 p-1 rounded text-xs">
                        Ukończony
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {quiz.description}
                  </p>
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Limit czasu: {quiz.timeLimit / 60} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-muted-foreground" />
                      <span>Pytań: {quiz.questionCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span>Nagroda: {quiz.xpReward} XP</span>
                    </div>
                  </div>

                  {quiz.isCompleted && quiz.bestPercentage !== undefined && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Najlepszy wynik</span>
                        <span className="font-semibold">
                          {quiz.bestPercentage}%
                        </span>
                      </div>
                      <Progress value={quiz.bestPercentage} className="h-1.5" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Liczba podejść: {quiz.attemptCount}
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href={`/quizzes/${quiz.id}`}>
                      {quiz.isCompleted
                        ? "Spróbuj ponownie"
                        : "Rozpocznij quiz"}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-medium">Brak dostępnych quizów</h3>
              <p className="text-muted-foreground mt-2">
                Ten moduł nie zawiera jeszcze quizów.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
