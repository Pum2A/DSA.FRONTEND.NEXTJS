import useSWR from "swr";
import { apiService } from "@/app/lib/api";
import type { User } from "@/app/types/auth";

export function useCurrentUser(isAuthenticated: boolean) {
  return useSWR<User | null>(
    isAuthenticated ? "Auth/user" : null,
    (path) => apiService.get<User>(path),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );
}
