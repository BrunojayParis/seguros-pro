"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
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

  return "No pudimos completar la operacion. Intentalo nuevamente";
};

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

  redirect("/dashboard");
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
