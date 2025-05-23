import { apiService } from "@/app/lib/api";
import { User } from "@/app/types/user";
import useSWR from "swr";

export function useCurrentUser(isAuthenticated: boolean) {
  return useSWR<User | null>(
    isAuthenticated ? "Auth/user" : null,
    (path) => apiService.get<User>(path),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );
}
