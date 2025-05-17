/**
 * Funkcja wyciągająca czytelny komunikat błędu z odpowiedzi API.
 * Dopasuj do własnego backendu!
 */
export function extractErrorMessage(
  error: any,
  defaultMessage: string
): string {
  return (
    error?.response?.data?.errors?.[0] ||
    error?.response?.data?.title ||
    error?.response?.data?.message ||
    error?.message ||
    defaultMessage
  );
}
