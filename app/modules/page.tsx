"use client";

import Navbar from "@/app/components/Navbar";
import { ModuleDto } from "@/app/types/api/moduleTypes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Clock, Lock } from "lucide-react";
import Link from "next/link";

export default function ModulesPage() {
  const { data, isLoading } = useQuery<{
    modules: ModuleDto[];
    totalModules: number;
  }>({
    queryKey: ["allModules"],
    queryFn: async () => {
      const response = await fetch("/api/Lessons/modules", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch modules");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="space-y-4 mb-6">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-60 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const modules = data?.modules ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Moduły nauki</h1>
          <p className="text-muted-foreground mt-2">
            Wybierz moduł, aby rozpocząć naukę struktur danych i algorytmów
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.length > 0 ? (
            modules.map((module) => {
              const isLocked = !module.isActive;
              return (
                <Card
                  key={module.id}
                  className={`overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md ${
                    isLocked ? "opacity-80 grayscale-[50%]" : ""
                  }`}
                >
                  <div className="h-48 bg-gradient-to-r from-brand-600 to-brand-800 relative">
                    {module.iconUrl && (
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-40"
                        style={{ backgroundImage: `url(${module.iconUrl})` }}
                      />
                    )}
                    <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                      <div>
                        <Badge
                          variant={isLocked ? "outline" : "secondary"}
                          className={
                            isLocked
                              ? "border-white/40 text-white/90"
                              : "bg-white/20"
                          }
                        >
                          DSA
                        </Badge>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold mb-1">
                          {module.title}
                        </h2>
                        <div className="flex items-center text-sm text-white/80">
                          <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                          <span>{module.lessonCount || 0} lekcji</span>
                          <Clock className="h-3.5 w-3.5 ml-3 mr-1.5" />
                          <span>~{module.order * 30}min</span>
                        </div>
                      </div>
                    </div>
                    {isLocked && (
                      <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center">
                        <Lock className="h-12 w-12 text-white/80" />
                      </div>
                    )}
                  </div>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {module.description}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    {isLocked ? (
                      <Button className="w-full" variant="outline" disabled>
                        Ukończ poprzedni moduł, aby odblokować
                      </Button>
                    ) : (
                      <Button className="w-full" asChild>
                        <Link href={`/modules/${module.id}`}>
                          Przejdź do modułu
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-medium">Brak dostępnych modułów</h3>
              <p className="text-muted-foreground mt-2">
                Nowe moduły będą dostępne wkrótce.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
