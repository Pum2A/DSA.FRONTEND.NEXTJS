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
import { Player } from "../types/Player";

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
                      const rankColor = getRankColor(rank);
                      return (
                        <li
                          key={player.id}
                          className="flex items-center py-3 px-1 sm:px-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-md transition-colors"
                        >
                          {/* Numer pozycji */}
                          <div
                            className={cn(
                              "w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 rounded-full border-2 flex items-center justify-center mr-3 sm:mr-4 font-bold text-sm sm:text-base",
                              rankColor
                            )}
                          >
                            {rank}
                          </div>
                          {/* Awatar */}
                          <Avatar className="h-9 w-9 sm:h-10 sm:w-10 mr-3 sm:mr-4 flex-shrink-0">
                            {/* <AvatarImage src={player.avatarUrl || ""} alt={`${player.firstName} ${player.lastName}`} /> */}
                            <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 text-sm">
                              {getInitials(
                                player.firstName,
                                player.lastName,
                                player.userName
                              )}
                            </AvatarFallback>
                          </Avatar>
                          {/* Dane gracza */}
                          <div className="flex-grow min-w-0">
                            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                              {player.firstName} {player.lastName}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                              @{player.firstName.toLowerCase()}{" "}
                              {player.lastName.toLowerCase()}
                            </p>
                          </div>
                          {/* Wartość rankingu */}
                          <div className="ml-4 flex-shrink-0 text-right">
                            <p className="text-sm sm:text-base font-semibold text-indigo-600 dark:text-indigo-400">
                              {formatValue(player, category).split(" ")[0]}{" "}
                              {/* Pokaż tylko wartość */}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatValue(player, category)
                                .split(" ")
                                .slice(1)
                                .join(" ") || categoryIcon}{" "}
                              {/* Pokaż jednostkę lub ikonę */}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Paginacja - ulepszona */}
                <div className="flex justify-between items-center mt-8 pt-4 border-t dark:border-gray-700">
                  <Button
                    onClick={handlePrevPage}
                    disabled={page === 1 || isLoading}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft className="mr-1.5 h-4 w-4" /> Poprzednia
                  </Button>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Strona {page}
                  </span>
                  <Button
                    onClick={handleNextPage}
                    disabled={players.length < limit || isLoading}
                    variant="outline"
                    size="sm"
                  >
                    Następna <ChevronRight className="ml-1.5 h-4 w-4" />
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
