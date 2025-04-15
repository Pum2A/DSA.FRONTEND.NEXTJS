"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "../store/authStore";

export default function DashboardPage() {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Ładowanie...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Nie renderuj nic, zamiast tego przekieruj na stronę logowania
  }

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Witaj, {user.firstName || user.userName}! Oto Twój dashboard.
        </p>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Twoje postępy</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Poziom</div>
            <div className="text-3xl font-bold text-blue-600">
              {user.level || 1}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Punkty doświadczenia</div>
            <div className="text-3xl font-bold text-green-600">
              {user.experiencePoints || 0} XP
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Ukończone lekcje</div>
            <div className="text-3xl font-bold text-yellow-600">0/20</div>
          </div>
        </div>
      </div>

      {/* Learning Paths */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Ścieżki nauki</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-lg mb-2">
              Podstawy struktur danych
            </h3>
            <p className="text-gray-500 mb-4">
              Poznaj podstawowe struktury danych: tablice, listy, stosy i
              kolejki.
            </p>
            <div className="w-full bg-gray-200 h-2 rounded-full mb-4">
              <div className="bg-blue-600 h-2 rounded-full w-1/4"></div>
            </div>
            <div className="text-sm text-gray-500 mb-4">Postęp: 25%</div>
            <Link href="/lessons/data-structures">
              <Button>Kontynuuj naukę</Button>
            </Link>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-lg mb-2">Algorytmy sortowania</h3>
            <p className="text-gray-500 mb-4">
              Poznaj popularne algorytmy sortowania i ich złożoność
              obliczeniową.
            </p>
            <div className="w-full bg-gray-200 h-2 rounded-full mb-4">
              <div className="bg-blue-600 h-2 rounded-full w-0"></div>
            </div>
            <div className="text-sm text-gray-500 mb-4">Postęp: 0%</div>
            <Link href="/lessons/sorting">
              <Button>Rozpocznij</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Ostatnia aktywność</h2>
        <div className="space-y-4">
          <div className="border-b pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">Dołączono do platformy</h3>
                <p className="text-sm text-gray-500">
                  Witamy w społeczności DSA Learning!
                </p>
              </div>
              <div className="text-sm text-gray-400">przed chwilą</div>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-500">To wszystkie aktywności.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
