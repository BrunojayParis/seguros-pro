import { z } from "zod";
import type { Enums } from "@/types/database.types";

const optionalText = z.string().trim().max(255).optional().or(z.literal(""));

export const clienteFormSchema = z
  .object({
    tipo_persona: z.enum(["fisica", "juridica"] satisfies Enums<"tipo_persona">[]),
    estado: z.enum(["activo", "inactivo", "prospecto", "baja"] satisfies Enums<"estado_cliente">[]),
    nombre: optionalText,
    apellido: optionalText,
    dni: optionalText,
    fecha_nacimiento: z.string().optional().or(z.literal("")),
    cuit_cuil: optionalText,
    estado_civil: optionalText,
    razon_social: optionalText,
    cuit_empresa: optionalText,
    email: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((value) => !value || z.string().email().safeParse(value).success, "Email invalido"),
    telefono: optionalText,
    domicilio: optionalText,
    localidad: optionalText,
    provincia: optionalText,
    codigo_postal: optionalText,
    notas: z.string().trim().max(2000).optional().or(z.literal("")),
  })
  .superRefine((values, ctx) => {
    if (values.tipo_persona === "fisica") {
      if (!values.nombre?.trim()) {
        ctx.addIssue({ code: "custom", path: ["nombre"], message: "Ingresa el nombre" });
      }
      if (!values.apellido?.trim()) {
        ctx.addIssue({ code: "custom", path: ["apellido"], message: "Ingresa el apellido" });
      }
    }

    if (values.tipo_persona === "juridica" && !values.razon_social?.trim()) {
      ctx.addIssue({ code: "custom", path: ["razon_social"], message: "Ingresa la razon social" });
    }
  });

export type ClienteFormData = z.infer<typeof clienteFormSchema>;

export function normalizeClienteFormData(data: ClienteFormData): ClienteFormData {
  const toOptional = (value?: string) => {
    const trimmed = value?.trim() ?? "";
    return trimmed;
  };

  return {
    ...data,
    nombre: toOptional(data.nombre),
    apellido: toOptional(data.apellido),
    dni: toOptional(data.dni),
    fecha_nacimiento: toOptional(data.fecha_nacimiento),
    cuit_cuil: toOptional(data.cuit_cuil),
    estado_civil: toOptional(data.estado_civil),
    razon_social: toOptional(data.razon_social),
    cuit_empresa: toOptional(data.cuit_empresa),
    email: toOptional(data.email),
    telefono: toOptional(data.telefono),
    domicilio: toOptional(data.domicilio),
    localidad: toOptional(data.localidad),
    provincia: toOptional(data.provincia),
    codigo_postal: toOptional(data.codigo_postal),
    notas: toOptional(data.notas),
  };
}
