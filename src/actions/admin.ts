"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/getSession";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/client";
import {
  aseguradoraFormSchema,
  inviteUsuarioSchema,
  type AseguradoraFormData,
  type InviteUsuarioData,
  type RolUsuario,
} from "@/types/admin";

type ActionResult<T> = {
  data: T | null;
  error: string | null;
};

type Session = Awaited<ReturnType<typeof getSession>>;
type AdminSession = NonNullable<Session> & {
  currentOrg: NonNullable<NonNullable<Session>["currentOrg"]>;
  rol: "admin";
};

function toNullable(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

async function requireAdminSession() {
  const session = await getSession();

  if (!session || !session.currentOrg) {
    return { session: null, error: "No autenticado" as const };
  }

  if (session.rol !== "admin") {
    return { session: null, error: "No autorizado" as const };
  }

  return { session: session as AdminSession, error: null };
}

export async function inviteUsuarioAction(payload: InviteUsuarioData): Promise<ActionResult<null>> {
  try {
    const access = await requireAdminSession();
    if (access.error || !access.session) {
      return { data: null, error: access.error };
    }

    const parsed = inviteUsuarioSchema.safeParse(payload);
    if (!parsed.success) {
      return { data: null, error: parsed.error.issues[0]?.message ?? "Datos invalidos" };
    }

    const supabase = await createServerClient();
    const orgId = access.session.currentOrg.id;
    const email = parsed.data.email.trim().toLowerCase();

    const { data: perfilExistente, error: perfilError } = await supabase
      .from("perfiles")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (perfilError) {
      return { data: null, error: perfilError.message ?? "No pudimos verificar el email" };
    }

    if (perfilExistente) {
      const { data: orgUsuario, error: orgUsuarioError } = await supabase
        .from("org_usuarios")
        .select("id, activo")
        .eq("org_id", orgId)
        .eq("usuario_id", perfilExistente.id)
        .maybeSingle();

      if (orgUsuarioError) {
        return { data: null, error: orgUsuarioError.message ?? "No pudimos validar la membresia" };
      }

      if (orgUsuario?.activo) {
        return { data: null, error: "Ese email ya pertenece a la organizacion" };
      }

      if (orgUsuario && !orgUsuario.activo) {
        const { error: updateError } = await supabase
          .from("org_usuarios")
          .update({ activo: true, rol: parsed.data.rol })
          .eq("id", orgUsuario.id)
          .eq("org_id", orgId);

        if (updateError) {
          return { data: null, error: updateError.message ?? "No pudimos reactivar el usuario" };
        }

        revalidatePath("/dashboard/admin/usuarios");
        return { data: null, error: null };
      }

      const { error: insertError } = await supabase.from("org_usuarios").insert({
        org_id: orgId,
        usuario_id: perfilExistente.id,
        rol: parsed.data.rol,
        activo: true,
      });

      if (insertError) {
        return { data: null, error: insertError.message ?? "No pudimos agregar el usuario a la organizacion" };
      }

      revalidatePath("/dashboard/admin/usuarios");
      return { data: null, error: null };
    }

    const adminClient = createAdminClient();
    const { data: invitedData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: {
        nombre: parsed.data.nombre.trim(),
        apellido: parsed.data.apellido.trim(),
      },
      redirectTo: "/dashboard",
    });

    if (inviteError) {
      return { data: null, error: inviteError.message ?? "No pudimos enviar la invitacion" };
    }

    const invitedUserId = invitedData.user?.id;
    if (!invitedUserId) {
      return { data: null, error: "No pudimos obtener el usuario invitado" };
    }

    const { error: insertInvitedError } = await supabase.from("org_usuarios").insert({
      org_id: orgId,
      usuario_id: invitedUserId,
      rol: parsed.data.rol,
      activo: true,
    });

    if (insertInvitedError) {
      return { data: null, error: insertInvitedError.message ?? "No pudimos asignar el usuario a la organizacion" };
    }

    revalidatePath("/dashboard/admin/usuarios");
    return { data: null, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "No pudimos invitar el usuario",
    };
  }
}

export async function updateRolAction(usuarioId: string, rol: RolUsuario): Promise<ActionResult<null>> {
  try {
    const access = await requireAdminSession();
    if (access.error || !access.session) {
      return { data: null, error: access.error };
    }

    const parsedUserId = z.string().uuid().safeParse(usuarioId);
    const parsedRol = z.enum(["admin", "productor", "asistente"] satisfies RolUsuario[]).safeParse(rol);
    if (!parsedUserId.success || !parsedRol.success) {
      return { data: null, error: "Datos invalidos" };
    }

    if (parsedUserId.data === access.session.user.id) {
      return { data: null, error: "No podes cambiar tu propio rol" };
    }

    const { error } = await (await createServerClient())
      .from("org_usuarios")
      .update({ rol: parsedRol.data })
      .eq("org_id", access.session.currentOrg.id)
      .eq("usuario_id", parsedUserId.data);

    if (error) {
      return { data: null, error: error.message ?? "No pudimos actualizar el rol" };
    }

    revalidatePath("/dashboard/admin/usuarios");
    return { data: null, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "No pudimos actualizar el rol",
    };
  }
}

export async function toggleUsuarioActivoAction(usuarioId: string): Promise<ActionResult<null>> {
  try {
    const access = await requireAdminSession();
    if (access.error || !access.session) {
      return { data: null, error: access.error };
    }

    const parsedUserId = z.string().uuid().safeParse(usuarioId);
    if (!parsedUserId.success) {
      return { data: null, error: "Usuario invalido" };
    }

    if (parsedUserId.data === access.session.user.id) {
      return { data: null, error: "No podes cambiar tu propio estado" };
    }

    const supabase = await createServerClient();
    const { data: current, error: readError } = await supabase
      .from("org_usuarios")
      .select("activo")
      .eq("org_id", access.session.currentOrg.id)
      .eq("usuario_id", parsedUserId.data)
      .maybeSingle();

    if (readError || !current) {
      return { data: null, error: readError?.message ?? "Usuario no encontrado" };
    }

    const { error } = await supabase
      .from("org_usuarios")
      .update({ activo: !current.activo })
      .eq("org_id", access.session.currentOrg.id)
      .eq("usuario_id", parsedUserId.data);

    if (error) {
      return { data: null, error: error.message ?? "No pudimos actualizar el estado" };
    }

    revalidatePath("/dashboard/admin/usuarios");
    return { data: null, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "No pudimos actualizar el estado",
    };
  }
}

export async function createAseguradoraAction(data: AseguradoraFormData): Promise<ActionResult<{ id: string }>> {
  try {
    const access = await requireAdminSession();
    if (access.error || !access.session) {
      return { data: null, error: access.error };
    }

    const parsed = aseguradoraFormSchema.safeParse(data);
    if (!parsed.success) {
      return { data: null, error: parsed.error.issues[0]?.message ?? "Datos invalidos" };
    }

    const payload = {
      org_id: access.session.currentOrg.id,
      nombre: parsed.data.nombre.trim(),
      cuit: toNullable(parsed.data.cuit),
      codigo: toNullable(parsed.data.codigo),
      contacto: toNullable(parsed.data.contacto),
      telefono: toNullable(parsed.data.telefono),
      email: toNullable(parsed.data.email),
    };

    const { data: created, error } = await (await createServerClient())
      .from("aseguradoras")
      .insert(payload)
      .select("id")
      .single();

    if (error || !created) {
      return { data: null, error: error?.message ?? "No pudimos crear la aseguradora" };
    }

    revalidatePath("/dashboard/admin/aseguradoras");
    revalidatePath("/dashboard/polizas/new");
    return { data: { id: created.id }, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "No pudimos crear la aseguradora",
    };
  }
}

export async function updateAseguradoraAction(
  aseguradoraId: string,
  data: Partial<AseguradoraFormData>,
): Promise<ActionResult<null>> {
  try {
    const access = await requireAdminSession();
    if (access.error || !access.session) {
      return { data: null, error: access.error };
    }

    const parsedId = z.string().uuid().safeParse(aseguradoraId);
    if (!parsedId.success) {
      return { data: null, error: "Aseguradora invalida" };
    }

    const parsed = aseguradoraFormSchema.partial().safeParse(data);
    if (!parsed.success) {
      return { data: null, error: parsed.error.issues[0]?.message ?? "Datos invalidos" };
    }

    const supabase = await createServerClient();
    const { data: existing, error: readError } = await supabase
      .from("aseguradoras")
      .select("id")
      .eq("id", parsedId.data)
      .eq("org_id", access.session.currentOrg.id)
      .maybeSingle();

    if (readError || !existing) {
      return { data: null, error: readError?.message ?? "Aseguradora no encontrada" };
    }

    const payload = {
      ...(parsed.data.nombre !== undefined ? { nombre: parsed.data.nombre.trim() } : {}),
      ...(parsed.data.cuit !== undefined ? { cuit: toNullable(parsed.data.cuit) } : {}),
      ...(parsed.data.codigo !== undefined ? { codigo: toNullable(parsed.data.codigo) } : {}),
      ...(parsed.data.contacto !== undefined ? { contacto: toNullable(parsed.data.contacto) } : {}),
      ...(parsed.data.telefono !== undefined ? { telefono: toNullable(parsed.data.telefono) } : {}),
      ...(parsed.data.email !== undefined ? { email: toNullable(parsed.data.email) } : {}),
    };

    const { error } = await supabase
      .from("aseguradoras")
      .update(payload)
      .eq("id", parsedId.data)
      .eq("org_id", access.session.currentOrg.id);

    if (error) {
      return { data: null, error: error.message ?? "No pudimos actualizar la aseguradora" };
    }

    revalidatePath("/dashboard/admin/aseguradoras");
    revalidatePath("/dashboard/polizas/new");
    return { data: null, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "No pudimos actualizar la aseguradora",
    };
  }
}

export async function toggleAseguradoraActivaAction(aseguradoraId: string): Promise<ActionResult<null>> {
  try {
    const access = await requireAdminSession();
    if (access.error || !access.session) {
      return { data: null, error: access.error };
    }

    const parsedId = z.string().uuid().safeParse(aseguradoraId);
    if (!parsedId.success) {
      return { data: null, error: "Aseguradora invalida" };
    }

    const supabase = await createServerClient();
    const { data: existing, error: readError } = await supabase
      .from("aseguradoras")
      .select("activo")
      .eq("id", parsedId.data)
      .eq("org_id", access.session.currentOrg.id)
      .maybeSingle();

    if (readError || !existing) {
      return { data: null, error: readError?.message ?? "Aseguradora no encontrada" };
    }

    const { error } = await supabase
      .from("aseguradoras")
      .update({ activo: !existing.activo })
      .eq("id", parsedId.data)
      .eq("org_id", access.session.currentOrg.id);

    if (error) {
      return { data: null, error: error.message ?? "No pudimos actualizar el estado" };
    }

    revalidatePath("/dashboard/admin/aseguradoras");
    revalidatePath("/dashboard/polizas/new");
    return { data: null, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "No pudimos actualizar el estado",
    };
  }
}
