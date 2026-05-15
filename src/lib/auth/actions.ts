"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  completeOnboardingSchema,
  type CompleteOnboardingPayload,
  type CompleteOnboardingResult,
} from "@/types/onboarding";
import { getRol } from "./getRol";
import { createAuthServerClient } from "./serverClient";
import type { AuthActionResult } from "./types";

const loginSchema = z.object({
  email: z.string().email("Ingresá un email valido"),
  password: z.string().min(1, "Ingresá tu contrasena"),
});

const registerSchema = z
  .object({
    nombre: z.string().min(2, "Ingresá tu nombre"),
    apellido: z.string().min(2, "Ingresá tu apellido"),
    email: z.string().email("Ingresá un email valido"),
    password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu contrasena"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contrasenas no coinciden",
  });

const mapAuthError = (message?: string) => {
  const errorMessage = message?.toLowerCase() ?? "";

  if (errorMessage.includes("invalid login credentials")) {
    return "Email o contrasena incorrectos";
  }

  if (errorMessage.includes("email not confirmed")) {
    return "Tenes que confirmar tu email antes de ingresar";
  }

  if (errorMessage.includes("user already registered")) {
    return "Ya existe una cuenta con ese email";
  }

  if (errorMessage.includes("database error querying schema")) {
    return "Error de configuracion en Supabase Auth (schema). Revisa el trigger handle_new_user.";
  }

  return "No pudimos completar la operacion. Intentalo nuevamente";
};

const toNullable = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const normalizeEmail = (value: string) => value.trim().toLowerCase();

async function ensurePerfil(
  userId: string,
  profile: { nombre: string; apellido: string; email: string },
) {
  const adminClient = createAdminClient();
  return adminClient.from("perfiles").upsert(
    {
      id: userId,
      nombre: profile.nombre.trim(),
      apellido: profile.apellido.trim(),
      email: normalizeEmail(profile.email),
    },
    { onConflict: "id" },
  );
}

async function ensureOrgMembership(
  orgId: string,
  userId: string,
  rol: "admin" | "productor" | "asistente",
) {
  const adminClient = createAdminClient();
  const { data: existing, error: existingError } = await adminClient
    .from("org_usuarios")
    .select("id, activo")
    .eq("org_id", orgId)
    .eq("usuario_id", userId)
    .maybeSingle();

  if (existingError) {
    return { error: existingError };
  }

  if (existing) {
    const { error } = await adminClient
      .from("org_usuarios")
      .update({ activo: true, rol })
      .eq("id", existing.id)
      .eq("org_id", orgId);
    return { error };
  }

  const { error } = await adminClient.from("org_usuarios").insert({
    org_id: orgId,
    usuario_id: userId,
    rol,
    activo: true,
  });

  return { error };
}

export async function login(formData: FormData): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos ingresados" };
  }

  const supabase = await createAuthServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  return { error: null };
}

export async function register(formData: FormData): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse({
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos ingresados" };
  }

  const supabase = await createAuthServerClient();
  const headersList = await headers();
  const origin = headersList.get("origin");

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: origin ? `${origin}/login` : undefined,
      data: {
        nombre: parsed.data.nombre,
        apellido: parsed.data.apellido,
      },
    },
  });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  return {
    error: null,
    message: "Revisá tu email para confirmar tu cuenta",
  };
}

export async function completeOnboarding(
  payload: CompleteOnboardingPayload,
): Promise<CompleteOnboardingResult> {
  const parsed = completeOnboardingSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa los datos ingresados",
    };
  }

  const data = parsed.data;
  const accountEmail = normalizeEmail(data.account.email);
  const headersList = await headers();
  const origin = headersList.get("origin");
  const authClient = await createAuthServerClient();
  const adminClient = createAdminClient();

  const memberByEmail = new Map<string, (typeof data.team)[number]>();
  for (const member of data.team) {
    const email = normalizeEmail(member.email);
    if (!email || email === accountEmail) {
      continue;
    }
    memberByEmail.set(email, { ...member, email });
  }

  let ownerId: string;
  let ownerEmail = accountEmail;

  if (data.account.useExistingSession) {
    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser();

    if (userError || !user) {
      return { error: "Tu sesion expiro. Ingresa nuevamente" };
    }

    ownerId = user.id;
    ownerEmail = normalizeEmail(user.email ?? accountEmail);

    const { error: updateUserError } = await authClient.auth.updateUser({
      data: {
        nombre: data.account.nombre.trim(),
        apellido: data.account.apellido.trim(),
      },
    });

    if (updateUserError) {
      return {
        error: updateUserError.message ?? "No pudimos actualizar los datos de tu cuenta",
      };
    }
  } else {
    const { data: signUpData, error: signUpError } = await authClient.auth.signUp({
      email: accountEmail,
      password: data.account.password!,
      options: {
        emailRedirectTo: origin ? `${origin}/login` : undefined,
        data: {
          nombre: data.account.nombre.trim(),
          apellido: data.account.apellido.trim(),
        },
      },
    });

    if (signUpError) {
      return { error: mapAuthError(signUpError.message) };
    }

    ownerId = signUpData.user?.id ?? "";
    ownerEmail = normalizeEmail(signUpData.user?.email ?? accountEmail);

    if (!ownerId) {
      return { error: "No pudimos crear la cuenta. Intentalo nuevamente" };
    }
  }

  const { error: ownerProfileError } = await ensurePerfil(ownerId, {
    nombre: data.account.nombre,
    apellido: data.account.apellido,
    email: ownerEmail,
  });

  if (ownerProfileError) {
    return {
      error: ownerProfileError.message ?? "No pudimos crear tu perfil",
    };
  }

  const { data: org, error: orgError } = await adminClient
    .from("organizaciones")
    .insert({
      nombre: data.organization.nombre.trim(),
      cuit: toNullable(data.organization.cuit),
      matricula_ssn: toNullable(data.organization.matricula_ssn),
      telefono: toNullable(data.organization.telefono),
      email: ownerEmail,
    })
    .select("id")
    .single();

  if (orgError || !org) {
    return {
      error: orgError?.message ?? "No pudimos crear la organizacion",
    };
  }

  const ownerMembership = await ensureOrgMembership(org.id, ownerId, "admin");
  if (ownerMembership.error) {
    return {
      error: ownerMembership.error.message ?? "No pudimos vincular tu usuario a la organizacion",
    };
  }

  const inviteWarnings: string[] = [];

  for (const member of memberByEmail.values()) {
    const normalizedMemberEmail = normalizeEmail(member.email);

    const { data: existingProfile, error: profileError } = await adminClient
      .from("perfiles")
      .select("id, email")
      .eq("email", normalizedMemberEmail)
      .maybeSingle();

    if (profileError) {
      inviteWarnings.push(`No pudimos validar ${normalizedMemberEmail}`);
      continue;
    }

    let memberUserId = existingProfile?.id;

    if (!memberUserId) {
      const { data: invitedData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
        normalizedMemberEmail,
        {
          data: {
            nombre: "Usuario",
            apellido: "Invitado",
          },
          redirectTo: origin ? `${origin}/login` : undefined,
        },
      );

      if (inviteError || !invitedData.user?.id) {
        inviteWarnings.push(`No pudimos invitar ${normalizedMemberEmail}`);
        continue;
      }

      memberUserId = invitedData.user.id;

      const { error: memberProfileError } = await ensurePerfil(memberUserId, {
        nombre: "Usuario",
        apellido: "Invitado",
        email: normalizedMemberEmail,
      });

      if (memberProfileError) {
        inviteWarnings.push(`No pudimos crear el perfil de ${normalizedMemberEmail}`);
      }
    }

    const membershipResult = await ensureOrgMembership(org.id, memberUserId, member.rol);
    if (membershipResult.error) {
      inviteWarnings.push(`No pudimos asignar ${normalizedMemberEmail}`);
    }
  }

  if (data.account.useExistingSession) {
    const cookieStore = await cookies();
    cookieStore.set("current_org_id", org.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }

  revalidatePath("/");

  if (data.account.useExistingSession) {
    return {
      error: null,
      status: "done",
      redirectTo: "/dashboard",
      message:
        inviteWarnings.length > 0
          ? "Onboarding completado con algunas invitaciones pendientes"
          : "Onboarding completado",
    };
  }

  return {
    error: null,
    status: "pending_email_confirmation",
    redirectTo: "/login",
    message:
      inviteWarnings.length > 0
        ? "Revisa tu email para confirmar tu cuenta. Algunas invitaciones no pudieron enviarse"
        : "Revisa tu email para confirmar tu cuenta",
  };
}

export async function logout() {
  const supabase = await createAuthServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function switchOrg(orgId: string) {
  const parsed = z.string().uuid().safeParse(orgId);

  if (!parsed.success) {
    return;
  }

  const rol = await getRol(parsed.data);

  if (!rol) {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set("current_org_id", parsed.data, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  revalidatePath("/");
}
