"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { BookOpen, Brain, CheckCircle2, Trophy } from "lucide-react";

interface UserStatsProps {
  user: any;
  progressData: any;
}

export function UserStats({ user, progressData }: UserStatsProps) {
  // Calculate stats
  const completedLessons = progressData?.completedLessons || 0;
  const completedQuizzes = progressData?.completedQuizzes || 0;
  const bestScore = progressData?.bestQuizScore || 0;
  const xpPoints = user?.xpPoints || 0;

  const stats = [
    {
      name: "Ukończone lekcje",
      value: completedLessons,
      icon: <BookOpen className="h-4 w-4" />,
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      name: "Ukończone quizy",
      value: completedQuizzes,
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      name: "Najlepszy wynik",
      value: `${bestScore}%`,
      icon: <Trophy className="h-4 w-4" />,
      color: "text-yellow-500",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    },
    {
      name: "Zdobyte XP",
      value: xpPoints,
      icon: <Brain className="h-4 w-4" />,
      color: "text-purple-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Twoje statystyki</CardTitle>
        <CardDescription>Podsumowanie twojej nauki</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="flex flex-col items-center p-3 rounded-lg border"
            >
              <div className={`${stat.bgColor} p-2 rounded-full ${stat.color} mb-2`}>
                {stat.icon}
              </div>
              <div className="font-bold text-xl">{stat.value}</div>
              <div className="text-xs text-muted-foreground text-center">
                {stat.name}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}