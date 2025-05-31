"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface RecommendedLessonsProps {
  progressData: any;
}

export function RecommendedLessons({ progressData }: RecommendedLessonsProps) {
  // In a real application, you would fetch recommended lessons based on the user's progress
  // Here we're creating mock recommendations
  const recommended = [
    {
      id: "lesson-1",
      title: "Implementacja stosu w JavaScripcie",
      duration: "15 min",
      module: "Struktury danych",
    },
    {
      id: "lesson-2",
      title: "Algorytm QuickSort",
      duration: "20 min",
      module: "Algorytmy sortowania",
    },
    {
      id: "lesson-3",
      title: "Tablice asocjacyjne",
      duration: "10 min",
      module: "Struktury danych",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Zalecane dla Ciebie</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommended.map((lesson) => (
          <div
            key={lesson.id}
            className="p-3 border rounded-lg hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
          >
            <div className="flex justify-between">
              <div className="font-medium">{lesson.title}</div>
              <div className="text-xs text-muted-foreground">{lesson.duration}</div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">{lesson.module}</div>
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