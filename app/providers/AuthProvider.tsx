"use client";
import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";
import { useLoadingStore } from "@/app/store/loadingStore";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();

  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // lokalny error tylko do obsługi błędów sieci
  const [error, setError] = useState<string | null>(null);

  const setLoading = useLoadingStore((s) => s.setLoading);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const performInitialCheck = async () => {
      try {
        await checkAuthStatus();
      } catch {
        if (mounted) {
          setError(
            "Nie można sprawdzić statusu logowania. Spróbuj odświeżyć stronę."
          );
        }
      } finally {
        setLoading(false);
      }
    };
    performInitialCheck();
    return () => {
      mounted = false;
      setLoading(false); // na wypadek unmountu
    };
  }, [checkAuthStatus, setLoading]);

  // Jeżeli user nie jest zalogowany po sprawdzeniu – przekieruj na login
  useEffect(() => {
    if (isAuthenticated === false && !error) {
      router.replace("/login");
    }
  }, [isAuthenticated, error, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-blue-900">
        <div className="text-red-600 text-lg font-semibold mb-2">{error}</div>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => window.location.reload()}
        >
          Odśwież stronę
        </button>
      </div>
    );
  }

  // Jeśli wszystko OK – renderuj dzieci (całą aplikację)
  return <>{children}</>;
}
