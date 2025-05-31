import { z } from "zod";

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Nazwa użytkownika musi mieć co najmniej 3 znaki." }),
    email: z.string().email({ message: "Nieprawidłowy adres email." }),
    password: z
      .string()
      .min(6, { message: "Hasło musi mieć co najmniej 6 znaków." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie pasują do siebie.",
    path: ["confirmPassword"], // Ścieżka błędu
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
