"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/getSession";
import { createActividad } from "@/lib/supabase/actividades";
import { createServerClient } from "@/lib/supabase/client";
import { createSiniestro } from "@/lib/supabase/siniestros";
import { updatePolizaEstado } from "@/lib/supabase/polizas";
import {
  polizaFormSchema,
  siniestroFormSchema,
  type EstadoPoliza,
  type PolizaFormData,
  type SiniestroFormData,
} from "@/types/polizas";
import type { Json } from "@/types/database.types";

type ActionResult<T> = {
  data: T | null;
  error: string | null;
};

function toNullable(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function createPolizaAction(
  formData: PolizaFormData,
): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  if (!session || !session.currentOrg) {
    throw new Error("No autenticado");
  }

  if (session.rol === "asistente") {
    return { data: null, error: "No autorizado" };
  }

  const parsed = polizaFormSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Datos invalidos" };
  }

  const payload = parsed.data;
  const supabase = await createServerClient();

  const p_poliza: Json = {
    org_id: session.currentOrg.id,
    cliente_id: payload.cliente_id,
    aseguradora_id: payload.aseguradora_id,
    productor_id: session.user.id,
    numero_poliza: payload.numero_poliza.trim(),
    ramo: payload.ramo,
    fecha_emision: payload.fecha_emision,
    vigencia_desde: payload.vigencia_desde,
    vigencia_hasta: payload.vigencia_hasta,
    prima_neta: payload.prima_neta,
    impuestos: payload.impuestos,
    periodicidad: payload.periodicidad,
    suma_asegurada: payload.suma_asegurada ?? null,
    notas: toNullable(payload.notas),
  };

  let p_detalle: Json = {};
  if (payload.ramo === "automotor") {
    p_detalle = {
      marca: toNullable(payload.marca),
      modelo: toNullable(payload.modelo),
      anio: payload.anio ?? null,
      version: toNullable(payload.version),
      patente: toNullable(payload.patente),
      chasis: toNullable(payload.chasis),
      motor: toNullable(payload.motor),
      color: toNullable(payload.color),
      uso: toNullable(payload.uso),
      tipo_cobertura: toNullable(payload.tipo_cobertura),
      cero_km: payload.cero_km ?? false,
      gnc: payload.gnc ?? false,
      valor_venal: payload.valor_venal ?? null,
    };
  } else if (payload.ramo === "vida") {
    p_detalle = {
      tipo_vida: toNullable(payload.tipo_vida),
      capital_asegurado: payload.capital_asegurado ?? null,
      plan: toNullable(payload.plan),
      fumador: payload.fumador ?? false,
      fecha_nacimiento: toNullable(payload.fecha_nacimiento),
      profesion: toNullable(payload.profesion),
      beneficiarios: payload.beneficiarios?.length ? payload.beneficiarios : null,
    };
  } else if (payload.ramo === "accidentes_personales") {
    p_detalle = {
      capital_muerte: payload.capital_muerte ?? null,
      capital_invalidez: payload.capital_invalidez ?? null,
      asistencia_medica: payload.asistencia_medica ?? null,
      actividad_cubierta: toNullable(payload.actividad_cubierta),
      horario_cobertura: toNullable(payload.horario_cobertura),
    };
  } else if (payload.ramo === "hogar") {
    p_detalle = {
      tipo_bien: toNullable(payload.tipo_bien),
      domicilio_riesgo: toNullable(payload.domicilio_riesgo),
      superficie_m2: payload.superficie_m2 ?? null,
      tipo_construccion: toNullable(payload.tipo_construccion),
      capital_edificio: payload.capital_edificio ?? null,
      capital_contenido: payload.capital_contenido ?? null,
      coberturas: payload.coberturas?.length ? payload.coberturas : null,
    };
  } else if (payload.ramo === "art") {
    p_detalle = {
      razon_social: toNullable(payload.razon_social),
      cuit_empleador: toNullable(payload.cuit_empleador),
      actividad_ciiu: toNullable(payload.actividad_ciiu),
      cantidad_empleados: payload.cantidad_empleados ?? null,
      masa_salarial: payload.masa_salarial ?? null,
      alicuota: payload.alicuota ?? null,
    };
  }

  const { data, error } = await supabase.rpc("create_poliza_con_detalle", {
    p_poliza,
    p_detalle,
    p_ramo: payload.ramo,
  });

  if (error || !data) {
    return { data: null, error: error?.message ?? "No pudimos crear la poliza" };
  }

  await createActividad(session.currentOrg.id, {
    tipo: "poliza_emitida",
    titulo: "Poliza emitida",
    descripcion: `Alta de poliza ${payload.numero_poliza}`,
    poliza_id: data,
    cliente_id: payload.cliente_id,
    usuario_id: session.user.id,
  });

  revalidatePath("/dashboard/polizas");
  return { data: { id: data }, error: null };
}

export async function updatePolizaEstadoAction(
  polizaId: string,
  estado: EstadoPoliza,
  motivoBaja?: string,
): Promise<ActionResult<null>> {
  const session = await getSession();
  if (!session || !session.currentOrg) {
    throw new Error("No autenticado");
  }

  const isCancelacion = estado === "cancelada";
  const isRenovacion = estado === "vigente";

  if (isCancelacion && session.rol !== "admin") {
    return { data: null, error: "Solo admin puede cancelar polizas" };
  }

  if (isRenovacion && session.rol !== "admin" && session.rol !== "productor") {
    return { data: null, error: "Solo productor o admin puede renovar polizas" };
  }

  const { error } = await updatePolizaEstado(
    session.currentOrg.id,
    polizaId,
    estado,
    motivoBaja,
  );

  if (error) {
    return { data: null, error: error.message ?? "No pudimos actualizar el estado" };
  }

  await createActividad(session.currentOrg.id, {
    tipo: isRenovacion ? "poliza_renovada" : "estado_cambiado",
    titulo: isRenovacion ? "Poliza renovada" : "Estado de poliza actualizado",
    descripcion: isRenovacion ? "Renovacion manual de poliza" : `Nuevo estado: ${estado}`,
    poliza_id: polizaId,
    usuario_id: session.user.id,
  });

  revalidatePath("/dashboard/polizas");
  revalidatePath(`/dashboard/polizas/${polizaId}`);
  return { data: null, error: null };
}

export async function createSiniestroAction(
  formData: SiniestroFormData,
): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  if (!session || !session.currentOrg) {
    throw new Error("No autenticado");
  }

  if (session.rol === "asistente") {
    return { data: null, error: "No autorizado" };
  }

  const parsed = siniestroFormSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Datos invalidos" };
  }

  const payload = parsed.data;
  const { data, error } = await createSiniestro(session.currentOrg.id, {
    poliza_id: payload.poliza_id,
    cliente_id: payload.cliente_id,
    numero_siniestro: toNullable(payload.numero_siniestro),
    fecha_ocurrencia: payload.fecha_ocurrencia,
    descripcion: payload.descripcion.trim(),
    lugar_ocurrencia: toNullable(payload.lugar_ocurrencia),
    monto_reclamado: payload.monto_reclamado ?? null,
    created_by: session.user.id,
  });

  if (error || !data) {
    return { data: null, error: error?.message ?? "No pudimos crear el siniestro" };
  }

  await updatePolizaEstado(session.currentOrg.id, payload.poliza_id, "siniestro");

  await createActividad(session.currentOrg.id, {
    tipo: "siniestro_denunciado",
    titulo: "Siniestro denunciado",
    descripcion: `Se registro el siniestro ${data.numero_siniestro ?? data.id}`,
    poliza_id: payload.poliza_id,
    cliente_id: payload.cliente_id,
    siniestro_id: data.id,
    usuario_id: session.user.id,
  });

  revalidatePath("/dashboard/polizas");
  revalidatePath(`/dashboard/polizas/${payload.poliza_id}`);
  revalidatePath(`/dashboard/clientes/${payload.cliente_id}`);
  revalidatePath("/dashboard/clientes");
  return { data: { id: data.id }, error: null };
}
