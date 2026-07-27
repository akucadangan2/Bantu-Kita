import { z } from "zod";

export const createWakafProgramSchema = z.object({
  title: z.string().min(10, "Judul minimal 10 karakter").max(120),
  description: z.string().min(30, "Deskripsi minimal 30 karakter"),
  pricePerUnit: z.coerce.number().min(1000, "Harga per unit minimal Rp1.000"),
  unitLabel: z.string().min(1, "Label unit wajib diisi (contoh: m2, unit)"),
  totalUnits: z.coerce.number().min(1, "Total unit minimal 1"),
});

export type CreateWakafProgramInput = z.infer<typeof createWakafProgramSchema>;