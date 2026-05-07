import type { PostgrestError } from "@supabase/supabase-js";
import { createServerClient } from "./client";
import type { Tables } from "@/types/database.types";

type HelperError = PostgrestError | Error;
type HelperResult<T> = Promise<{ data: T | null; error: HelperError | null }>;
type VencimientoProximo = Tables<"v_vencimientos_proximos">;
type ResumenProductor = Tables<"v_resumen_productor">;

const toError = (error: unknown) =>
  error instanceof Error ? error : new Error("Unexpected Supabase helper error");

export async function getVencimientosProximos(
  orgId: string,
  dias = 30,
): HelperResult<VencimientoProximo[]> {
  try {
    const supabase = await createServerClient();

    return await supabase
      .from("v_vencimientos_proximos")
      .select("*")
      .eq("org_id", orgId)
      .lte("dias_restantes", dias)
      .order("dias_restantes", { ascending: true });
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}

export async function getResumenProductor(
  orgId: string,
): HelperResult<ResumenProductor[]> {
  try {
    const supabase = await createServerClient();

    return await supabase
      .from("v_resumen_productor")
      .select("*")
      .eq("org_id", orgId)
      .order("productor_nombre", { ascending: true });
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}
