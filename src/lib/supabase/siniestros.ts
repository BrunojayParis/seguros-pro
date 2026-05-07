import type { PostgrestError } from "@supabase/supabase-js";
import { createServerClient } from "./client";
import type { Enums, Tables, TablesInsert } from "@/types/database.types";

type HelperError = PostgrestError | Error;
type HelperResult<T> = Promise<{ data: T | null; error: HelperError | null }>;
type Siniestro = Tables<"siniestros">;
type SiniestroInsert = Omit<TablesInsert<"siniestros">, "org_id">;

const toError = (error: unknown) =>
  error instanceof Error ? error : new Error("Unexpected Supabase helper error");

export async function getSiniestrosByCliente(
  orgId: string,
  clienteId: string,
): HelperResult<Siniestro[]> {
  try {
    const supabase = await createServerClient();

    return await supabase
      .from("siniestros")
      .select("*")
      .eq("org_id", orgId)
      .eq("cliente_id", clienteId)
      .order("fecha_ocurrencia", { ascending: false });
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}

export async function getSiniestrosByPoliza(
  orgId: string,
  polizaId: string,
): HelperResult<Siniestro[]> {
  try {
    const supabase = await createServerClient();

    return await supabase
      .from("siniestros")
      .select("*")
      .eq("org_id", orgId)
      .eq("poliza_id", polizaId)
      .order("fecha_ocurrencia", { ascending: false });
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}

export async function createSiniestro(
  orgId: string,
  data: SiniestroInsert,
): HelperResult<Siniestro> {
  try {
    const supabase = await createServerClient();

    return await supabase
      .from("siniestros")
      .insert({ ...data, org_id: orgId })
      .select()
      .single();
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}

export async function updateSiniestroEstado(
  orgId: string,
  siniestroId: string,
  estado: Enums<"estado_siniestro">,
): HelperResult<Siniestro> {
  try {
    const supabase = await createServerClient();

    return await supabase
      .from("siniestros")
      .update({ estado })
      .eq("org_id", orgId)
      .eq("id", siniestroId)
      .select()
      .single();
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}
