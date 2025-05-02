"use client";

import { useState, useEffect } from "react"; // Upewnij się, że useEffect jest importowany
import useSWR from "swr";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Calendar, TrendingUp, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- POPRAWIONY FETCHER DLA HttpOnly COOKIES ---
const fetcher = async (url: string) => {
  console.log(`[Fetcher] Fetching: ${url} with credentials`); // Logowanie

  // WAŻNE: Dodajemy credentials: 'include', aby przeglądarka wysłała HttpOnly cookies
  // Usuwamy logikę localStorage i nagłówka Authorization
  const res = await fetch(url, { credentials: "include" });

  if (!res.ok) {
    console.error(
      `[Fetcher] Error: ${res.status} ${res.statusText} for ${url}`
    );
    if (res.status === 401) {
      console.error(
        "[Fetcher] Unauthorized access (401). Browser might not be sending cookies (check CORS Allow-Credentials, SameSite attributes on cookie, credentials: 'include' in fetch) or cookie is invalid/expired."
      );
    } else if (res.status === 404) {
      console.error(
        "[Fetcher] Not Found (404). Check URL path and casing (e.g., /api/User/ vs /api/user/)."
      );
    }

    const error: any = new Error(
      "Wystąpił błąd podczas pobierania danych rankingu."
    );
    error.status = res.status;

    const responseBodyText = await res.text();
    try {
      error.info = JSON.parse(responseBodyText);
    } catch (e) {
      error.info = { message: responseBodyText };
    }
    throw error;
  }

  // Jeśli status jest OK, próbujemy sparsować JSON
  try {
    return await res.json();
  } catch (jsonError) {
    console.error(
      `[Fetcher] Failed to parse JSON response for ${url}`,
      jsonError
    );
    const error: any = new Error("Nie udało się sparsować odpowiedzi serwera.");
    error.status = res.status; // Zachowaj oryginalny status
    error.info = { message: "Invalid JSON response" };
    throw error;
  }
};
// --- KONIEC POPRAWIONEGO FETCHER ---

export default function RankingPage() {
  const [category, setCategory] = useState<"level" | "streak" | "joined-time">(
    "level"
  );
  const [page, setPage] = useState(1);
  const limit = 10;

  // Nadal potrzebujemy pełnego URL i poprawnej wielkości liter
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const swrKey = API_BASE_URL
    ? `${API_BASE_URL}/User/ranking/${category}?page=${page}&limit=${limit}` // Poprawna wielkość liter 'User'
    : null;

  const {
    data: players,
    isLoading,
    error,
    mutate,
  } = useSWR(
    swrKey,
    fetcher, // Używamy fetchera z credentials: 'include'
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  // Efekt do resetowania strony przy zmianie kategorii
  useEffect(() => {
    setPage(1);
    if (swrKey) {
      mutate(); // Ponownie pobierz dane dla nowej kategorii
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]); // Uruchamiaj tylko przy zmianie kategorii

  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePrevPage = () => setPage((prev) => Math.max(1, prev - 1));

  // Resetowanie strony, jeśli obecna strona jest pusta (poza pierwszą)
  useEffect(() => {
    if (page > 1 && players && players.length === 0 && !isLoading) {
      setPage(page - 1);
    }
  }, [players, page, isLoading]);

  // Obsługa błędu w komponencie dla lepszego feedbacku
  if (error) {
    console.error("SWR Error Details:", error, error?.info);
  }

  // Sprawdzenie, czy API_BASE_URL jest dostępny
  if (!API_BASE_URL && typeof window !== "undefined") {
    return (
      <p className="text-red-500 text-center mt-10">
        Błąd konfiguracji: Zmienna środowiskowa NEXT_PUBLIC_API_URL nie jest
        ustawiona w środowisku frontendu (Vercel).
      </p>
    );
  }

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Ranking Graczy</h1>
        <p className="mt-1 text-gray-600">
          Oto ranking graczy w różnych kategoriach. Przełącz się między nimi,
          aby zobaczyć najlepszych graczy!
        </p>
      </div>

      {/* Użyj kontrolowanego komponentu Tabs */}
      <Tabs
        value={category}
        onValueChange={(value) => setCategory(value as any)} // Kontroluj zmianę tabsa
        className="mb-8"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="level">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
            Level
          </TabsTrigger>
          <TabsTrigger value="streak">
            <Flame className="h-5 w-5 mr-2 text-orange-500" />
            Streak
          </TabsTrigger>
          <TabsTrigger value="joined-time">
            <Calendar className="h-5 w-5 mr-2 text-green-500" />
            Najstarsze Konto
          </TabsTrigger>
        </TabsList>

        {/* Użyj key={category}, aby wymusić odświeżenie zawartości przy zmianie kategorii */}
        <TabsContent value={category} key={category}>
          {isLoading && !error ? ( // Pokaż Skeleton tylko jeśli ładuje i nie ma błędu
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(limit)
                .fill(0)
                .map((_, index) => (
                  <Card key={index}>
                    <CardContent className="space-y-4 p-6">
                      <Skeleton className="h-6 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : error ? (
            // Wyświetl bardziej szczegółowy błąd
            <div className="text-red-500 bg-red-50 p-4 rounded-md">
              <p className="font-semibold">
                Wystąpił błąd podczas ładowania danych rankingu (Status:{" "}
                {error.status || "Network Error"}).
              </p>
              <p className="text-sm mt-1">
                Sprawdź konfigurację CORS/Cookies lub spróbuj ponownie.
              </p>
              {error.info && (
                <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                  {JSON.stringify(error.info, null, 2)}
                </pre>
              )}
            </div>
          ) : !players || players.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">
              Brak graczy do wyświetlenia w tej kategorii na tej stronie.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {players.map((player: any, index: number) => (
                  <Card key={player.id}>
                    <CardHeader className="flex flex-row items-center gap-4 p-4 sm:p-6">
                      <div className="flex-shrink-0 rounded-full bg-blue-100 p-3 sm:p-4">
                        <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <CardTitle className="text-base sm:text-lg truncate">
                          {index + 1 + (page - 1) * limit}. {player.firstName}{" "}
                          {player.lastName}
                        </CardTitle>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {category === "level"
                            ? `Level: ${player.level}`
                            : category === "streak"
                            ? `Streak: ${player.streak}`
                            : `Dołączono: ${new Date(
                                player.joinedAt
                              ).toLocaleDateString()}`}
                        </p>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-6">
                <Button
                  onClick={handlePrevPage}
                  disabled={page === 1 || isLoading}
                  variant="outline"
                >
                  Poprzednia
                </Button>
                <span className="text-sm sm:text-base text-gray-500">
                  Strona {page}
                </span>
                <Button
                  onClick={handleNextPage}
                  disabled={players.length < limit || isLoading}
                  variant="outline"
                >
                  Następna
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
