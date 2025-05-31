"use client";

import { useAuth } from "@/app/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { LayoutDashboard, LogOut, Menu, Moon, Settings, Sun, User, X } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { setTheme, theme } = useTheme();

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-gradient">
              DSA Platform
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link
                href="/lessons"
                className="text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-2 text-sm font-medium transition-colors"
              >
                Lekcje
              </Link>
              <Link
                href="/quizzes"
                className="text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-2 text-sm font-medium transition-colors"
              >
                Quizy
              </Link>
              <Link
                href="/about"
                className="text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-2 text-sm font-medium transition-colors"
              >
                O platformie
              </Link>
            </div>
          </div>

          {/* Right side - theme toggle and login/profile */}
          <div className="flex items-center space-x-2">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-gray-600 dark:text-gray-300"
              aria-label="Toggle theme"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* User section */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full h-8 w-8 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || ""} alt={user.username} />
                      <AvatarFallback className="bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300">
                        {user.username?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || ""} />
                      <AvatarFallback className="bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300">
                        {user.username?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer flex w-full">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer flex w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer flex w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Ustawienia</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => logout()} 
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Wyloguj się</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex md:items-center md:space-x-2">
                <Button asChild variant="ghost">
                  <Link href="/login">Zaloguj się</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Zarejestruj się</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 dark:text-gray-300"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-border">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/lessons"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Lekcje
            </Link>
            <Link
              href="/quizzes"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Quizy
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              O platformie
            </Link>
          </div>
          {!user && (
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-around px-5">
                <Button asChild variant="outline" className="w-full mr-2">
                  <Link 
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Zaloguj się
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link 
                    href="/register"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Zarejestruj się
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}