import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// TODO: GET -> detail 1 campaign; PATCH -> update campaign (hanya pemilik/admin); pertimbangkan pisah PATCH dari template GET/POST di atas

export async function GET() {
  const supabase = await createClient();
  return NextResponse.json({ message: "GET belum diimplementasikan" }, { status: 501 });
}

export async function POST() {
  const supabase = await createClient();
  return NextResponse.json({ message: "POST belum diimplementasikan" }, { status: 501 });
}
