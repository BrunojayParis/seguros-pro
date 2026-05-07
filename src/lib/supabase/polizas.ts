import type { PostgrestError } from "@supabase/supabase-js";
import { createServerClient } from "./client";
import type { Enums, Tables, TablesInsert } from "@/types/database.types";

type HelperError = PostgrestError | Error;
type HelperResult<T> = Promise<{ data: T | null; error: HelperError | null }>;

type Poliza = Tables<"polizas">;
type PolizaInsert = Omit<TablesInsert<"polizas">, "org_id">;
type AutomotorInsert = Omit<TablesInsert<"polizas_automotor">, "poliza_id">;
type VidaInsert = Omit<TablesInsert<"polizas_vida">, "poliza_id">;
type AccidentesInsert = Omit<TablesInsert<"polizas_accidentes">, "poliza_id">;
type HogarInsert = Omit<TablesInsert<"polizas_hogar">, "poliza_id">;
type ArtInsert = Omit<TablesInsert<"polizas_art">, "poliza_id">;

type PolizaDetalle =
  | Tables<"polizas_automotor">
  | Tables<"polizas_vida">
  | Tables<"polizas_accidentes">
  | Tables<"polizas_hogar">
  | Tables<"polizas_art">;

export type PolizaWithDetalle = Poliza & { detalle: PolizaDetalle | null };

export type PolizaCreateData = PolizaInsert & {
  detalle?: {
    automotor?: AutomotorInsert;
    vida?: VidaInsert;
    accidentes?: AccidentesInsert;
    hogar?: HogarInsert;
    art?: ArtInsert;
  };
};

export type PolizaFilters = {
  ramo?: Enums<"ramo_seguro">;
  estado?: Enums<"estado_poliza">;
  clienteId?: string;
};

const toError = (error: unknown) =>
  error instanceof Error ? error : new Error("Unexpected Supabase helper error");

export async function getPolizas(
  orgId: string,
  filters: PolizaFilters = {},
): HelperResult<Poliza[]> {
  try {
    const supabase = await createServerClient();
    let query = supabase
      .from("polizas")
      .select("*")
      .eq("org_id", orgId)
      .order("vigencia_hasta", { ascending: true });

    if (filters.ramo) query = query.eq("ramo", filters.ramo);
    if (filters.estado) query = query.eq("estado", filters.estado);
    if (filters.clienteId) query = query.eq("cliente_id", filters.clienteId);

    return await query;
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}

export async function getPolizaById(
  orgId: string,
  polizaId: string,
): HelperResult<PolizaWithDetalle> {
  try {
    const supabase = await createServerClient();
    const { data: poliza, error } = await supabase
      .from("polizas")
      .select("*")
      .eq("org_id", orgId)
      .eq("id", polizaId)
      .single();

    if (error || !poliza) return { data: null, error };

    let detalle: PolizaDetalle | null = null;
    let detalleError: PostgrestError | null = null;

    if (poliza.ramo === "automotor") {
      const result = await supabase
        .from("polizas_automotor")
        .select("*")
        .eq("poliza_id", poliza.id)
        .maybeSingle();
      detalle = result.data;
      detalleError = result.error;
    } else if (poliza.ramo === "vida") {
      const result = await supabase
        .from("polizas_vida")
        .select("*")
        .eq("poliza_id", poliza.id)
        .maybeSingle();
      detalle = result.data;
      detalleError = result.error;
    } else if (poliza.ramo === "accidentes_personales") {
      const result = await supabase
        .from("polizas_accidentes")
        .select("*")
        .eq("poliza_id", poliza.id)
        .maybeSingle();
      detalle = result.data;
      detalleError = result.error;
    } else if (poliza.ramo === "hogar" || poliza.ramo === "combinado_familiar") {
      const result = await supabase
        .from("polizas_hogar")
        .select("*")
        .eq("poliza_id", poliza.id)
        .maybeSingle();
      detalle = result.data;
      detalleError = result.error;
    } else if (poliza.ramo === "art") {
      const result = await supabase
        .from("polizas_art")
        .select("*")
        .eq("poliza_id", poliza.id)
        .maybeSingle();
      detalle = result.data;
      detalleError = result.error;
    }

    if (detalleError) return { data: null, error: detalleError };

    return { data: { ...poliza, detalle }, error: null };
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}

export async function getPolizasByCliente(
  orgId: string,
  clienteId: string,
): HelperResult<Poliza[]> {
  return getPolizas(orgId, { clienteId });
}

export async function createPoliza(
  orgId: string,
  data: PolizaCreateData,
): HelperResult<PolizaWithDetalle> {
  try {
    const supabase = await createServerClient();
    const { detalle, ...polizaData } = data;

    const { data: poliza, error } = await supabase
      .from("polizas")
      .insert({ ...polizaData, org_id: orgId })
      .select()
      .single();

    if (error || !poliza) return { data: null, error };

    let detalleResult:
      | { data: PolizaDetalle | null; error: PostgrestError | null }
      | null = null;

    // Best-effort two-step insert; replace with an RPC for a true DB transaction.
    if (poliza.ramo === "automotor" && detalle?.automotor) {
      detalleResult = await supabase
        .from("polizas_automotor")
        .insert({ ...detalle.automotor, poliza_id: poliza.id })
        .select()
        .single();
    } else if (poliza.ramo === "vida" && detalle?.vida) {
      detalleResult = await supabase
        .from("polizas_vida")
        .insert({ ...detalle.vida, poliza_id: poliza.id })
        .select()
        .single();
    } else if (poliza.ramo === "accidentes_personales" && detalle?.accidentes) {
      detalleResult = await supabase
        .from("polizas_accidentes")
        .insert({ ...detalle.accidentes, poliza_id: poliza.id })
        .select()
        .single();
    } else if (
      (poliza.ramo === "hogar" || poliza.ramo === "combinado_familiar") &&
      detalle?.hogar
    ) {
      detalleResult = await supabase
        .from("polizas_hogar")
        .insert({ ...detalle.hogar, poliza_id: poliza.id })
        .select()
        .single();
    } else if (poliza.ramo === "art" && detalle?.art) {
      detalleResult = await supabase
        .from("polizas_art")
        .insert({ ...detalle.art, poliza_id: poliza.id })
        .select()
        .single();
    }

    if (detalleResult?.error) {
      await supabase
        .from("polizas")
        .delete()
        .eq("org_id", orgId)
        .eq("id", poliza.id);

      return { data: null, error: detalleResult.error };
    }

    return {
      data: { ...poliza, detalle: detalleResult?.data ?? null },
      error: null,
    };
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}

export async function updatePolizaEstado(
  orgId: string,
  polizaId: string,
  estado: Enums<"estado_poliza">,
  motivoBaja?: string,
): HelperResult<Poliza> {
  try {
    const supabase = await createServerClient();

    return await supabase
      .from("polizas")
      .update({ estado, motivo_baja: motivoBaja ?? null })
      .eq("org_id", orgId)
      .eq("id", polizaId)
      .select()
      .single();
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}
