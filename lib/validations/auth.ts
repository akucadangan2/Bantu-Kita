import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z.object({
  fullName: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(9, "Nomor HP tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["donatur", "fundraiser"], { required_error: "Pilih jenis akun" }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;