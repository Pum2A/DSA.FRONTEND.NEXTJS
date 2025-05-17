export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error" | string; // Możesz dodać własne typy
  title?: string; // Krótki tytuł powiadomienia
  message: string; // Treść powiadomienia
  createdAt: string; // Data utworzenia (ISO string)
  isRead?: boolean; // Czy powiadomienie jest przeczytane
  icon?: string; // (opcjonalnie) ikona
  url?: string; // (opcjonalnie) link do przekierowania po kliknięciu
  // Dodaj tu inne pola, jeśli Twoje API je zwraca (np. userId, data kontekstu...)
}
