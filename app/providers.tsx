"use client"; // Mark this component as a Client Component

import { AuthProvider } from "@/app/context/AuthContext"; // Verify this path is correct
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import { Toaster as SonnerToaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  // Use React.useState to ensure the QueryClient instance is stable and
  // created only once per component lifecycle on the client,
  // and once per request on the server (though it's a client component here).
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <SonnerToaster richColors position="top-right" closeButton />{" "}
        {/* Added closeButton as an example option */}
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
