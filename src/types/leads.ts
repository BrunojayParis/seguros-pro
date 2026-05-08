import { z } from "zod";
import type { Enums } from "@/types/database.types";

export type EtapaLead = Enums<"etapa_lead">;

const optionalText = z.string().trim().max(255).optional().or(z.literal(""));
const optionalLongText = z.string().trim().max(2000).optional().or(z.literal(""));

export const leadFormBaseSchema = z.object({
  nombre: z.string().trim().min(1, "Ingresa el nombre del lead"),
  telefono: optionalText,
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || z.string().email().safeParse(value).success, "Email invalido"),
  ramo_interes: z
    .enum([
      "automotor",
      "vida",
      "accidentes_personales",
      "hogar",
      "combinado_familiar",
      "art",
      "otros",
    ] satisfies Enums<"ramo_seguro">[])
    .optional(),
  etapa: z.enum([
    "contactado",
    "cotizado",
    "negociacion",
    "ganado",
    "perdido",
    "descartado",
  ] satisfies EtapaLead[]),
  valor_estimado: z.number().finite().nonnegative().optional(),
  origen: z.enum(["referido", "web", "red social", "propio", "otro"]).optional(),
  proxima_accion: optionalText,
  fecha_proxima: z.string().optional().or(z.literal("")),
  notas: optionalLongText,
  perdido_motivo: optionalText,
});

export const leadFormSchema = leadFormBaseSchema
  .superRefine((values, ctx) => {
    const etapaEsPerdida = values.etapa === "perdido" || values.etapa === "descartado";
    if (etapaEsPerdida && !values.perdido_motivo?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["perdido_motivo"],
        message: "Ingresa el motivo de perdida/archivo",
      });
    }
  });

export type LeadFormData = z.infer<typeof leadFormSchema>;
export const leadUpdateSchema = leadFormBaseSchema.partial();

export function normalizeLeadFormData(data: LeadFormData): LeadFormData {
  const toOptional = (value?: string) => (value?.trim() ?? "");

  return {
    ...data,
    nombre: data.nombre.trim(),
    telefono: toOptional(data.telefono),
    email: toOptional(data.email),
    proxima_accion: toOptional(data.proxima_accion),
    fecha_proxima: toOptional(data.fecha_proxima),
    notas: toOptional(data.notas),
    perdido_motivo: toOptional(data.perdido_motivo),
  };
}
