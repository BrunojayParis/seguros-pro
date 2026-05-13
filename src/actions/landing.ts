"use server";

import { z } from "zod";
import { Resend } from "resend";
import { getEnvVar } from "@/lib/env";

const landingFormSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresa tu nombre completo"),
  email: z.string().trim().email("Ingresa un email valido"),
  telefono: z.string().trim().optional(),
});

export type LandingFormState = {
  success: boolean;
  message: string | null;
};

export const initialLandingFormState: LandingFormState = {
  success: false,
  message: null,
};

export async function submitLandingForm(
  _prevState: LandingFormState,
  formData: FormData,
): Promise<LandingFormState> {
  const parsed = landingFormSchema.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    telefono: formData.get("telefono")?.toString().trim() || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Revisa los datos ingresados",
    };
  }

  const apiKey = getEnvVar("RESEND_API_KEY");
  const toEmail = getEnvVar("LANDING_FORM_TO_EMAIL");
  const fromEmail = getEnvVar("RESEND_FROM_EMAIL") || "onboarding@resend.dev";

  if (!apiKey || !toEmail) {
    return {
      success: false,
      message: "Falta configurar RESEND_API_KEY o LANDING_FORM_TO_EMAIL",
    };
  }

  const resend = new Resend(apiKey);
  const submittedAt = new Date().toISOString();
  const telefono = parsed.data.telefono || "No informado";

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: parsed.data.email,
      subject: "Nuevo lead desde landing de SegurosPro",
      text: [
        "Nuevo lead recibido desde la landing de SegurosPro",
        `Nombre: ${parsed.data.nombre}`,
        `Email: ${parsed.data.email}`,
        `Telefono: ${telefono}`,
        `Fecha: ${submittedAt}`,
      ].join("\n"),
      html: `
        <h2>Nuevo lead recibido desde la landing de SegurosPro</h2>
        <p><strong>Nombre:</strong> ${parsed.data.nombre}</p>
        <p><strong>Email:</strong> ${parsed.data.email}</p>
        <p><strong>Telefono:</strong> ${telefono}</p>
        <p><strong>Fecha:</strong> ${submittedAt}</p>
      `,
    });

    if (error) {
      return {
        success: false,
        message: "No pudimos enviar tu solicitud. Intenta nuevamente.",
      };
    }

    return {
      success: true,
      message: "Gracias. Recibimos tus datos y te contactaremos pronto.",
    };
  } catch {
    return {
      success: false,
      message: "No pudimos enviar tu solicitud. Intenta nuevamente.",
    };
  }
}
