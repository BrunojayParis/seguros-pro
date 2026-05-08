"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/getSession";
import { convertirLeadACliente, createLead, getLeadById, updateLead } from "@/lib/supabase/leads";
import { normalizeLeadFormData, leadFormSchema, leadUpdateSchema, type LeadFormData } from "@/types/leads";
import type { ClienteFormData } from "@/types/clientes";

type ActionResult<T> = {
  data: T | null;
  error: string | null;
};

function toNullable(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function createLeadAction(formData: LeadFormData): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  if (!session || !session.currentOrg) {
    throw new Error("No autenticado");
  }

  const parsed = leadFormSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Datos invalidos" };
  }

  const data = normalizeLeadFormData(parsed.data);
  const { data: lead, error } = await createLead(session.currentOrg.id, {
    nombre: data.nombre,
    telefono: toNullable(data.telefono),
    email: toNullable(data.email),
    ramo_interes: data.ramo_interes ?? null,
    etapa: data.etapa,
    valor_estimado: data.valor_estimado ?? null,
    origen: toNullable(data.origen),
    proxima_accion: toNullable(data.proxima_accion),
    fecha_proxima: toNullable(data.fecha_proxima),
    notas: toNullable(data.notas),
    perdido_motivo: toNullable(data.perdido_motivo),
    productor_id: session.user.id,
    cliente_id: null,
  });

  if (error || !lead) {
    return { data: null, error: error?.message ?? "No pudimos crear el lead" };
  }

  revalidatePath("/dashboard/crm");
  return { data: { id: lead.id }, error: null };
}

export async function updateLeadAction(
  leadId: string,
  formData: Partial<LeadFormData>,
): Promise<ActionResult<null>> {
  const session = await getSession();
  if (!session || !session.currentOrg) {
    throw new Error("No autenticado");
  }

  const { data: lead, error: leadError } = await getLeadById(session.currentOrg.id, leadId);
  if (leadError || !lead) {
    return { data: null, error: "Lead no encontrado" };
  }

  const parsed = leadUpdateSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Datos invalidos" };
  }

  const etapaFinal = parsed.data.etapa ?? lead.etapa;
  const motivoFinal = parsed.data.perdido_motivo ?? lead.perdido_motivo;
  const etapaEsPerdida = etapaFinal === "perdido" || etapaFinal === "descartado";
  if (etapaEsPerdida && !motivoFinal?.trim()) {
    return { data: null, error: "Ingresa el motivo de perdida/archivo" };
  }

  const payload: Parameters<typeof updateLead>[2] = {
    ...(parsed.data.nombre !== undefined ? { nombre: parsed.data.nombre.trim() } : {}),
    ...(parsed.data.telefono !== undefined ? { telefono: toNullable(parsed.data.telefono) } : {}),
    ...(parsed.data.email !== undefined ? { email: toNullable(parsed.data.email) } : {}),
    ...(parsed.data.ramo_interes !== undefined ? { ramo_interes: parsed.data.ramo_interes ?? null } : {}),
    ...(parsed.data.etapa !== undefined ? { etapa: parsed.data.etapa } : {}),
    ...(parsed.data.valor_estimado !== undefined ? { valor_estimado: parsed.data.valor_estimado ?? null } : {}),
    ...(parsed.data.origen !== undefined ? { origen: toNullable(parsed.data.origen) } : {}),
    ...(parsed.data.proxima_accion !== undefined
      ? { proxima_accion: toNullable(parsed.data.proxima_accion) }
      : {}),
    ...(parsed.data.fecha_proxima !== undefined ? { fecha_proxima: toNullable(parsed.data.fecha_proxima) } : {}),
    ...(parsed.data.notas !== undefined ? { notas: toNullable(parsed.data.notas) } : {}),
    ...(parsed.data.perdido_motivo !== undefined
      ? { perdido_motivo: toNullable(parsed.data.perdido_motivo) }
      : {}),
  };

  const { error } = await updateLead(session.currentOrg.id, lead.id, payload);
  if (error) {
    return { data: null, error: error.message ?? "No pudimos actualizar el lead" };
  }

  revalidatePath("/dashboard/crm");
  return { data: null, error: null };
}

export async function convertirLeadAClienteAction(
  leadId: string,
  clienteData: ClienteFormData,
): Promise<ActionResult<{ clienteId: string }>> {
  const session = await getSession();
  if (!session || !session.currentOrg) {
    throw new Error("No autenticado");
  }

  if (session.rol === "asistente") {
    return { data: null, error: "No autorizado" };
  }

  const { data: lead, error: leadError } = await getLeadById(session.currentOrg.id, leadId);
  if (leadError || !lead) {
    return { data: null, error: "Lead no encontrado" };
  }

  const nombreCompleto = (clienteData.nombre ?? "").trim();
  const apellido = (clienteData.apellido ?? "").trim();

  const { data, error } = await convertirLeadACliente(session.currentOrg.id, lead.id, {
    tipo_persona: clienteData.tipo_persona,
    estado: clienteData.estado,
    nombre: nombreCompleto || null,
    apellido: apellido || null,
    dni: toNullable(clienteData.dni),
    fecha_nacimiento: toNullable(clienteData.fecha_nacimiento),
    cuit_cuil: toNullable(clienteData.cuit_cuil),
    estado_civil: toNullable(clienteData.estado_civil),
    razon_social: toNullable(clienteData.razon_social),
    cuit_empresa: toNullable(clienteData.cuit_empresa),
    email: toNullable(clienteData.email),
    telefono: toNullable(clienteData.telefono),
    domicilio: toNullable(clienteData.domicilio),
    localidad: toNullable(clienteData.localidad),
    provincia: toNullable(clienteData.provincia),
    codigo_postal: toNullable(clienteData.codigo_postal),
    notas: toNullable(clienteData.notas),
    productor_id: session.user.id,
  });

  if (error || !data) {
    return { data: null, error: error?.message ?? "No pudimos convertir el lead" };
  }

  revalidatePath("/dashboard/crm");
  revalidatePath("/dashboard/clientes");
  return { data: { clienteId: data.id }, error: null };
}
