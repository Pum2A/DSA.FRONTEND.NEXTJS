export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  userName: string; // Dodaj userName dla fallbacku awatara
  level?: number;
  streak?: number;
  joinedAt?: string;
  // Dodaj inne pola, jeśli API je zwraca
}
