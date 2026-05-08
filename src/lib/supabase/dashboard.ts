import type { PostgrestError } from "@supabase/supabase-js";
import { createServerClient } from "./client";

type HelperError = PostgrestError | Error;
type HelperResult<T> = Promise<{ data: T | null; error: HelperError | null }>;

export type DashboardMetrics = {
  clientes_total: number;
  clientes_sin_poliza_vigente: number;
  prima_emitida_mes_actual: number;
  prima_emitida_mes_anterior: number;
  prima_variacion_porcentual: number | null;
  prima_variacion_disponible: boolean;
  polizas_emitidas_mes_actual: number;
};

const toError = (error: unknown) =>
  error instanceof Error ? error : new Error("Unexpected Supabase helper error");

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const toIsoDate = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const sumPrimaTotal = (rows: Array<{ prima_total: number | null }> | null) =>
  (rows ?? []).reduce((acc, row) => acc + Number(row.prima_total ?? 0), 0);

export async function getDashboardMetrics(orgId: string): HelperResult<DashboardMetrics> {
  try {
    const supabase = await createServerClient();

    const today = new Date();
    const thisMonthStart = startOfMonth(today);
    const nextMonthStart = startOfMonth(new Date(today.getFullYear(), today.getMonth() + 1, 1));
    const lastMonthStart = startOfMonth(new Date(today.getFullYear(), today.getMonth() - 1, 1));

    const [
      { count: clientesTotalCount, error: clientesTotalError },
      { data: clientesVigentesRows, error: clientesVigentesError },
      { data: thisMonthRows, error: thisMonthError },
      { data: lastMonthRows, error: lastMonthError },
      { count: polizasEmitidasMesCount, error: polizasEmitidasMesError },
    ] = await Promise.all([
      supabase
        .from("clientes")
        .select("id", { count: "exact", head: true })
        .eq("org_id", orgId)
        .neq("estado", "baja"),
      supabase
        .from("polizas")
        .select("cliente_id")
        .eq("org_id", orgId)
        .eq("estado", "vigente"),
      supabase
        .from("polizas")
        .select("prima_total")
        .eq("org_id", orgId)
        .eq("estado", "vigente")
        .gte("fecha_emision", toIsoDate(thisMonthStart))
        .lt("fecha_emision", toIsoDate(nextMonthStart)),
      supabase
        .from("polizas")
        .select("prima_total")
        .eq("org_id", orgId)
        .eq("estado", "vigente")
        .gte("fecha_emision", toIsoDate(lastMonthStart))
        .lt("fecha_emision", toIsoDate(thisMonthStart)),
      supabase
        .from("polizas")
        .select("id", { count: "exact", head: true })
        .eq("org_id", orgId)
        .gte("fecha_emision", toIsoDate(thisMonthStart))
        .lt("fecha_emision", toIsoDate(nextMonthStart)),
    ]);

    const firstError =
      clientesTotalError ??
      clientesVigentesError ??
      thisMonthError ??
      lastMonthError ??
      polizasEmitidasMesError;

    if (firstError) {
      return { data: null, error: firstError };
    }

    const clientesTotal = Number(clientesTotalCount ?? 0);
    const clientesConVigente = new Set((clientesVigentesRows ?? []).map((row) => row.cliente_id).filter(Boolean));
    const clientesSinPolizaVigente = Math.max(clientesTotal - clientesConVigente.size, 0);

    const primaMesActual = sumPrimaTotal(thisMonthRows);
    const primaMesAnterior = sumPrimaTotal(lastMonthRows);
    const primaVariacionDisponible = primaMesAnterior > 0;
    const primaVariacionPorcentual = primaVariacionDisponible
      ? ((primaMesActual - primaMesAnterior) / primaMesAnterior) * 100
      : null;

    return {
      data: {
        clientes_total: clientesTotal,
        clientes_sin_poliza_vigente: clientesSinPolizaVigente,
        prima_emitida_mes_actual: primaMesActual,
        prima_emitida_mes_anterior: primaMesAnterior,
        prima_variacion_porcentual: Number.isFinite(primaVariacionPorcentual ?? 0)
          ? primaVariacionPorcentual
          : null,
        prima_variacion_disponible: primaVariacionDisponible,
        polizas_emitidas_mes_actual: Number(polizasEmitidasMesCount ?? 0),
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}
