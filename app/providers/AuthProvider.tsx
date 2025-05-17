"use client"; // Ten plik działa po stronie klienta (React, Next.js)

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore"; // Upewnij się, że ścieżka jest poprawna

// Komponent spinnera (możesz przenieść do osobnego pliku jeśli chcesz)
function Loader() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-8">
        <svg
          className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <div className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Ładowanie DSA Learning...
        </div>
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Sprawdzanie sesji użytkownika
        </div>
      </div>
    </div>
  );
}

// Typ propsów do AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Komponent wrapper – sprawdza, czy użytkownik jest zalogowany.
 * - Na początku wyświetla loader do czasu sprawdzenia sesji.
 * - Jeśli użytkownik NIE jest zalogowany, przekierowuje na /login.
 * - Jeżeli wystąpi błąd podczas sprawdzania, wyświetla komunikat i opcję odświeżenia.
 * - Jeśli wszystko OK, wyświetla dzieci (czyli całą aplikację).
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();

  // Pobierz funkcje i stan z Twojego store (np. Zustand)
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Lokalny stan: czy trwa początkowe sprawdzanie sesji
  const [isCheckingInitialStatus, setIsCheckingInitialStatus] = useState(true);
  // Lokalny stan: ewentualny błąd przy sprawdzaniu sesji
  const [error, setError] = useState<string | null>(null);

  // Sprawdzenie statusu autoryzacji na starcie
  useEffect(() => {
    const performInitialCheck = async () => {
      try {
        await checkAuthStatus();
        // Uwaga: checkAuthStatus powinno ustawić isAuthenticated w store
      } catch (err) {
        // Jeśli coś się wysypie (np. błąd sieci), ustaw błąd
        setError(
          "Nie można sprawdzić statusu logowania. Spróbuj odświeżyć stronę."
        );
      } finally {
        setIsCheckingInitialStatus(false);
      }
    };
    performInitialCheck();
  }, [checkAuthStatus]);

  // Jeżeli user nie jest zalogowany po sprawdzeniu – przekieruj na login
  useEffect(() => {
    if (!isCheckingInitialStatus && isAuthenticated === false) {
      router.replace("/login");
    }
  }, [isCheckingInitialStatus, isAuthenticated, router]);

  // Loader na czas sprawdzania sesji
  if (isCheckingInitialStatus) {
    return <Loader />;
  }

  // Obsługa błędu – dedykowany ekran
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center p-8">
          <div className="text-red-600 text-lg font-semibold mb-2">{error}</div>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => window.location.reload()}
          >
            Odśwież stronę
          </button>
        </div>
      </div>
    );
  }

  // Jeśli wszystko OK – renderuj dzieci (całą aplikację)
  return <>{children}</>;
}
