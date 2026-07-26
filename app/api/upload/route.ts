import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// TODO: POST -> terima file (multipart/form-data), upload ke Supabase Storage bucket, kembalikan public URL

export async function GET() {
  const supabase = await createClient();
  return NextResponse.json({ message: "GET belum diimplementasikan" }, { status: 501 });
}

export async function POST() {
  const supabase = await createClient();
  return NextResponse.json({ message: "POST belum diimplementasikan" }, { status: 501 });
}
