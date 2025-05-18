"use client";
import { Avatar, AvatarFallback } from "../../../../components/ui/avatar";
import { Button } from "../../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { Skeleton } from "../../../../components/ui/skeleton";
import {
  ChevronDown,
  Loader2,
  LogOut,
  LayoutDashboard,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type NavbarUserSectionProps = {
  isAuthenticated: boolean;
  user?: {
    firstName?: string;
    lastName?: string;
    userName?: string;
    level?: number;
  } | null;
  isLoading: boolean;
  logout: () => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
};

export function NavbarUserSection({
  isAuthenticated,
  user,
  isLoading,
  logout,
}: NavbarUserSectionProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  if (!isAuthenticated) {
    return (
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
    );
  }

  if (isLoading && !user) {
    return (
      <div className="flex items-center space-x-2 px-2 h-10 animate-pulse">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="hidden lg:block space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center space-x-2 px-2 py-1 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Avatar className="h-8 w-8">
            {/* <AvatarImage src="" alt={user?.userName} /> */}
            <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 text-xs font-semibold">
              {getInitials(user?.firstName, user?.lastName, user?.userName)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:flex flex-col items-start text-xs">
            <span className="font-semibold text-gray-900 dark:text-gray-100 leading-tight">
              {user?.userName}
            </span>
            <span className="text-gray-500 dark:text-gray-400 leading-tight">
              Poz. {user?.level ?? 1}
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
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              @{user?.userName}
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
  );
}
