import { z } from "zod";

export const createCampaignSchema = z.object({
  title: z.string().min(10, "Judul minimal 10 karakter").max(120),
  categoryId: z.string().uuid("Pilih kategori"),
  story: z.string().min(50, "Cerita/latar belakang minimal 50 karakter"),
  targetAmount: z.coerce.number().min(100_000, "Target donasi minimal Rp100.000"),
  deadline: z.string().optional(),
  beneficiaryName: z.string().min(3, "Nama penerima manfaat wajib diisi"),
  coverImageUrl: z.string().url().optional(),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
