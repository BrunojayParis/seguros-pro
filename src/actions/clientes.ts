"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createActividad } from "@/lib/supabase/actividades";
import { createCliente, softDeleteCliente, updateCliente } from "@/lib/supabase/clientes";
import { getSession } from "@/lib/auth/getSession";
import { clienteFormSchema, normalizeClienteFormData, type ClienteFormData } from "@/types/clientes";

type ActionResult<T> = {
  data: T | null;
  error: string | null;
};

function toNullable(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function createClienteAction(formData: ClienteFormData): Promise<ActionResult<Awaited<ReturnType<typeof createCliente>>["data"]>> {
  const session = await getSession();
  if (!session || !session.currentOrg) {
    return { data: null, error: "No autenticado" };
  }

  const parsed = clienteFormSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Datos invalidos" };
  }

  const normalized = normalizeClienteFormData(parsed.data);
  const payload = {
    tipo_persona: normalized.tipo_persona,
    estado: normalized.estado,
    nombre: normalized.tipo_persona === "fisica" ? toNullable(normalized.nombre) : null,
    apellido: normalized.tipo_persona === "fisica" ? toNullable(normalized.apellido) : null,
    dni: normalized.tipo_persona === "fisica" ? toNullable(normalized.dni) : null,
    fecha_nacimiento: normalized.tipo_persona === "fisica" ? toNullable(normalized.fecha_nacimiento) : null,
    cuit_cuil: normalized.tipo_persona === "fisica" ? toNullable(normalized.cuit_cuil) : null,
    estado_civil: normalized.tipo_persona === "fisica" ? toNullable(normalized.estado_civil) : null,
    razon_social: normalized.tipo_persona === "juridica" ? toNullable(normalized.razon_social) : null,
    cuit_empresa: normalized.tipo_persona === "juridica" ? toNullable(normalized.cuit_empresa) : null,
    email: toNullable(normalized.email),
    telefono: toNullable(normalized.telefono),
    domicilio: toNullable(normalized.domicilio),
    localidad: toNullable(normalized.localidad),
    provincia: toNullable(normalized.provincia),
    codigo_postal: toNullable(normalized.codigo_postal),
    notas: toNullable(normalized.notas),
    productor_id: session.user.id,
  };

  const { data, error } = await createCliente(session.currentOrg.id, payload);
  if (error || !data) {
    return { data: null, error: error?.message ?? "No pudimos crear el cliente" };
  }

  await createActividad(session.currentOrg.id, {
    tipo: "estado_cambiado",
    titulo: "Cliente registrado",
    descripcion: "Alta de cliente",
    cliente_id: data.id,
    usuario_id: session.user.id,
  });

  revalidatePath("/dashboard/clientes");
  return { data, error: null };
}

export async function updateClienteAction(
  clienteId: string,
  formData: Partial<ClienteFormData>,
): Promise<ActionResult<Awaited<ReturnType<typeof updateCliente>>["data"]>> {
  const session = await getSession();
  if (!session || !session.currentOrg) {
    return { data: null, error: "No autenticado" };
  }

  const parsed = clienteFormSchema.partial().safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Datos invalidos" };
  }

  const base = normalizeClienteFormData({
    tipo_persona: parsed.data.tipo_persona ?? "fisica",
    estado: parsed.data.estado ?? "activo",
    nombre: parsed.data.nombre ?? "",
    apellido: parsed.data.apellido ?? "",
    dni: parsed.data.dni ?? "",
    fecha_nacimiento: parsed.data.fecha_nacimiento ?? "",
    cuit_cuil: parsed.data.cuit_cuil ?? "",
    estado_civil: parsed.data.estado_civil ?? "",
    razon_social: parsed.data.razon_social ?? "",
    cuit_empresa: parsed.data.cuit_empresa ?? "",
    email: parsed.data.email ?? "",
    telefono: parsed.data.telefono ?? "",
    domicilio: parsed.data.domicilio ?? "",
    localidad: parsed.data.localidad ?? "",
    provincia: parsed.data.provincia ?? "",
    codigo_postal: parsed.data.codigo_postal ?? "",
    notas: parsed.data.notas ?? "",
  });

  const payload = {
    ...(parsed.data.tipo_persona ? { tipo_persona: base.tipo_persona } : {}),
    ...(parsed.data.estado ? { estado: base.estado } : {}),
    ...(parsed.data.nombre !== undefined ? { nombre: toNullable(base.nombre) } : {}),
    ...(parsed.data.apellido !== undefined ? { apellido: toNullable(base.apellido) } : {}),
    ...(parsed.data.dni !== undefined ? { dni: toNullable(base.dni) } : {}),
    ...(parsed.data.fecha_nacimiento !== undefined
      ? { fecha_nacimiento: toNullable(base.fecha_nacimiento) }
      : {}),
    ...(parsed.data.cuit_cuil !== undefined ? { cuit_cuil: toNullable(base.cuit_cuil) } : {}),
    ...(parsed.data.estado_civil !== undefined ? { estado_civil: toNullable(base.estado_civil) } : {}),
    ...(parsed.data.razon_social !== undefined ? { razon_social: toNullable(base.razon_social) } : {}),
    ...(parsed.data.cuit_empresa !== undefined ? { cuit_empresa: toNullable(base.cuit_empresa) } : {}),
    ...(parsed.data.email !== undefined ? { email: toNullable(base.email) } : {}),
    ...(parsed.data.telefono !== undefined ? { telefono: toNullable(base.telefono) } : {}),
    ...(parsed.data.domicilio !== undefined ? { domicilio: toNullable(base.domicilio) } : {}),
    ...(parsed.data.localidad !== undefined ? { localidad: toNullable(base.localidad) } : {}),
    ...(parsed.data.provincia !== undefined ? { provincia: toNullable(base.provincia) } : {}),
    ...(parsed.data.codigo_postal !== undefined ? { codigo_postal: toNullable(base.codigo_postal) } : {}),
    ...(parsed.data.notas !== undefined ? { notas: toNullable(base.notas) } : {}),
  };

  const { data, error } = await updateCliente(session.currentOrg.id, clienteId, payload);
  if (error || !data) {
    return { data: null, error: error?.message ?? "No pudimos actualizar el cliente" };
  }

  await createActividad(session.currentOrg.id, {
    tipo: "estado_cambiado",
    titulo: "Cliente actualizado",
    descripcion: "Actualizacion de cliente",
    cliente_id: data.id,
    usuario_id: session.user.id,
  });

  revalidatePath("/dashboard/clientes");
  revalidatePath(`/dashboard/clientes/${clienteId}`);
  revalidatePath("/dashboard/clientes/[id]");
  return { data, error: null };
}

export async function softDeleteClienteAction(clienteId: string): Promise<ActionResult<null>> {
  const session = await getSession();
  if (!session || !session.currentOrg) {
    return { data: null, error: "No autenticado" };
  }

  if (session.rol !== "admin") {
    return { data: null, error: "No autorizado" };
  }

  const { error } = await softDeleteCliente(session.currentOrg.id, clienteId);
  if (error) {
    return { data: null, error: error.message ?? "No pudimos dar de baja el cliente" };
  }

  await createActividad(session.currentOrg.id, {
    tipo: "estado_cambiado",
    titulo: "Cliente actualizado",
    descripcion: "Cliente dado de baja",
    cliente_id: clienteId,
    usuario_id: session.user.id,
  });

  revalidatePath("/dashboard/clientes");
  redirect("/dashboard/clientes");
}
