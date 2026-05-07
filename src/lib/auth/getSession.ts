import { cookies } from "next/headers";
import { getOrganizacionesByUsuario } from "@/lib/supabase/organizaciones";
import { createAuthServerClient } from "./serverClient";
import { getRol } from "./getRol";
import type { SessionData } from "./types";

export async function getSession(): Promise<SessionData | null> {
  const supabase = await createAuthServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const [{ data: perfil }, { data: orgsData }] = await Promise.all([
    supabase.from("perfiles").select("*").eq("id", user.id).maybeSingle(),
    getOrganizacionesByUsuario(user.id),
  ]);

  const orgs = orgsData ?? [];
  const cookieStore = await cookies();
  const selectedOrgId = cookieStore.get("current_org_id")?.value;
  const currentOrg = orgs.find((org) => org.id === selectedOrgId) ?? orgs[0] ?? null;
  const rol = currentOrg ? await getRol(currentOrg.id) : null;

  return {
    user,
    perfil: perfil ?? null,
    orgs,
    currentOrg,
    rol,
  };
}
