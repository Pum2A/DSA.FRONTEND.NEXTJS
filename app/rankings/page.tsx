"use client";

import { useState } from "react";
import useSWR from "swr";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Calendar, TrendingUp, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function RankingPage() {
  const [category, setCategory] = useState<"level" | "streak" | "joined-time">(
    "level"
  );
  const [page, setPage] = useState(1);
  const limit = 10; // Number of players per page

  const {
    data: players,
    isLoading,
    error,
  } = useSWR(
    `/api/user/ranking/${category}?page=${page}&limit=${limit}`,
    fetcher
  );

  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePrevPage = () => setPage((prev) => Math.max(1, prev - 1));

  if (page > 1 && players?.length === 0) {
    setPage(1); // Reset to first page if no players found
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

      <Tabs defaultValue="level" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger
            value="level"
            onClick={() => {
              setCategory("level");
              setPage(1);
            }}
          >
            <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
            Level
          </TabsTrigger>
          <TabsTrigger
            value="streak"
            onClick={() => {
              setCategory("streak");
              setPage(1);
            }}
          >
            <Flame className="h-5 w-5 mr-2 text-orange-500" />
            Streak
          </TabsTrigger>
          <TabsTrigger
            value="joined-time"
            onClick={() => {
              setCategory("joined-time");
              setPage(1);
            }}
          >
            <Calendar className="h-5 w-5 mr-2 text-green-500" />
            Najstarsze Konto
          </TabsTrigger>
        </TabsList>

        <TabsContent value={category}>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6)
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
            <p className="text-red-500">
              Wystąpił błąd podczas ładowania danych.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {players?.map((player: any, index: number) => (
                  <Card key={player.id}>
                    <CardHeader className="flex items-center gap-4 p-6">
                      <div className="rounded-full bg-blue-100 p-4">
                        <Trophy className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle>
                          {index + 1 + (page - 1) * limit}. {player.firstName}{" "}
                          {player.lastName}
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          {category === "level"
                            ? `Level: ${player.level}`
                            : category === "streak"
                            ? `Streak: ${player.streak}`
                            : `Zarejestrowano: ${new Date(
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
                  disabled={page === 1}
                  variant="outline"
                >
                  Poprzednia
                </Button>
                <span className="text-gray-500">Strona {page}</span>
                <Button
                  onClick={handleNextPage}
                  disabled={players?.length < limit}
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
