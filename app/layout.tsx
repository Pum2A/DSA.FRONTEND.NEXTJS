import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "./components/ui/Navbar";
import "./globals.css";
import { AuthProvider } from "./providers/AuthProvider";
import GlobalLoader from "./components/ui/GlobalLoader";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DSA Learning",
  description:
    "Aplikacja do nauki struktur danych i algorytmów w stylu Duolingo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <Analytics />
          <GlobalLoader />

          <main className="min-h-screen bg-gray-50">{children}</main>
          <footer className="bg-gray-800 text-white py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-lg font-bold">DSA Learning</h2>
                  <p className="text-gray-300 text-sm mt-1">
                    Nauka struktur danych i algorytmów w przyjazny sposób
                  </p>
                </div>
                <div className="text-sm text-gray-300">
                  {new Date().getFullYear()} DSA Learning. Wszystkie prawa
                  zastrzeżone.
                </div>
              </div>
            </div>
          </footer>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
