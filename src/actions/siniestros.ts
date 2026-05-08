"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/getSession";
import { createActividad } from "@/lib/supabase/actividades";
import { createServerClient } from "@/lib/supabase/client";
import { updateSiniestroEstado } from "@/lib/supabase/siniestros";
import type { EstadoSiniestro, SiniestroConDetalle } from "@/types/siniestros";

type ActionResult<T> = {
  data: T | null;
  error: string | null;
};

export async function getSiniestrosAction(orgId: string): Promise<ActionResult<SiniestroConDetalle[]>> {
  const session = await getSession();
  if (!session || !session.currentOrg) {
    return { data: null, error: "No autenticado" };
  }

  if (session.currentOrg.id !== orgId) {
    return { data: null, error: "Organizacion invalida" };
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("siniestros")
    .select(
      "*, cliente:clientes(id, nombre, apellido, razon_social, telefono, email), poliza:polizas(id, numero_poliza, ramo, aseguradora:aseguradoras(id, nombre))",
    )
    .eq("org_id", orgId)
    .order("fecha_denuncia", { ascending: false });

  if (error) {
    return { data: null, error: error.message ?? "No pudimos cargar siniestros" };
  }

  return { data: (data ?? []) as SiniestroConDetalle[], error: null };
}

const VALID_NEXT_STATES: Record<EstadoSiniestro, EstadoSiniestro[]> = {
  denunciado: ["en_instruccion"],
  en_instruccion: ["periciado"],
  periciado: ["aprobado", "rechazado"],
  aprobado: ["pagado"],
  rechazado: ["cerrado"],
  pagado: ["cerrado"],
  cerrado: [],
};

export async function updateSiniestroEstadoAction(
  siniestroId: string,
  estado: EstadoSiniestro,
  observaciones?: string,
): Promise<ActionResult<null>> {
  const session = await getSession();
  if (!session || !session.currentOrg) {
    throw new Error("No autenticado");
  }

  if (session.rol === "asistente") {
    return { data: null, error: "No autorizado" };
  }

  const supabase = await createServerClient();
  const { data: actual, error: actualError } = await supabase
    .from("siniestros")
    .select("id, org_id, poliza_id, cliente_id, estado")
    .eq("id", siniestroId)
    .eq("org_id", session.currentOrg.id)
    .single();

  if (actualError || !actual) {
    return { data: null, error: "Siniestro no encontrado" };
  }

  if (!VALID_NEXT_STATES[actual.estado as EstadoSiniestro].includes(estado)) {
    return { data: null, error: "Transicion de estado invalida" };
  }

  const { error } = await updateSiniestroEstado(session.currentOrg.id, siniestroId, estado);
  if (error) {
    return { data: null, error: error.message ?? "No pudimos actualizar el estado" };
  }

  const cleanObservaciones = observaciones?.trim();
  if (cleanObservaciones) {
    const { error: observacionError } = await supabase
      .from("siniestros")
      .update({ observaciones: cleanObservaciones })
      .eq("org_id", session.currentOrg.id)
      .eq("id", siniestroId);

    if (observacionError) {
      return { data: null, error: observacionError.message ?? "No pudimos guardar observaciones" };
    }
  }

  await createActividad(session.currentOrg.id, {
    tipo: "estado_cambiado",
    titulo: "Estado de siniestro actualizado",
    descripcion: `Nuevo estado: ${estado}`,
    siniestro_id: siniestroId,
    poliza_id: actual.poliza_id,
    cliente_id: actual.cliente_id,
    usuario_id: session.user.id,
  });

  revalidatePath("/dashboard/siniestros");
  revalidatePath(`/dashboard/polizas/${actual.poliza_id}`);
  revalidatePath(`/dashboard/clientes/${actual.cliente_id}`);
  return { data: null, error: null };
}
