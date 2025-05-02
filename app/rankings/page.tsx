"use client";

import { useState, useEffect } from "react"; // Dodano useEffect
import useSWR from "swr";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Calendar, TrendingUp, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- ZMODYFIKOWANY FETCHER ---
const fetcher = async (url: string) => {
  // Pobierz token - dostosuj 'authToken' do klucza, pod którym przechowujesz token JWT
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null; // Upewnij się, że localStorage jest dostępny

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`; // Dodaj nagłówek Authorization
  }

  console.log(`[Fetcher] Fetching: ${url}`); // Logowanie URL dla debugowania

  const res = await fetch(url, { headers });

  if (!res.ok) {
    console.error(
      `[Fetcher] Error: ${res.status} ${res.statusText} for ${url}`
    );
    // Jeśli 401, może warto wylogować użytkownika lub spróbować odświeżyć token
    if (res.status === 401) {
      console.error(
        "[Fetcher] Unauthorized access. Token might be invalid or expired."
      );
      // Możesz tutaj dodać logikę wylogowania, np.:
      // if (typeof window !== 'undefined') {
      //   localStorage.removeItem('authToken');
      //   window.location.href = '/login'; // Przekieruj na stronę logowania
      // }
    }
    const error: any = new Error("Wystąpił błąd podczas pobierania danych."); // Użyj 'any' lub zdefiniuj własny typ błędu
    error.status = res.status;
    // Spróbuj dołączyć treść błędu, jeśli API ją zwraca
    try {
      error.info = await res.json();
    } catch (e) {
      // Ignoruj błąd parsowania JSON, jeśli odpowiedź nie jest JSONem
      error.info = { message: await res.text() }; // Przechowaj tekst odpowiedzi
    }
    throw error;
  }

  return res.json();
};
// --- KONIEC ZMODYFIKOWANEGO FETCHER ---

export default function RankingPage() {
  const [category, setCategory] = useState<"level" | "streak" | "joined-time">(
    "level"
  );
  const [page, setPage] = useState(1);
  const limit = 10; // Number of players per page

  // Odczytaj bazowy URL API ze zmiennej środowiskowej
  // Upewnij się, że zmienna NEXT_PUBLIC_API_URL jest ustawiona w Vercel
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  // Zbuduj pełny URL dla SWR
  // Używamy `API_BASE_URL` tylko jeśli jest dostępny (po stronie klienta)
  const swrKey = API_BASE_URL
    ? `${API_BASE_URL}/api/user/ranking/${category}?page=${page}&limit=${limit}`
    : null;

  const {
    data: players,
    isLoading,
    error,
    mutate, // Dodaj mutate do odświeżania danych
  } = useSWR(
    swrKey, // Użyj pełnego URL jako klucza SWR, lub null jeśli URL nie jest gotowy
    fetcher,
    {
      revalidateOnFocus: false, // Opcjonalnie: wyłącz odświeżanie przy focusie okna
      shouldRetryOnError: false, // Opcjonalnie: wyłącz ponawianie przy błędzie (np. 401)
    }
  );

  // Efekt do resetowania strony przy zmianie kategorii
  useEffect(() => {
    setPage(1);
    // Wymuś odświeżenie danych SWR po zmianie kategorii, jeśli klucz jest gotowy
    if (swrKey) {
      mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]); // Odświeżaj tylko przy zmianie kategorii

  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePrevPage = () => setPage((prev) => Math.max(1, prev - 1));

  // Resetowanie strony, jeśli obecna strona jest pusta (poza pierwszą)
  useEffect(() => {
    if (page > 1 && players && players.length === 0 && !isLoading) {
      setPage(page - 1); // Wróć do poprzedniej strony
    }
  }, [players, page, isLoading]);

  // Obsługa błędu w komponencie
  if (error) {
    console.error("SWR Error Details:", error, error?.info);
  }

  // Jeśli URL API nie jest jeszcze dostępny (np. przy SSR/prerenderingu bez zmiennej)
  if (!API_BASE_URL) {
    return (
      <p className="text-red-500">
        Konfiguracja API (NEXT_PUBLIC_API_URL) jest niedostępna. Sprawdź zmienne
        środowiskowe w Vercel.
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
        onValueChange={(value) => setCategory(value as any)}
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

        {/* Użyj key={category}, aby wymusić ponowne renderowanie TabsContent przy zmianie kategorii */}
        <TabsContent value={category} key={category}>
          {isLoading && !error ? ( // Pokaż Skeleton tylko jeśli ładuje i nie ma błędu
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(limit) // Pokaż tyle skeletonów ile limit
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
            <p className="text-red-500">
              Wystąpił błąd podczas ładowania danych rankingu (
              {error.status || "Network Error"}). Spróbuj ponownie później.
              {error.info && (
                <pre className="mt-2 text-xs bg-red-100 p-2 rounded">
                  {JSON.stringify(error.info, null, 2)}
                </pre>
              )}
            </p>
          ) : !players || players.length === 0 ? (
            <p className="text-gray-500">
              Brak graczy do wyświetlenia w tej kategorii.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {players.map((player: any, index: number) => (
                  <Card key={player.id}>
                    <CardHeader className="flex items-center gap-4 p-6">
                      <div className="rounded-full bg-blue-100 p-4">
                        <Trophy className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle>
                          {index + 1 + (page - 1) * limit}. {player.firstName}{" "}
                          {player.lastName} ({player.userName}){" "}
                          {/* Dodano userName dla identyfikacji */}
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          {category === "level"
                            ? `Level: ${player.level}`
                            : category === "streak"
                            ? `Streak: ${player.streak}` // Zakładając, że API zwraca pole 'streak'
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
                  disabled={page === 1 || isLoading} // Wyłącz przyciski podczas ładowania
                  variant="outline"
                >
                  Poprzednia
                </Button>
                <span className="text-gray-500">Strona {page}</span>
                <Button
                  onClick={handleNextPage}
                  // Wyłącz przycisk "Następna", jeśli załadowano mniej elementów niż limit lub trwa ładowanie
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
