'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="pl">
      <body className="bg-gray-100 min-h-screen">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Navbar />
            <main className="max-w-7xl mx-auto p-4">{children}</main>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}