"use client";

import { ActivityType, UserActivityItemDto } from "@/app/types/api/userTypes";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { Book, CheckCircle, Clock, Star, Trophy } from "lucide-react";

interface ActivityFeedProps {
  userId: string;
  limit?: number;
}

export function ActivityFeed({ userId, limit = 10 }: ActivityFeedProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["activities", userId, limit],
    queryFn: async (): Promise<{ activities: UserActivityItemDto[] }> => {
      try {
        // In a real implementation, you'd fetch from your API
        // This is mocking the fetch, as we don't have a direct endpoint for activities
        const response = await fetch(`/api/User/activities?limit=${limit}`, {
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
              type: ActivityType.LessonCompleted,
              title: "Wprowadzenie do tablic",
              description: "Ukończyłeś lekcję Wprowadzenie do tablic",
              xpEarned: 15,
              createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              relatedEntityId: "lesson-1",
              relatedEntityType: "Lesson"
            },
            {
              id: "2",
              type: ActivityType.QuizCompleted,
              title: "Quiz: Tablice i podstawowe operacje",
              description: "Ukończyłeś quiz z wynikiem 85%",
              xpEarned: 25,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
              relatedEntityId: "quiz-1",
              relatedEntityType: "Quiz"
            },
            {
              id: "3",
              type: ActivityType.LessonCompleted,
              title: "Złożoność czasowa algorytmów",
              description: "Ukończyłeś lekcję Złożoność czasowa algorytmów",
              xpEarned: 20,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
              relatedEntityId: "lesson-2",
              relatedEntityType: "Lesson"
            },
            {
              id: "4",
              type: ActivityType.StreakMilestone,
              title: "3 dni nauki z rzędu!",
              description: "Utrzymałeś passę przez 3 dni!",
              xpEarned: 30,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
              relatedEntityId: undefined,
              relatedEntityType: undefined
            },
          ].slice(0, limit),
        };
      } catch (error) {
        console.error("Failed to fetch activities:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case ActivityType.LessonCompleted:
        return <Book className="h-4 w-4 text-blue-500" />;
      case ActivityType.QuizCompleted:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case ActivityType.StreakMilestone:
        return <Star className="h-4 w-4 text-amber-500" />;
      case ActivityType.LevelUp:
        return <Trophy className="h-4 w-4 text-purple-500" />;
      case ActivityType.ModuleCompleted:
        return <CheckCircle className="h-4 w-4 text-teal-500" />;
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
          {data?.activities?.length ? (
            <div className="space-y-5">
              {data.activities.map((activity: UserActivityItemDto) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-2 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{activity.title}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(activity.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Star className="h-3.5 w-3.5 mr-1 text-amber-500" />
                      <span>+{activity.xpEarned} XP</span>
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