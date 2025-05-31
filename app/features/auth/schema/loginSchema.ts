import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy adres email." }),
  password: z.string().min(1, { message: "Hasło jest wymagane." }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
