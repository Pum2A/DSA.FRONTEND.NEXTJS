"use client";
import { useState } from "react";
import { useScrolledNavbar } from "./useScrolledNavbar";
import { useCloseOnPathChange } from "./useCloseOnPathChange";
import { NavbarLogo } from "./NavbarComponents/NavbarLogo";
import { NavbarNav } from "./NavbarComponents/NavbarNav";
import { NavbarUserSection } from "./NavbarComponents/NavbarUserSection";
import { NavbarMobileMenu } from "./NavbarComponents/NavbarMobileMenu";
import { useAuthStore } from "../../store/authStore";
import { useCurrentUser } from "../../hooks";
export function Navbar() {
  const { isAuthenticated, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrolled = useScrolledNavbar();
  useCloseOnPathChange(setIsMenuOpen);

  const { data: user, isLoading } = useCurrentUser(isAuthenticated);

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
            user={user}
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
        user={user}
        isLoading={isLoading}
        logout={logout}
      />
    </header>
  );
}
