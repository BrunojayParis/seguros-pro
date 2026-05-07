import type { PostgrestError } from "@supabase/supabase-js";
import { createServerClient } from "./client";
import type { Tables } from "@/types/database.types";

type HelperError = PostgrestError | Error;
type HelperResult<T> = Promise<{ data: T | null; error: HelperError | null }>;
type Organizacion = Tables<"organizaciones">;
type OrgUsuarioWithOrganizacion = Tables<"org_usuarios"> & {
  organizaciones: Organizacion | null;
};

const toError = (error: unknown) =>
  error instanceof Error ? error : new Error("Unexpected Supabase helper error");

export async function getOrganizacionById(
  id: string,
): HelperResult<Organizacion> {
  try {
    const supabase = await createServerClient();

    return await supabase
      .from("organizaciones")
      .select("*")
      .eq("id", id)
      .single();
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}

export async function getOrganizacionesByUsuario(
  usuarioId: string,
): HelperResult<Organizacion[]> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("org_usuarios")
      .select("*, organizaciones(*)")
      .eq("usuario_id", usuarioId)
      .eq("activo", true)
      .returns<OrgUsuarioWithOrganizacion[]>();

    return {
      data: data?.flatMap((row) => (row.organizaciones ? [row.organizaciones] : [])) ?? null,
      error,
    };
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}
