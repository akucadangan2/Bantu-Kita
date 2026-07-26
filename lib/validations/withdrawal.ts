import { z } from "zod";

export const createWithdrawalSchema = z.object({
  campaignId: z.string().uuid("Pilih campaign"),
  amount: z.coerce.number().min(50_000, "Minimal pencairan Rp50.000"),
  bankName: z.string().min(2, "Nama bank wajib diisi"),
  accountNumber: z.string().min(5, "Nomor rekening tidak valid"),
  accountHolder: z.string().min(3, "Nama pemilik rekening wajib diisi"),
});

export type CreateWithdrawalInput = z.infer<typeof createWithdrawalSchema>;