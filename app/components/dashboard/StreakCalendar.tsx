"use client";

import { StreakDayDto, UserStreakResponse } from "@/app/types/api/userTypes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import React from "react";

interface StreakCalendarProps {
  streak: number;
}

export function StreakCalendar({ streak }: StreakCalendarProps) {
  // In a real app, fetch user streak data from an API
  const { data: streakData } = useQuery<UserStreakResponse>({
    queryKey: ["userStreak"],
    queryFn: async () => {
      // This would be a real API call in production
      // For now, let's simulate a response
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const today = new Date();
      const recentDays: StreakDayDto[] = [];
      
      // Generate mock data for the last 30 days
      // This simulates active days (would come from API)
      const activeDays = [1, 2, 3, 5, 7, 8, 9, 10, 14, 15, 18, 19, 20];
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        
        // Format date as ISO string but only the date part
        const dateStr = date.toISOString().split('T')[0];
        
        // Determine if this day was active based on our mock data
        const dayDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        const wasActive = activeDays.includes(dayDiff) || dayDiff === 0; // Today is always active
        
        recentDays.push({
          date: dateStr,
          wasActive
        });
      }
      
      return {
        currentStreak: streak,
        maxStreak: Math.max(streak, 10), // Mock data
        lastActivityDate: today.toISOString(),
        isActiveToday: true,
        daysUntilStreakLost: 1,
        recentDays
      };
    },
  });

  // Generate calendar grid from the streak data
  const calendarDays = streakData?.recentDays?.map(day => {
    return {
      date: new Date(day.date),
      isActive: day.wasActive
    };
  }) || [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Twoja passa</CardTitle>
            <CardDescription>Ucz się codziennie!</CardDescription>
          </div>
          <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-1.5 px-3 flex items-center rounded-full text-sm font-medium">
            <Flame className="h-4 w-4 mr-1" />
            {streak} dni
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Day labels */}
          {["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"].map((day) => (
            <div key={day} className="text-xs text-muted-foreground py-1">
              {day}
            </div>
          ))}
          
          {/* Calendar squares */}
          {calendarDays.length > 0 && calendarDays.map((day, i) => {
            // Adjust so the first day aligns with the correct day of week
            const firstDayOffset = calendarDays[0]?.date.getDay() - 1;
            const offset = i === 0 ? (firstDayOffset === -1 ? 6 : firstDayOffset) : 0;
            
            return (
              <React.Fragment key={i}>
                {i === 0 && offset > 0 && (
                  <div style={{ gridColumn: `span ${offset}` }}></div>
                )}
                <div 
                  className={`aspect-square rounded-sm ${
                    day.isActive 
                      ? 'bg-green-500 dark:bg-green-600' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  } ${
                    i === calendarDays.length - 1 
                      ? 'ring-2 ring-offset-2 ring-green-500 dark:ring-offset-gray-900' 
                      : ''
                  }`}
                  title={day.date.toLocaleDateString('pl-PL')}
                >
                </div>
              </React.Fragment>
            );
          })}
        </div>
        
        <div className="flex justify-center mt-4 text-sm">
          <div className="flex items-center mr-3">
            <div className="w-3 h-3 bg-green-500 rounded-sm mr-1.5"></div>
            <span className="text-muted-foreground">Aktywny dzień</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-sm mr-1.5"></div>
            <span className="text-muted-foreground">Nieaktywny</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}