"use client";


import { LessonDto } from "@/app/types/api/lessonTypes";
import { UserProgressResponse } from "@/app/types/api/progressTypes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface RecommendedLessonsProps {
  progressData: UserProgressResponse | null | undefined;
}

export function RecommendedLessons({ progressData }: RecommendedLessonsProps) {
  // Fetch recommended lessons based on user progress
  const { data: recommendedLessons, isLoading } = useQuery<LessonDto[]>({
    queryKey: ["recommendedLessons", progressData?.completedLessons],
    queryFn: async () => {
      // In a production app, this would be a real API call to get recommendations
      // based on user progress, history, and algorithm
      
      // For now, we'll simulate a delay and return mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return [
        {
          id: "lesson-1",
          moduleId: "module-1",
          title: "Implementacja stosu w JavaScripcie",
          description: "Nauka implementacji stosu w języku JavaScript",
          xpReward: 15,
          order: 1,
          isActive: true,
          stepCount: 5,
          completedStepCount: 0
        },
        {
          id: "lesson-2",
          moduleId: "module-2",
          title: "Algorytm QuickSort",
          description: "Algorytm QuickSort: implementacja i analiza złożoności",
          xpReward: 20,
          order: 1,
          isActive: true,
          stepCount: 7,
          completedStepCount: 0
        },
        {
          id: "lesson-3",
          moduleId: "module-1",
          title: "Tablice asocjacyjne",
          description: "Wprowadzenie do tablic asocjacyjnych (hash map)",
          xpReward: 10,
          order: 2,
          isActive: true,
          stepCount: 4,
          completedStepCount: 0
        },
      ];
    },
    enabled: !!progressData,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Zalecane dla Ciebie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-3 border rounded-lg animate-pulse">
              <div className="flex justify-between">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-2"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Zalecane dla Ciebie</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendedLessons?.map((lesson) => (
          <div
            key={lesson.id}
            className="p-3 border rounded-lg hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
          >
            <div className="flex justify-between">
              <div className="font-medium">{lesson.title}</div>
              <div className="text-xs text-muted-foreground">{lesson.stepCount} kroków</div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">{lesson.description}</div>
          </div>
        ))}
        
        <Button variant="ghost" className="w-full justify-between mt-2" asChild>
          <Link href="/lessons">
            <span>Zobacz więcej lekcji</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}