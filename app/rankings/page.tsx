"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Dodano Alert
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // Dodano Avatar
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card"; // Użyjemy CardContent dla kontenera
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils"; // Dodano cn
import {
  AlertCircle,
  Award,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Flame,
  TrendingUp,
  Users,
} from "lucide-react"; // Dodano ikony
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Player } from "../types/user";

// Fetcher (bez zmian - zakładamy, że działa poprawnie z credentials: 'include')
const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const error: any = new Error("Błąd pobierania danych rankingu.");
    error.status = res.status;
    try {
      error.info = await res.json();
    } catch (e) {
      error.info = { message: await res.text() };
    }
    throw error;
  }
  try {
    return await res.json();
  } catch (jsonError) {
    const error: any = new Error("Nie udało się sparsować odpowiedzi.");
    error.status = res.status;
    error.info = { message: "Invalid JSON" };
    throw error;
  }
};

export default function RankingPage() {
  const [category, setCategory] = useState<"level" | "streak" | "joined-time">(
    "level"
  );
  const [page, setPage] = useState(1);
  const limit = 10; // Można dostosować

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  // Użyj useMemo do obliczenia klucza SWR, aby uniknąć niepotrzebnych re-renderów
  const swrKey = useMemo(
    () =>
      API_BASE_URL
        ? `${API_BASE_URL}/User/ranking/${category}?page=${page}&limit=${limit}`
        : null,
    [API_BASE_URL, category, page, limit]
  );

  const {
    data: players,
    isLoading,
    error,
    mutate,
  } = useSWR<Player[] | null>(swrKey, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  // Reset strony przy zmianie kategorii (bez zmian)
  useEffect(() => {
    setPage(1);
  }, [category]);

  // Reset strony, jeśli obecna jest pusta (bez zmian)
  useEffect(() => {
    if (page > 1 && players && players.length === 0 && !isLoading) {
      setPage(page - 1);
    }
  }, [players, page, isLoading]);

  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePrevPage = () => setPage((prev) => Math.max(1, prev - 1));

  // Funkcja pomocnicza do generowania inicjałów
  const getInitials = (
    firstName?: string,
    lastName?: string,
    userName?: string
  ): string => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    if (first && last) return `${first}${last}`.toUpperCase();
    return userName?.[0]?.toUpperCase() || "?";
  };

  // Funkcja pomocnicza do formatowania wartości w rankingu
  const formatValue = (player: Player, category: string): string => {
    switch (category) {
      case "level":
        return `Poziom ${player.level ?? "?"}`;
      case "streak":
        // Explicitly check if streak is undefined or null, not if it's falsy
        return `${
          player.streak !== undefined && player.streak !== null
            ? player.streak
            : "?"
        } dni serii`;
      case "joined-time":
        return player.joinedAt
          ? `Dołączono ${new Date(player.joinedAt).toLocaleDateString("pl-PL")}`
          : "Brak daty";
      default:
        return "";
    }
  };
  // Ikona dla kategorii
  const categoryIcon = useMemo(() => {
    switch (category) {
      case "level":
        return <TrendingUp className="h-5 w-5 mr-2 text-indigo-500" />;
      case "streak":
        return <Flame className="h-5 w-5 mr-2 text-orange-500" />;
      case "joined-time":
        return <CalendarDays className="h-5 w-5 mr-2 text-green-500" />;
      default:
        return null;
    }
  }, [category]);

  // Kolor akcentu dla top 3
  const getRankColor = (rank: number): string => {
    if (rank === 1) return "text-yellow-500 border-yellow-500";
    if (rank === 2) return "text-gray-400 border-gray-400";
    if (rank === 3) return "text-orange-600 border-orange-600";
    return "text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600";
  };

  // Sprawdzenie konfiguracji API_BASE_URL (bez zmian)
  if (!API_BASE_URL && typeof window !== "undefined") {
    /* ... */
  }

  return (
    <div className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Ulepszony nagłówek */}
      <div className="mb-10 text-center">
        <Award className="mx-auto h-12 w-12 text-indigo-500 mb-3" />
        <h1 className="text-4xl sm:text-5xl font-bold mb-2 text-gray-900 dark:text-gray-100 tracking-tight">
          Ranking Graczy
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Zobacz, kto jest na szczycie w różnych kategoriach i pnij się w górę!
        </p>
      </div>

      <Tabs
        value={category}
        onValueChange={(value) => setCategory(value as any)}
        className="mb-8"
      >
        {/* TabsList z ikonami */}
        <TabsList className="grid grid-cols-3 w-full max-w-lg mx-auto h-auto mb-8">
          <TabsTrigger
            value="level"
            className="py-2.5 data-[state=active]:shadow-md"
          >
            <TrendingUp className="h-4 w-4 mr-1.5" /> Poziom
          </TabsTrigger>
          <TabsTrigger
            value="streak"
            className="py-2.5 data-[state=active]:shadow-md"
          >
            <Flame className="h-4 w-4 mr-1.5" /> Seria
          </TabsTrigger>
          <TabsTrigger
            value="joined-time"
            className="py-2.5 data-[state=active]:shadow-md"
          >
            <CalendarDays className="h-4 w-4 mr-1.5" /> Staż
          </TabsTrigger>
        </TabsList>

        {/* Kontener dla wyników */}
        <Card className="shadow-lg border dark:border-gray-700">
          <CardContent className="p-4 md:p-6">
            {/* Stan ładowania - ulepszone szkielety */}
            {isLoading && !error ? (
              <div className="space-y-4">
                {Array(limit)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 animate-pulse"
                    >
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-grow space-y-1.5">
                        <Skeleton className="h-4 w-3/5" />
                        <Skeleton className="h-3 w-2/5" />
                      </div>
                      <Skeleton className="h-6 w-8 rounded-md" />
                    </div>
                  ))}
              </div>
            ) : error ? (
              // Ulepszony stan błędu
              <Alert variant="destructive" className="my-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                  Błąd ładowania rankingu (Status:{" "}
                  {error.status || "Network Error"})
                </AlertTitle>
                <AlertDescription>
                  Nie udało się pobrać danych. Sprawdź połączenie lub spróbuj
                  ponownie później.
                  {error.info && (
                    <pre className="mt-2 text-xs bg-red-100 dark:bg-red-900/50 p-2 rounded overflow-auto">
                      {JSON.stringify(error.info, null, 2)}
                    </pre>
                  )}
                </AlertDescription>
                <Button
                  onClick={() => mutate()}
                  variant="destructive"
                  size="sm"
                  className="mt-3"
                >
                  Spróbuj ponownie
                </Button>
              </Alert>
            ) : !players || players.length === 0 ? (
              // Ulepszony stan pusty
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium">
                  Brak graczy do wyświetlenia.
                </p>
                <p className="text-sm">
                  Wygląda na to, że{" "}
                  {page > 1 ? "na tej stronie" : "w tej kategorii"} nie ma
                  jeszcze wyników.
                </p>
              </div>
            ) : (
              // Lista graczy - ulepszony wygląd
              <>
                <div className="flow-root">
                  <ul
                    role="list"
                    className="-my-3 divide-y divide-gray-200 dark:divide-gray-700"
                  >
                    {players.map((player: Player, index: number) => {
                      const rank = index + 1 + (page - 1) * limit;
                      return (
                        <li
                          key={player.id}
                          className={cn(
                            "flex items-center py-4 px-2 sm:px-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors",
                            getRankColor(rank)
                          )}
                        >
                          <div className="text-xl font-semibold w-8 text-center mr-4">
                            {rank}
                          </div>
                          <Avatar className="h-10 w-10 mr-4">
                            <AvatarFallback>
                              {getInitials(
                                player.firstName,
                                player.lastName,
                                player.userName
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                              {player.firstName && player.lastName
                                ? `${player.firstName} ${player.lastName}`
                                : player.userName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {formatValue(player, category)}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Paginacja */}
                <div className="mt-6 flex justify-center gap-4">
                  <Button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Poprzednia
                  </Button>
                  <Button
                    onClick={handleNextPage}
                    disabled={!players || players.length < limit}
                    variant="outline"
                    size="sm"
                  >
                    Następna
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
