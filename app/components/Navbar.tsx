"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Bell,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton"; // Dodano import Skeleton
import { useAuthStore } from "../store/authStore"; // Upewnij się, że ścieżka jest poprawna
import NotificationsDropdown from "./ui/NotificationsDropdown"; // Upewnij się, że ścieżka jest poprawna
import useSWR from "swr";
import { apiService } from "../lib/api"; // Upewnij się, że ścieżka jest poprawna
import { User } from "../types/auth"; // Upewnij się, że ścieżka i typ są poprawne

export function Navbar() {
  // Pobierz stan i akcje ze store Zustand
  const { isAuthenticated, logout } = useAuthStore();

  // Stany lokalne komponentu
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false); // Dla ręcznego odświeżania po evencie
  const pathname = usePathname();

  // Fetcher dla SWR używający skonfigurowanego apiService
  // Oczekuje obiektu typu User lub null/error
  const fetcher = (path: string): Promise<User | null> =>
    apiService.get<User>(path);

  // Hook SWR do pobierania danych użytkownika, gdy jest uwierzytelniony
  // Używa ścieżki względnej do baseURL (/api)
  const {
    data: updatedUser,
    isLoading: isSWRLoading,
    mutate: refreshUser,
  } = useSWR<User | null>(
    isAuthenticated ? "Auth/user" : null, // Klucz: ścieżka względna lub null
    fetcher, // Użyj fetchera z apiService
    {
      revalidateOnFocus: false, // Wyłącz odświeżanie przy focusie okna
      shouldRetryOnError: false, // Wyłącz ponawianie przy błędzie
      // fallbackData można pominąć, aby zawsze pobierać świeże dane po zalogowaniu
    }
  );

  // Efekt do obsługi zdarzenia 'taskCompleted' (np. po ukończeniu kroku lekcji)
  useEffect(() => {
    const handleTaskCompleted = async () => {
      console.log(
        "Navbar: Zdarzenie taskCompleted odebrane! Odświeżam dane użytkownika..."
      );
      setIsRefreshing(true);
      try {
        await refreshUser(); // Wywołaj odświeżenie danych przez SWR
        // Opcjonalnie: odśwież inne dane, np. powiadomienia
        const refreshEvent = new CustomEvent("refreshNotifications");
        window.dispatchEvent(refreshEvent);
      } catch (error) {
        console.error(
          "Navbar: Błąd podczas odświeżania danych po taskCompleted:",
          error
        );
      } finally {
        setIsRefreshing(false);
      }
    };
    window.addEventListener("taskCompleted", handleTaskCompleted);
    return () =>
      window.removeEventListener("taskCompleted", handleTaskCompleted);
  }, [refreshUser]);

  // Efekt do obsługi przewijania strony (zmiana tła navbara)
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Efekt do zamykania menu mobilnego po zmianie ścieżki
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Definicje elementów nawigacji
  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      protected: true,
      icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
    },
    {
      name: "Nauka",
      href: "/learning",
      protected: true,
      icon: <BookOpen className="h-4 w-4 mr-2" />,
    },
    {
      name: "Rankingi",
      href: "/rankings",
      protected: true,
      icon: <Award className="h-4 w-4 mr-2" />,
    },
    { name: "O nas", href: "/about", protected: false },
  ];

  // Funkcja sprawdzająca aktywną ścieżkę
  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  // Używamy danych z SWR jako głównego źródła dla wyświetlania
  const displayUser = updatedUser;
  // Warunek pokazania sekcji użytkownika: autoryzowany ORAZ dane z SWR załadowane (nie null/undefined)
  const showUserSection = isAuthenticated && displayUser;
  // Warunek pokazania loadera dla sekcji użytkownika: autoryzowany ALE SWR jeszcze ładuje
  const showUserLoading = isAuthenticated && isSWRLoading && !displayUser;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-md dark:bg-gray-900 dark:border-b dark:border-gray-800"
          : "bg-white/80 backdrop-blur-sm dark:bg-gray-900/80"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href={isAuthenticated ? "/dashboard" : "/"}
              className="flex items-center space-x-2"
            >
              <span className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow">
                <span className="text-white font-bold text-lg">DS</span>
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                DSA Learning
              </span>
            </Link>
          </div>

          {/* Nawigacja desktopowa */}
          <nav className="hidden md:flex md:items-center md:space-x-6">
            {navItems
              .filter((item) => !item.protected || isAuthenticated)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-300 hover:border-b-2 hover:border-blue-300 dark:hover:border-blue-500"
                  }`}
                >
                  {item.icon && item.icon}
                  {item.name}
                </Link>
              ))}
          </nav>

          {/* Prawa strona: powiadomienia + auth */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {/* Pokaż powiadomienia tylko dla zalogowanych */}
            {isAuthenticated && <NotificationsDropdown />}

            {/* Pokaż sekcję użytkownika, jeśli zalogowany i dane załadowane */}
            {showUserSection ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 px-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src=""
                        alt={displayUser?.userName || "User"}
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {displayUser?.userName?.substring(0, 2).toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-sm">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {displayUser?.userName || "Użytkownik"}
                      </span>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>Poziom {displayUser?.level ?? 1}</span>
                        <span className="mx-1">•</span>
                        <span>{displayUser?.experiencePoints ?? 0} XP</span>
                      </div>
                    </div>
                    {/* Pokaż spinner podczas ręcznego odświeżania */}
                    {isRefreshing ? (
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500 ml-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 ml-1" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="flex cursor-pointer items-center"
                    >
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard"
                      className="flex cursor-pointer items-center"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 cursor-pointer flex items-center"
                    onClick={logout} // Wywołaj funkcję logout ze store
                    aria-label="Wyloguj się"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Wyloguj się</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : showUserLoading ? (
              // Pokaż szkielet ładowania, gdy SWR ładuje dane użytkownika
              <div className="flex items-center space-x-2 px-2 h-10 animate-pulse">
                <Skeleton className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20 bg-gray-200 dark:bg-gray-700" />
                  <Skeleton className="h-3 w-24 bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            ) : (
              // Pokaż przyciski logowania/rejestracji, jeśli nie uwierzytelniony
              <>
                <Link href="/login">
                  <Button variant="outline">Zaloguj</Button>
                </Link>
                <Link href="/register">
                  <Button>Zarejestruj</Button>
                </Link>
              </>
            )}
          </div>

          {/* Przyciski mobilne */}
          <div className="flex md:hidden">
            {/* Pokaż powiadomienia także na mobilnym, jeśli zalogowany */}
            {isAuthenticated && <NotificationsDropdown />}
            <button
              type="button"
              className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">Otwórz menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div
          className="md:hidden border-t border-gray-200 dark:border-gray-800"
          id="mobile-menu"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems
              .filter((item) => !item.protected || isAuthenticated)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-base font-medium rounded-md ${
                    isActive(item.href)
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-300"
                  }`}
                >
                  {item.icon && item.icon}
                  {item.name}
                </Link>
              ))}
          </div>
          {/* Sekcja użytkownika w menu mobilnym */}
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            {showUserSection ? (
              <>
                <div className="flex items-center px-5 mb-3">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src="" alt={displayUser?.userName || "User"} />
                    <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {displayUser?.userName?.substring(0, 2).toUpperCase() ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                      {displayUser?.userName || "Użytkownik"}
                    </div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {displayUser?.email || ""}
                    </div>
                  </div>
                </div>
                <div className="px-2 space-y-1">
                  <Link
                    href="/profile"
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-300"
                  >
                    <UserIcon className="h-5 w-5 mr-3" />
                    Profil
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full flex items-center px-3 py-2 text-base font-medium text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Wyloguj się
                  </button>
                </div>
              </>
            ) : showUserLoading ? (
              <div className="px-5 py-2 animate-pulse">
                <div className="flex items-center">
                  <Skeleton className="h-10 w-10 rounded-full mr-3 bg-gray-200 dark:bg-gray-700" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24 bg-gray-200 dark:bg-gray-700" />
                    <Skeleton className="h-3 w-32 bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>
              </div>
            ) : (
              // Przyciski logowania/rejestracji w menu mobilnym
              <div className="px-5 py-3 space-y-2">
                <Link href="/login" className="block w-full">
                  <Button variant="outline" className="w-full">
                    Zaloguj
                  </Button>
                </Link>
                <Link href="/register" className="block w-full">
                  <Button className="w-full">Zarejestruj</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
