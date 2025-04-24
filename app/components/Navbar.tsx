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
  Home,
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

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Efekt obsługujący zmianę tła nawigacji przy scrollowaniu
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Zamyka menu mobilne po zmianie ścieżki
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Zaktualizowane elementy nawigacji z poprawną ścieżką /learning
  const navItems = [
    {
      name: "Strona główna",
      href: "/",
      protected: false,
      icon: <Home className="h-4 w-4 mr-2" />,
    },
    {
      name: "Dashboard",
      href: "/dashboard",
      protected: true,
      icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
    },
    {
      name: "Nauka", // Zmieniono z "Lekcje" na "Nauka"
      href: "/learning", // Zmieniono z "/lessons" na "/learning"
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

  // Ulepszony isActive, który obsługuje podścieżki
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
            <Link href="/" className="flex items-center space-x-2">
              <span className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">DS</span>
              </span>
              <span className="text-lg font-bold text-gray-900">
                DSA Learning
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:space-x-8">
            {navItems
              .filter((item) => !item.protected || isAuthenticated)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-900 hover:border-b-2 hover:border-gray-300"
                  }`}
                >
                  {item.icon && item.icon}
                  {item.name}
                </Link>
              ))}
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 px-2"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={user.userName} />
                      <AvatarFallback className="bg-blue-100 text-blue-800">
                        {user.userName?.substring(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-sm">
                      <span className="font-medium">{user.userName}</span>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>Poziom {user.level}</span>
                        <span className="mx-1">•</span>
                        <span>{user.experiencePoints} XP</span>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
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

          {/* Mobile Menu Button */}
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

      {/* Mobile Menu - z płynną animacją */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isMenuOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="pt-2 pb-3 space-y-1 border-t">
          {navItems
            .filter((item) => !item.protected || isAuthenticated)
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-2 text-base font-medium ${
                  isActive(item.href)
                    ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
                }`}
              >
                {item.icon && item.icon}
                {item.name}
              </Link>
            ))}
        </div>

        {/* Mobile Auth Menu */}
        <div className="pt-4 pb-3 border-t border-gray-200">
          {isAuthenticated && user ? (
            <div>
              <div className="flex items-center px-4 py-2">
                <div className="flex-shrink-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt={user.userName} />
                    <AvatarFallback className="bg-blue-100 text-blue-800">
                      {user.userName?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user.userName}
                  </div>
                  <div className="text-sm text-gray-500">
                    Poziom {user.level} • {user.experiencePoints} XP
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  Profil
                </Link>
                <button
                  onClick={() => logout()}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-gray-50"
                >
                  Wyloguj się
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 py-3 space-y-2">
              <Link href="/login" className="block">
                <Button variant="outline" className="w-full">
                  Zaloguj
                </Button>
              </Link>
              <Link href="/register" className="block">
                <Button className="w-full">Zarejestruj</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
