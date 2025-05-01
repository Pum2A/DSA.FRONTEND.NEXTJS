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
import { useAuthStore } from "../store/authStore";
import NotificationsDropdown from "./ui/NotificationsDropdown";
import useSWR, { mutate } from "swr";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false); // Wskaźnik ładowania (spinner)
  const pathname = usePathname();

  // Pobieranie danych użytkownika z SWR
  const { data: updatedUser, mutate: refreshUser } = useSWR(
    isAuthenticated ? "/auth/user" : null,
    async () => {
      const response = await fetch("/api/auth/user");
      if (!response.ok) throw new Error("Failed to fetch user data");
      return response.json();
    },
    { fallbackData: user, revalidateOnFocus: false }
  );

  // Obsługa zakończenia zadania i odświeżenia danych
  useEffect(() => {
    const handleTaskCompleted = async () => {
      console.log("Zdarzenie taskCompleted odebrane! Odświeżam dane...");
      setIsRefreshing(true); // Pokazujemy spinner

      try {
        // Odśwież dane użytkownika
        await refreshUser();

        // Odśwież powiadomienia
        const refreshEvent = new CustomEvent("refreshNotifications");
        window.dispatchEvent(refreshEvent);
      } catch (error) {
        console.error("Błąd podczas odświeżania danych:", error);
      } finally {
        setIsRefreshing(false); // Ukrywamy spinner
      }
    };

    // Nasłuchuj na zdarzenie "taskCompleted"
    window.addEventListener("taskCompleted", handleTaskCompleted);

    return () => {
      window.removeEventListener("taskCompleted", handleTaskCompleted);
    };
  }, [refreshUser]);

  // Efekt przewijania strony
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Zamknięcie menu mobilnego po zmianie ścieżki
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Elementy nawigacji
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
    {
      name: "O nas",
      href: "/about",
      protected: false,
    },
  ];

  // Sprawdzenie, czy ścieżka jest aktywna
  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow">
                <span className="text-white font-bold text-lg">DS</span>
              </span>
              <span className="text-lg font-bold text-gray-900 tracking-tight">
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
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-blue-700 hover:border-b-2 hover:border-blue-300"
                  }`}
                >
                  {item.icon && item.icon}
                  {item.name}
                </Link>
              ))}
          </nav>

          {/* Prawa strona: powiadomienia + auth */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated && <NotificationsDropdown />}
            {isAuthenticated && updatedUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 px-2"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={updatedUser.userName} />
                      <AvatarFallback className="bg-blue-100 text-blue-800">
                        {updatedUser.userName?.substring(0, 2).toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-sm">
                      <span className="font-medium">
                        {updatedUser.userName}
                      </span>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>Poziom {updatedUser.level}</span>
                        <span className="mx-1">•</span>
                        <span>{updatedUser.experiencePoints} XP</span>
                      </div>
                    </div>
                    {isRefreshing ? (
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex cursor-pointer">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                    onClick={() => logout()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Wyloguj się
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
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
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
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
    </header>
  );
}
