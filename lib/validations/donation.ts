import { z } from "zod";
import { MIN_DONATION_AMOUNT } from "@/lib/constants";

export const createDonationSchema = z.object({
  campaignId: z.string().uuid(),
  amount: z.coerce.number().min(MIN_DONATION_AMOUNT, `Donasi minimal Rp${MIN_DONATION_AMOUNT.toLocaleString("id-ID")}`),
  donorName: z.string().min(2).default("Hamba Allah"),
  isAnonymous: z.boolean().default(false),
  message: z.string().max(280).optional(),
});

export type CreateDonationInput = z.infer<typeof createDonationSchema>;
