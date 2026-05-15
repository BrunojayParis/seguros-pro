import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getEnvVar } from "@/lib/env";
import type { Database } from "@/types/database.types";

const SUPABASE_URL = getEnvVar("NEXT_PUBLIC_SUPABASE_URL");
const SUPABASE_ANON_KEY = getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY");

const isProtectedRoute = (pathname: string) => pathname.startsWith("/dashboard");
const isLoginRoute = (pathname: string) => pathname === "/login";
const isRegisterRoute = (pathname: string) => pathname === "/register";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookieOptions: {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  let hasActiveOrg = false;

  if (user) {
    const { data } = await supabase
      .from("org_usuarios")
      .select("id")
      .eq("usuario_id", user.id)
      .eq("activo", true)
      .limit(1)
      .maybeSingle();

    hasActiveOrg = Boolean(data);
  }

  if (!user && isProtectedRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isProtectedRoute(pathname) && !hasActiveOrg) {
    const url = request.nextUrl.clone();
    url.pathname = "/register";
    return NextResponse.redirect(url);
  }

  if (user && isLoginRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = hasActiveOrg ? "/dashboard" : "/register";
    return NextResponse.redirect(url);
  }

  if (user && isRegisterRoute(pathname) && hasActiveOrg) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
  ],
};
