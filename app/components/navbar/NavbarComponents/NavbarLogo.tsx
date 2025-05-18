import Link from "next/link";

export function NavbarLogo({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
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
  );
}
