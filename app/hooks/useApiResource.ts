import useSWR from "swr";
import toast from "react-hot-toast";

export function useApiResource<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options?: object
) {
  const { data, error, isLoading, mutate } = useSWR<T>(key, fetcher, options);

  if (error) {
    toast.error("Failed to load resource.");
  }

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
