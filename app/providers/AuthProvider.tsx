"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuthStatus, isLoading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await checkAuthStatus();
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [checkAuthStatus]);

  if (isChecking) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse text-blue-600 text-center">
          <div className="text-lg font-semibold">Ładowanie DSA Learning...</div>
          <div className="mt-2 text-sm text-gray-500">
            Przygotowywanie twojej sesji
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
