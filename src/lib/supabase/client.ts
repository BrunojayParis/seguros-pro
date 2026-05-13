import {
  createBrowserClient as createSupabaseBrowserClient,
  createServerClient as createSupabaseServerClient,
} from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { getEnvVar } from "@/lib/env";

const getSupabaseUrl = () => getEnvVar("NEXT_PUBLIC_SUPABASE_URL");
const getSupabaseAnonKey = () => getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY");

export async function createServerClient(): Promise<SupabaseClient<Database>> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  return createSupabaseServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot set cookies; middleware/actions can refresh them.
          }
        },
      },
    },
  );
}

export function createBrowserClient(): SupabaseClient<Database> {
  return createSupabaseBrowserClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
  );
}
