import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const getSupabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const getServiceRoleKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export function createAdminClient() {
  const url = getSupabaseUrl();
  const serviceRoleKey = getServiceRoleKey();

  if (!url || !serviceRoleKey) {
    throw new Error("Faltan variables de entorno de Supabase Admin");
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
