"use client"; // Kluczowa dyrektywa dla hooków i stanu

import { useEffect, useState, ReactNode } from "react";
// Upewnij się, że ścieżka do Twojego store jest poprawna
import { useAuthStore } from "../store/authStore";

// Definicja propsów dla AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Pobierz funkcję checkAuthStatus ze store Zustand
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);

  // Lokalny stan do zarządzania wyświetlaniem *początkowego* ekranu ładowania.
  // Zapobiega to pokazywaniu loadera przy każdym innym wywołaniu checkAuthStatus (np. po logowaniu).
  const [isCheckingInitialStatus, setIsCheckingInitialStatus] = useState(true);

  useEffect(() => {
    // Funkcja asynchroniczna do wywołania sprawdzania statusu
    const performInitialCheck = async () => {
      try {
        console.log(
          "AuthProvider: Rozpoczynanie sprawdzania statusu autoryzacji..."
        );
        // Wywołaj akcję ze store
        await checkAuthStatus();
        console.log(
          "AuthProvider: Zakończono sprawdzanie statusu autoryzacji."
        );
      } catch (error) {
        // checkAuthStatus w store powinien sam obsłużyć błędy (np. 401)
        // i ustawić isAuthenticated: false. Błąd złapany tutaj byłby nieoczekiwany.
        console.error(
          "AuthProvider: Niespodziewany błąd podczas checkAuthStatus:",
          error
        );
      } finally {
        // Niezależnie od wyniku, zakończ pokazywanie *początkowego* ekranu ładowania.
        setIsCheckingInitialStatus(false);
      }
    };

    // Wywołaj funkcję sprawdzającą tylko raz, przy montowaniu komponentu
    performInitialCheck();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkAuthStatus]); // Funkcja checkAuthStatus z Zustand jest stabilna, więc useEffect wykona się raz

  // Jeśli trwa *początkowe* sprawdzanie statusu, pokaż dedykowany ekran ładowania
  if (isCheckingInitialStatus) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center p-8">
          {/* Możesz dodać tu SVG spinnera lub inny wskaźnik wizualny */}
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

  // Po zakończeniu początkowego sprawdzania, renderuj resztę aplikacji
  return <>{children}</>;
}
