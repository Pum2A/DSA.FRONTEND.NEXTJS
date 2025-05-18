"use client";
import useSWR from "swr";
import { apiService } from "@/app/lib/api";
import { NavbarNav } from "./NavbarComponents/NavbarNav";
import { useState } from "react";
import { useAuthStore } from "@/app/store/authStore";
import { useScrolledNavbar } from "./useScrolledNavbar";
import { useCloseOnPathChange } from "./useCloseOnPathChange";
import { NavbarLogo } from "./NavbarComponents/NavbarLogo";
import { NavbarUserSection } from "./NavbarComponents/NavbarUserSection";
import { NavbarMobileMenu } from "./NavbarComponents/NavbarMobileMenu";

export function Navbar() {
  const { isAuthenticated, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrolled = useScrolledNavbar();
  useCloseOnPathChange(setIsMenuOpen);

  const fetcher = (path: string) => apiService.get(path);
  const { data: user, isLoading } = useSWR(
    isAuthenticated ? "Auth/user" : null,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-300 border-b ${
        scrolled
          ? "bg-white/95 backdrop-blur-sm border-gray-200 shadow-sm dark:bg-gray-900/95 dark:border-gray-800"
          : "bg-white border-transparent dark:bg-gray-900"
      }`}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <NavbarLogo isAuthenticated={isAuthenticated} />
          <NavbarNav isAuthenticated={isAuthenticated} />
          <NavbarUserSection
            isAuthenticated={isAuthenticated}
            user={
              user as {
                firstName?: string;
                lastName?: string;
                userName?: string;
                level?: number;
              } | null
            }
            isLoading={isLoading}
            logout={logout}
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
          />
        </div>
      </div>
      <NavbarMobileMenu
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
        isAuthenticated={isAuthenticated}
        user={
          user as {
            firstName?: string;
            lastName?: string;
            userName?: string;
          } | null
        }
        isLoading={isLoading}
        logout={logout}
      />
    </header>
  );
}
