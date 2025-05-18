import Link from "next/link";
import { LayoutDashboard, BookOpen, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

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

export function NavbarNav({ isAuthenticated }: { isAuthenticated: boolean }) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  return (
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
  );
}
