"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LayoutDashboard, BookOpen, Award } from "lucide-react";

export type NavbarMobileMenuProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isAuthenticated: boolean;
  user?: {
    firstName?: string;
    lastName?: string;
    userName?: string;
  } | null;
  isLoading: boolean;
  logout: () => void;
};

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    protected: true,
    icon: LayoutDashboard,
  },
  { name: "Nauka", href: "/learning", protected: true, icon: BookOpen },
  { name: "Rankingi", href: "/rankings", protected: true, icon: Award },
];

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

export function NavbarMobileMenu({
  isOpen,
  isAuthenticated,
  user,
  isLoading,
  logout,
}: NavbarMobileMenuProps) {
  if (!isOpen) return null;

  return (
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
                "flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-300"
              )}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          ))}
      </div>
      <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
        {isAuthenticated && user ? (
          <>
            <div className="flex items-center px-5 mb-3">
              <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
                <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 text-sm font-semibold">
                  {getInitials(user.firstName, user.lastName, user.userName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="text-base font-medium text-gray-800 dark:text-gray-200 truncate">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  @{user.userName}
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
        ) : isLoading ? (
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
  );
}
