"use client";

import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();

  return (
    <nav className="bg-indigo-600 dark:bg-indigo-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          DSA Platform
        </Link>
        <div className="space-x-4 flex items-center">
          {user ? (
            <>
              <Link href="/dashboard" className="hover:text-indigo-200">
                Dashboard
              </Link>
              {/* Dodaj inne linki dla zalogowanych */}
              <span className="font-medium">Witaj, {user.username}!</span>
              <Button
                onClick={logout}
                disabled={isLoading}
                variant="destructive"
                size="sm"
              >
                {isLoading ? "Wylogowywanie..." : "Wyloguj"}
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-indigo-200">
                Login
              </Link>
              <Link href="/register" className="hover:text-indigo-200">
                Rejestracja
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
