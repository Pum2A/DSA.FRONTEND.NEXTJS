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
  Settings,
  LifeBuoy,
} from "lucide-react"; // Dodano ikony
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "../store/authStore";
import useSWR from "swr";
import { apiService } from "../lib/api";
import { User } from "../types/auth"; // Poprawiono ścieżkę
import { cn } from "@/lib/utils"; // Dodano cn
import NotificationsDropdown from "./ui/NotificationsDropdown";

export function Navbar() {
  const { isAuthenticated, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pathname = usePathname();

  // Fetcher i SWR (bez zmian)
  const fetcher = (path: string): Promise<User | null> =>
    apiService.get<User>(path);
  const {
    data: updatedUser,
    isLoading: isSWRLoading,
    mutate: refreshUser,
  } = useSWR<User | null>(isAuthenticated ? "Auth/user" : null, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  // Efekt taskCompleted (bez zmian)
  useEffect(() => {
    /* ... */
  }, [refreshUser]);

  // Efekt scroll (bez zmian)
  useEffect(() => {
    /* ... */
  }, []);

  // Efekt zamykania menu mobilnego (bez zmian)
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Definicje navItems (ikony bez mr-2, bo będą obok tekstu)
  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      protected: true,
      icon: LayoutDashboard,
    },
    { name: "Nauka", href: "/learning", protected: true, icon: BookOpen },
    { name: "Rankingi", href: "/rankings", protected: true, icon: Award },
    // { name: "O nas", href: "/about", protected: false, icon: LifeBuoy }, // Można dodać ikonę
  ];

  // Funkcja isActive - poprawka: musi zwracać boolean
  const isActive = (path: string) => {
    return pathname === path;
  };

  // Logika wyświetlania sekcji użytkownika (bez zmian)
  const displayUser = updatedUser;
  const showUserSection = isAuthenticated && displayUser;
  const showUserLoading = isAuthenticated && isSWRLoading && !displayUser;

  // Funkcja pomocnicza do inicjałów (jak w Rankingu)
  const getInitials = (
    firstName?: string,
    lastName?: string,
    userName?: string
  ): string => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    if (first && last) return `${first}${last}`.toUpperCase();
    return userName?.[0]?.toUpperCase() || "?";
  };

  return (
    <header
      // Bardziej subtelne przejście i tło
      className={cn(
        "sticky top-0 z-50 w-full transition-colors duration-300 border-b",
        scrolled
          ? "bg-white/95 backdrop-blur-sm border-gray-200 shadow-sm dark:bg-gray-900/95 dark:border-gray-800"
          : "bg-white border-transparent dark:bg-gray-900"
      )}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {" "}
        {/* Zwiększono max-w */}
        <div className="flex h-16 items-center justify-between">
          {/* Logo - nieco większe */}
          <div className="flex-shrink-0">
            <Link
              href={isAuthenticated ? "/dashboard" : "/"}
              className="flex items-center space-x-2.5"
            >
              <span className="h-9 w-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">DS</span>
              </span>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight hidden sm:inline">
                DSA Learning
              </span>
            </Link>
          </div>

          {/* Nawigacja desktopowa - poprawione style */}
          <nav className="hidden md:flex md:items-center md:space-x-1 lg:space-x-2">
            {navItems
              .filter((item) => !item.protected || isAuthenticated)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                    isActive(item.href)
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                  )}
                >
                  <item.icon className="h-4 w-4 mr-1.5" />
                  {item.name}
                </Link>
              ))}
          </nav>

          {/* Prawa strona: powiadomienia + auth - poprawione style */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {isAuthenticated && <NotificationsDropdown />}

            {showUserSection ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {/* Lepszy wygląd triggera */}
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 px-2 py-1 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Avatar className="h-8 w-8">
                      {/* <AvatarImage src="" alt={displayUser?.userName} /> */}
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 text-xs font-semibold">
                        {getInitials(
                          displayUser?.firstName,
                          displayUser?.lastName,
                          displayUser?.userName
                        )}
                      </AvatarFallback>
                    </Avatar>
                    {/* Ukryj tekst na mniejszych ekranach dla oszczędności miejsca */}
                    <div className="hidden lg:flex flex-col items-start text-xs">
                      <span className="font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                        {displayUser?.userName}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 leading-tight">
                        Poz. {displayUser?.level ?? 1}
                      </span>
                    </div>
                    {isRefreshing ? (
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-500 ml-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500 ml-0.5 hidden lg:block" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  {/* Etykieta z danymi użytkownika w menu */}
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {displayUser?.firstName} {displayUser?.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        @{displayUser?.userName}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {/* Opcjonalnie: Link do ustawień */}
                  {/* <DropdownMenuItem asChild><Link href="/settings" className="cursor-pointer"><Settings className="mr-2 h-4 w-4" />Ustawienia</Link></DropdownMenuItem> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Wyloguj się
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : showUserLoading ? (
              // Skeleton dla stanu ładowania użytkownika
              <div className="flex items-center space-x-2 px-2 h-10 animate-pulse">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="hidden lg:block space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ) : (
              // Przyciski logowania/rejestracji
              <div className="hidden sm:flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Zaloguj</Link>
                </Button>
                <Button
                  asChild
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
                >
                  <Link href="/register">Zarejestruj</Link>
                </Button>
              </div>
            )}

            {/* Przycisk menu mobilnego */}
            <div className="flex md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu - ulepszone style */}
      {isMenuOpen && (
        <div
          className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 absolute w-full shadow-lg"
          id="mobile-menu"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems
              .filter((item) => !item.protected || isAuthenticated)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-base font-medium rounded-md",
                    isActive(item.href)
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-300"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              ))}
          </div>
          {/* Sekcja użytkownika w menu mobilnym */}
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            {showUserSection ? (
              <>
                <div className="flex items-center px-5 mb-3">
                  <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
                    {/* <AvatarImage src="" alt={displayUser?.userName} /> */}
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 text-sm font-semibold">
                      {getInitials(
                        displayUser?.firstName,
                        displayUser?.lastName,
                        displayUser?.userName
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="text-base font-medium text-gray-800 dark:text-gray-200 truncate">
                      {displayUser?.firstName} {displayUser?.lastName}
                    </div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      @{displayUser?.userName}
                    </div>
                  </div>
                </div>
                <div className="px-2 space-y-1">
                  <Link
                    href="/profile"
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-300"
                  >
                    <UserIcon className="h-5 w-5 mr-3" /> Profil
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full flex items-center px-3 py-2 text-base font-medium text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="h-5 w-5 mr-3" /> Wyloguj się
                  </button>
                </div>
              </>
            ) : showUserLoading ? (
              <div className="px-5 py-2 animate-pulse">
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="px-5 py-3 space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login">Zaloguj</Link>
                </Button>
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
                  asChild
                >
                  <Link href="/register">Zarejestruj</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
