import { z } from "zod";

export const createZakatSchema = z.object({
  zakatTypeId: z.string().uuid(),
  amount: z.coerce.number().min(10_000, "Minimal Rp10.000"),
  muzakkiName: z.string().min(2).default("Orang Baik"),
});

export type CreateZakatInput = z.infer<typeof createZakatSchema>;
