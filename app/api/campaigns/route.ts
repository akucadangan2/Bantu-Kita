import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// TODO: GET -> list campaign (filter status/kategori/tipe); POST -> buat campaign baru (role fundraiser), validasi pakai createCampaignSchema

export async function GET() {
  const supabase = await createClient();
  return NextResponse.json({ message: "GET belum diimplementasikan" }, { status: 501 });
}

export async function POST() {
  const supabase = await createClient();
  return NextResponse.json({ message: "POST belum diimplementasikan" }, { status: 501 });
}
