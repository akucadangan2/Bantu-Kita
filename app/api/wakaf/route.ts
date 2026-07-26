import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// TODO: POST -> insert row wakaf_transactions + validasi units tidak melebihi sisa total_units - units_taken

export async function GET() {
  const supabase = await createClient();
  return NextResponse.json({ message: "GET belum diimplementasikan" }, { status: 501 });
}

export async function POST() {
  const supabase = await createClient();
  return NextResponse.json({ message: "POST belum diimplementasikan" }, { status: 501 });
}
