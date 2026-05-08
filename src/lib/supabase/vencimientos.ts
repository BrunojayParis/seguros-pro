import type { PostgrestError } from "@supabase/supabase-js";
import { createServerClient } from "./client";
import type { Tables } from "@/types/database.types";

type HelperError = PostgrestError | Error;
type HelperResult<T> = Promise<{ data: T | null; error: HelperError | null }>;
type VencimientoProximo = Tables<"v_vencimientos_proximos">;
type ResumenProductor = Tables<"v_resumen_productor">;
type PolizaDetalle = Tables<"v_polizas_detalle">;

const toError = (error: unknown) =>
  error instanceof Error ? error : new Error("Unexpected Supabase helper error");

export async function getVencimientosProximos(
  orgId: string,
  dias = 30,
): HelperResult<VencimientoProximo[]> {
  try {
    const supabase = await createServerClient();

    const primary = await supabase
      .from("v_vencimientos_proximos")
      .select("*")
      .eq("org_id", orgId)
      .lte("dias_restantes", dias)
      .order("dias_restantes", { ascending: true });

    if (primary.error) {
      return primary;
    }

    if ((primary.data ?? []).length > 0) {
      return primary;
    }

    const fallback = await supabase
      .from("v_polizas_detalle")
      .select("*")
      .eq("org_id", orgId)
      .lte("dias_para_vencer", dias)
      .order("dias_para_vencer", { ascending: true });

    if (fallback.error) {
      return { data: null, error: fallback.error };
    }

    const mapped: VencimientoProximo[] = (fallback.data ?? []).map((row: PolizaDetalle) => ({
      org_id: row.org_id,
      id: row.id,
      cliente_id: row.cliente_id,
      cliente_nombre: row.cliente_nombre,
      cliente_email: row.cliente_email,
      cliente_telefono: row.cliente_telefono,
      numero_poliza: row.numero_poliza,
      ramo: row.ramo,
      aseguradora_nombre: row.aseguradora_nombre,
      vigencia_hasta: row.vigencia_hasta,
      dias_restantes: row.dias_para_vencer,
      estado: row.estado,
      prima_total: row.prima_total,
    }));

    return { data: mapped, error: null };
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}

export async function getResumenProductor(
  orgId: string,
): HelperResult<ResumenProductor[]> {
  try {
    const supabase = await createServerClient();

    const primary = await supabase
      .from("v_resumen_productor")
      .select("*")
      .eq("org_id", orgId)
      .order("productor_nombre", { ascending: true });

    if (primary.error) {
      return primary;
    }

    if ((primary.data ?? []).length > 0) {
      return primary;
    }

    const fallback = await supabase
      .from("v_polizas_detalle")
      .select("ramo, estado, prima_total, productor_id, productor_nombre")
      .eq("org_id", orgId);

    if (fallback.error) {
      return { data: null, error: fallback.error };
    }

    const grouped = new Map<string, ResumenProductor>();

    (fallback.data ?? []).forEach((row) => {
      const ramo = row.ramo ?? "otros";
      const productorId = row.productor_id ?? "sin-productor";
      const key = `${productorId}:${ramo}`;

      const current = grouped.get(key) ?? {
        org_id: orgId,
        productor_id: row.productor_id,
        productor_nombre: row.productor_nombre,
        ramo,
        polizas_vigentes: 0,
        por_vencer: 0,
        vencidas: 0,
        prima_total_vigente: 0,
      };

      if (row.estado === "vigente") {
        current.polizas_vigentes = Number(current.polizas_vigentes ?? 0) + 1;
        current.prima_total_vigente = Number(current.prima_total_vigente ?? 0) + Number(row.prima_total ?? 0);
      }

      if (row.estado === "por_vencer") {
        current.por_vencer = Number(current.por_vencer ?? 0) + 1;
      }

      if (row.estado === "vencida") {
        current.vencidas = Number(current.vencidas ?? 0) + 1;
      }

      grouped.set(key, current);
    });

    return { data: Array.from(grouped.values()), error: null };
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}
