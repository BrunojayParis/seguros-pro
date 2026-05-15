import { z } from "zod";
import { Constants } from "@/types/database.types";

const ramoValues = Constants.public.Enums.ramo_seguro;
const rolValues = Constants.public.Enums.rol_usuario;

export const onboardingRamoSchema = z.enum(ramoValues);
export const onboardingRolSchema = z.enum(rolValues);

export const onboardingAccountSchema = z
  .object({
    useExistingSession: z.boolean(),
    nombre: z.string().trim().min(2, "Ingresa tu nombre"),
    apellido: z.string().trim().min(2, "Ingresa tu apellido"),
    email: z.string().trim().email("Ingresa un email valido"),
    password: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.useExistingSession) {
      if (!value.password || value.password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "La contrasena debe tener al menos 8 caracteres",
        });
      }
    }
  });

export const onboardingTeamMemberSchema = z.object({
  email: z.string().trim().email("Email de colaborador invalido"),
  rol: onboardingRolSchema,
});

export const onboardingOrganizationSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresa el nombre de la organizacion"),
  cuit: z.string().trim().max(64).optional().or(z.literal("")),
  matricula_ssn: z.string().trim().max(64).optional().or(z.literal("")),
  telefono: z.string().trim().max(64).optional().or(z.literal("")),
});

export const onboardingImportSchema = z.object({
  method: z.enum(["excel", "manual"]).nullable(),
  fileName: z.string().nullable(),
  skipped: z.boolean(),
});

export const completeOnboardingSchema = z.object({
  account: onboardingAccountSchema,
  organization: onboardingOrganizationSchema,
  team: z.array(onboardingTeamMemberSchema),
  ramos: z.array(onboardingRamoSchema).min(1, "Selecciona al menos un ramo"),
  importConfig: onboardingImportSchema,
});

export type OnboardingRamo = z.infer<typeof onboardingRamoSchema>;
export type OnboardingRol = z.infer<typeof onboardingRolSchema>;
export type OnboardingAccountPayload = z.infer<typeof onboardingAccountSchema>;
export type OnboardingTeamMemberPayload = z.infer<typeof onboardingTeamMemberSchema>;
export type OnboardingOrganizationPayload = z.infer<typeof onboardingOrganizationSchema>;
export type OnboardingImportPayload = z.infer<typeof onboardingImportSchema>;
export type CompleteOnboardingPayload = z.infer<typeof completeOnboardingSchema>;

export type CompleteOnboardingResult = {
  error: string | null;
  status?: "done" | "pending_email_confirmation";
  redirectTo?: string;
  message?: string;
};
