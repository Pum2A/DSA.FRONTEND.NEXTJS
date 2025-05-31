"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { Book, CheckCircle, Clock, Star } from "lucide-react";

interface ActivityFeedProps {
  userId: string;
  limit?: number;
}

export function ActivityFeed({ userId, limit = 10 }: ActivityFeedProps) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["activities", userId, limit],
    queryFn: async () => {
      // This is a mock as there's no direct endpoint for activities
      // In a real app, you'd fetch from a proper endpoint
      const response = await fetch(`/api/Lessons/progress?limit=${limit}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }
      
      // Mock data for now - replace with actual API response
      return {
        activities: [
          {
            id: "1",
            type: "lesson_completed",
            title: "Wprowadzenie do tablic",
            date: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            xpGained: 15,
          },
          {
            id: "2",
            type: "quiz_completed",
            title: "Quiz: Tablice i podstawowe operacje",
            date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
            xpGained: 25,
            score: 85,
          },
          {
            id: "3",
            type: "lesson_completed",
            title: "Złożoność czasowa algorytmów",
            date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            xpGained: 20,
          },
          {
            id: "4",
            type: "streak_milestone",
            title: "3 dni nauki z rzędu!",
            date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            xpGained: 30,
          },
        ],
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "lesson_completed":
        return <Book className="h-4 w-4 text-blue-500" />;
      case "quiz_completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "streak_milestone":
        return <Star className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return diffInHours === 0 
        ? "mniej niż godzinę temu" 
        : `${diffInHours} ${diffInHours === 1 ? 'godzinę' : diffInHours < 5 ? 'godziny' : 'godzin'} temu`;
    }
    
    return new Intl.DateTimeFormat('pl-PL', { 
      day: 'numeric', 
      month: 'long', 
      hour: '2-digit', 
      minute: '2-digit' 
    }).format(date);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ostatnia aktywność</CardTitle>
          <CardDescription>Historia twoich działań na platformie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="rounded-full h-8 w-8 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ostatnia aktywność</CardTitle>
        <CardDescription>Historia twoich działań na platformie</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px] pr-4">
          {activities?.activities?.length ? (
            <div className="space-y-5">
              {activities.activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-2 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{activity.title}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(activity.date)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Star className="h-3.5 w-3.5 mr-1 text-amber-500" />
                      <span>+{activity.xpGained} XP</span>
                      
                      {activity.score && (
                        <div className="ml-3 flex items-center">
                          <CheckCircle className="h-3.5 w-3.5 mr-1 text-green-500" />
                          <span>Wynik: {activity.score}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nie znaleziono żadnej aktywności.</p>
              <p className="text-sm mt-1">
                Rozpocznij naukę, aby zobaczyć tutaj swoją historię!
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}