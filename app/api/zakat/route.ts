import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// TODO: POST -> insert row zakat_transactions (payment_status: pending)

export async function GET() {
  const supabase = await createClient();
  return NextResponse.json({ message: "GET belum diimplementasikan" }, { status: 501 });
}

export async function POST() {
  const supabase = await createClient();
  return NextResponse.json({ message: "POST belum diimplementasikan" }, { status: 501 });
}
