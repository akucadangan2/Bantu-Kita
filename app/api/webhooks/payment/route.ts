import { NextResponse } from "next/server";

// TODO: placeholder webhook untuk payment gateway (Midtrans/DOKU), disiapkan
// strukturnya dulu — logikanya menyusul saat modul pembayaran digarap:
// 1. Verifikasi signature/notifikasi dari gateway (JANGAN percaya body mentah-mentah)
// 2. Cocokkan payment_reference dengan record di donations/zakat_transactions/wakaf_transactions
// 3. Update payment_status jadi 'paid' (atau 'failed'/'expired')
// 4. Kalau 'paid' dan sumbernya donations -> increment campaigns.collected_amount

export async function POST(request: Request) {
  // const body = await request.json();
  return NextResponse.json({ message: "Webhook belum diimplementasikan" }, { status: 501 });
}
