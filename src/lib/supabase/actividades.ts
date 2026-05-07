import type { PostgrestError } from "@supabase/supabase-js";
import { createServerClient } from "./client";
import type { Tables, TablesInsert } from "@/types/database.types";

type HelperError = PostgrestError | Error;
type HelperResult<T> = Promise<{ data: T | null; error: HelperError | null }>;
type Actividad = Tables<"actividades">;
type ActividadInsert = Omit<TablesInsert<"actividades">, "org_id">;

const toError = (error: unknown) =>
  error instanceof Error ? error : new Error("Unexpected Supabase helper error");

export async function getActividadesByCliente(
  orgId: string,
  clienteId: string,
  limit = 20,
): HelperResult<Actividad[]> {
  try {
    const supabase = await createServerClient();

    return await supabase
      .from("actividades")
      .select("*")
      .eq("org_id", orgId)
      .eq("cliente_id", clienteId)
      .order("created_at", { ascending: false })
      .limit(limit);
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}

export async function createActividad(
  orgId: string,
  data: ActividadInsert,
): HelperResult<Actividad> {
  try {
    const supabase = await createServerClient();

    return await supabase
      .from("actividades")
      .insert({ ...data, org_id: orgId })
      .select()
      .single();
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}
