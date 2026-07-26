import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// TODO: POST -> daftar jadi member program (saling_jaga_members) ATAU submit klaim (saling_jaga_claims), tergantung body.action

export async function GET() {
  const supabase = await createClient();
  return NextResponse.json({ message: "GET belum diimplementasikan" }, { status: 501 });
}

export async function POST() {
  const supabase = await createClient();
  return NextResponse.json({ message: "POST belum diimplementasikan" }, { status: 501 });
}
