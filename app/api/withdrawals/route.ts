import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// TODO: POST -> fundraiser ajukan pencairan dana (validasi saldo campaign.collected_amount cukup)

export async function GET() {
  const supabase = await createClient();
  return NextResponse.json({ message: "GET belum diimplementasikan" }, { status: 501 });
}

export async function POST() {
  const supabase = await createClient();
  return NextResponse.json({ message: "POST belum diimplementasikan" }, { status: 501 });
}
