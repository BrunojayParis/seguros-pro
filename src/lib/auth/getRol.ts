import { createAuthServerClient } from "./serverClient";
import type { RolUsuario } from "./types";

export async function getRol(orgId: string): Promise<RolUsuario | null> {
  const supabase = await createAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("org_usuarios")
    .select("rol")
    .eq("org_id", orgId)
    .eq("usuario_id", user.id)
    .eq("activo", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.rol;
}
