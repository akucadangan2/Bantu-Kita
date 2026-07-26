import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Prefix path yang butuh role tertentu.
// Sesuaikan/tambah sesuai kebutuhan saat modul bertambah.
const ADMIN_PREFIXES = ["/admin"];
const FUNDRAISER_PREFIXES = ["/galang-dana", "/dashboard-penggalang"];
const AUTH_REQUIRED_PREFIXES = ["/akun", ...ADMIN_PREFIXES, ...FUNDRAISER_PREFIXES];

export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);
  const path = request.nextUrl.pathname;

  const needsAuth = AUTH_REQUIRED_PREFIXES.some((p) => path.startsWith(p));
  if (!needsAuth) return response;

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  const needsAdmin = ADMIN_PREFIXES.some((p) => path.startsWith(p));
  const needsFundraiser = FUNDRAISER_PREFIXES.some((p) => path.startsWith(p));

  if (needsAdmin || needsFundraiser) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;

    if (needsAdmin && role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Admin tetap boleh mengakses area fundraiser untuk keperluan moderasi
    if (needsFundraiser && role !== "fundraiser" && role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
