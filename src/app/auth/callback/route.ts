import { NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/auth/serverClient";

function resolveNextPath(value: string | null, origin: string) {
  if (!value) {
    return "/register";
  }

  try {
    const parsed = new URL(value, origin);
    if (parsed.origin !== origin) {
      return "/register";
    }

    const nextPath = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    if (!nextPath.startsWith("/")) {
      return "/register";
    }

    return nextPath;
  } catch {
    return "/register";
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextPath = resolveNextPath(url.searchParams.get("next"), url.origin);

  if (code) {
    const supabase = await createAuthServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(new URL("/login?error=oauth_callback", url.origin));
    }
  }

  return NextResponse.redirect(new URL(nextPath, url.origin));
}
