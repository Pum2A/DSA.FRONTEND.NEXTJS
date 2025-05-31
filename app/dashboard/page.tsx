"use client";

import { useAuth } from "@/app/context/AuthContext";

import { useQuery } from "@tanstack/react-query";
import Navbar from "../components/Navbar";
import { getMe } from "../features/auth/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";

export default function DashboardPage() {
  const { user: authUser, isLoading: authLoading } = useAuth();

  // Możemy też pobrać świeże dane użytkownika za pomocą React Query,
  // jeśli AuthContext nie odświeża ich wystarczająco często lub chcemy mieć pewność.
  const {
    data: queryUser,
    isLoading: queryLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dashboardUser", authUser?.id], // Klucz zależny od ID użytkownika z kontekstu
    queryFn: getMe,
    enabled: !!authUser && !authLoading, // Uruchom tylko jeśli użytkownik jest załadowany z kontekstu
    staleTime: 1000 * 60 * 1, // Odświeżaj co minutę, jeśli nieaktywne
  });

  const displayUser = queryUser || authUser;
  const isLoading = authLoading || queryLoading;

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto mt-10 p-4 text-center">
          Ładowanie dashboardu...
        </div>
      </div>
    );
  }

  if (!displayUser) {
    // Ten stan nie powinien wystąpić dzięki middleware i AuthContext, ale jako fallback
    return (
      <div>
        <Navbar />
        <div className="container mx-auto mt-10 p-4 text-center text-red-500">
          Błąd: Nie udało się załadować danych użytkownika. Spróbuj zalogować
          się ponownie.
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <main className="container mx-auto mt-10 p-4">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        {error && (
          <p className="text-red-500 mb-4">
            Błąd pobierania danych: {error.message}
          </p>
        )}

        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="flex flex-row items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={displayUser.avatar || undefined}
                alt={displayUser.username}
              />
              <AvatarFallback>
                {displayUser.username?.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{displayUser.username}</CardTitle>
              <CardDescription>{displayUser.email}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>ID:</strong> {displayUser.id}
            </p>
            <p>
              <strong>Punkty XP:</strong> {displayUser.xpPoints || 0}
            </p>
            <p>
              <strong>Aktualna passa:</strong> {displayUser.currentStreak || 0}{" "}
              dni
            </p>
            <p>
              <strong>Email zweryfikowany:</strong>{" "}
              {displayUser.emailVerified ? "Tak" : "Nie"}
            </p>
            {/* Dodaj więcej informacji o użytkowniku */}
          </CardContent>
        </Card>

        {/* Tutaj możesz dodać listę lekcji, postępów, itp. */}
      </main>
    </div>
  );
}
