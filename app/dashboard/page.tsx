"use client";

import { useAuth } from "@/app/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Clock,
  Flame,
  LineChart,
  List,
  Star
} from "lucide-react";
import Link from "next/link";

import { ActivityFeed } from "../components/dashboard/ActivityFeed";
import { ModulesList } from "../components/dashboard/ModulesList";
import { RecommendedLessons } from "../components/dashboard/RecommendedLessons";
import { StreakCalendar } from "../components/dashboard/StreakCalendar";
import { UserStats } from "../components/dashboard/UserStats";
import Navbar from "../components/Navbar";
import { getMe } from "../features/auth/api";

export default function DashboardPage() {
  const { user: authUser, isLoading: authLoading } = useAuth();

  // Fetch fresh user data with React Query
  const {
    data: queryUser,
    isLoading: queryLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dashboardUser", authUser?.id],
    queryFn: getMe,
    enabled: !!authUser && !authLoading,
    staleTime: 1000 * 60 * 1, // Refresh every minute if inactive
  });

  // Fetch user learning progress data
  const {
    data: progressData,
    isLoading: progressLoading,
  } = useQuery({
    queryKey: ["userProgress"],
    queryFn: async () => {
      const response = await fetch("/api/Lessons/progress", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch progress data");
      return response.json();
    },
    enabled: !!authUser && !authLoading,
    staleTime: 1000 * 60 * 5, // Refresh every 5 minutes if inactive
  });

  // Fetch modules for the modules tab
  const {
    data: modulesData,
    isLoading: modulesLoading,
  } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const response = await fetch("/api/Lessons/modules", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch modules");
      return response.json();
    },
    enabled: !!authUser && !authLoading,
    staleTime: 1000 * 60 * 15, // Refresh every 15 minutes if inactive
  });

  const displayUser = queryUser || authUser;
  const isLoading = authLoading || queryLoading || progressLoading;

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto mt-10 p-4 flex items-center justify-center">
          <div className="w-full max-w-md text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-24 w-24 mb-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
            <p className="mt-6 text-muted-foreground">Ładowanie dashboardu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!displayUser) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto mt-10 p-4 text-center">
          <div className="bg-destructive/10 text-destructive rounded-lg p-6 max-w-md mx-auto">
            <h2 className="font-bold text-lg mb-2">Nie udało się załadować danych</h2>
            <p className="mb-4">Spróbuj zalogować się ponownie lub odśwież stronę.</p>
            <Button asChild>
              <Link href="/login">Zaloguj się ponownie</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate overall progress
  const overallProgress = progressData 
    ? Math.round((progressData.completedLessons / progressData.totalLessons) * 100) || 0
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto pt-6 pb-12 px-4 md:px-6">
        {/* User Profile Banner */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-6 md:p-8 mb-8 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <Avatar className="h-20 w-20 border-4 border-white/20 shadow-xl">
              <AvatarImage src={displayUser.avatar || undefined} alt={displayUser.username} />
              <AvatarFallback className="bg-brand-400">
                {displayUser.username?.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-grow">
              <h1 className="text-2xl md:text-3xl font-bold mb-1">{displayUser.username}</h1>
              <p className="text-brand-100">{displayUser.email}</p>
              
              <div className="flex items-center mt-2">
                <div className="flex items-center mr-4">
                  <Flame className="h-5 w-5 mr-1" />
                  <span className="font-medium">{displayUser.currentStreak || 0} dni</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 mr-1" />
                  <span className="font-medium">{displayUser.xpPoints || 0} XP</span>
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0 mt-4 md:mt-0">
              <Button asChild variant="ghost" className="bg-white/10 hover:bg-white/20">
                <Link href="/profile">Edytuj profil</Link>
              </Button>
            </div>
          </div>
          
          {/* Overall progress bar */}
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-brand-50">Całkowity postęp</span>
              <span className="text-sm font-medium text-brand-50">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2 bg-white/20 [&>div]:bg-white" />
          </div>
        </div>
        
        {/* Main content area with tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview" className="gap-2">
                <LineChart className="h-4 w-4" />
                <span>Przegląd</span>
              </TabsTrigger>
              <TabsTrigger value="modules" className="gap-2">
                <List className="h-4 w-4" />
                <span>Moduły</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <Clock className="h-4 w-4" />
                <span>Aktywność</span>
              </TabsTrigger>
            </TabsList>
            
            <Button asChild size="sm">
              <Link href="/lessons">
                <BookOpen className="h-4 w-4 mr-2" />
                Kontynuuj naukę
              </Link>
            </Button>
          </div>
          
          {/* Overview tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* User stats card */}
              <UserStats user={displayUser} progressData={progressData} />
              
              {/* Streak calendar card */}
              <StreakCalendar streak={displayUser.currentStreak || 0} />
              
              {/* Recommended next lessons */}
              <RecommendedLessons progressData={progressData} />
            </div>
            
            {/* Recent activity */}
            <ActivityFeed userId={displayUser.id} />
          </TabsContent>
          
          {/* Modules tab */}
          <TabsContent value="modules">
            <ModulesList modules={modulesData} isLoading={modulesLoading} />
          </TabsContent>
          
          {/* Activity tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Twoja aktywność</CardTitle>
                <CardDescription>Historia wszystkich ukończonych lekcji i quizów</CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityFeed userId={displayUser.id} limit={20} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}