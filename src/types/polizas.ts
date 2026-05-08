import { z } from "zod";
import type { Enums } from "@/types/database.types";

export type EstadoPoliza = Enums<"estado_poliza">;
export type RamoSeguro = Enums<"ramo_seguro">;

const optionalText = z.string().trim().max(255).optional().or(z.literal(""));
const optionalDate = z.string().optional().or(z.literal(""));
const optionalNumber = z.number().finite().nonnegative().optional();

const baseSchema = z.object({
  cliente_id: z.string().uuid("Selecciona un cliente"),
  aseguradora_id: z.string().uuid("Selecciona una aseguradora"),
  numero_poliza: z.string().trim().min(1, "Ingresa el numero de poliza"),
  fecha_emision: z.string().min(1, "Ingresa la fecha de emision"),
  vigencia_desde: z.string().min(1, "Ingresa vigencia desde"),
  vigencia_hasta: z.string().min(1, "Ingresa vigencia hasta"),
  prima_neta: z.number().finite().nonnegative("La prima neta no puede ser negativa"),
  impuestos: z.number().finite().nonnegative("Los impuestos no pueden ser negativos"),
  periodicidad: z.enum(["mensual", "trimestral", "semestral", "anual"]),
  suma_asegurada: optionalNumber,
  notas: z.string().trim().max(2000).optional().or(z.literal("")),
});

const beneficiarioSchema = z.object({
  nombre: z.string().trim().min(1, "Ingresa nombre del beneficiario"),
  dni: z.string().trim().min(1, "Ingresa DNI del beneficiario"),
  porcentaje: z.number().finite().min(0).max(100),
});

const automotorSchema = baseSchema.extend({
  ramo: z.literal("automotor"),
  marca: optionalText,
  modelo: optionalText,
  anio: z.number().int().min(1900).max(2100).optional(),
  version: optionalText,
  patente: optionalText,
  chasis: optionalText,
  motor: optionalText,
  color: optionalText,
  uso: optionalText,
  tipo_cobertura: optionalText,
  cero_km: z.boolean().optional(),
  gnc: z.boolean().optional(),
  valor_venal: optionalNumber,
});

const vidaSchema = baseSchema.extend({
  ramo: z.literal("vida"),
  tipo_vida: optionalText,
  capital_asegurado: optionalNumber,
  plan: optionalText,
  fumador: z.boolean().optional(),
  fecha_nacimiento: optionalDate,
  profesion: optionalText,
  beneficiarios: z.array(beneficiarioSchema).optional(),
});

const accidentesSchema = baseSchema.extend({
  ramo: z.literal("accidentes_personales"),
  capital_muerte: optionalNumber,
  capital_invalidez: optionalNumber,
  asistencia_medica: optionalNumber,
  actividad_cubierta: optionalText,
  horario_cobertura: optionalText,
});

const hogarSchema = baseSchema.extend({
  ramo: z.literal("hogar"),
  tipo_bien: optionalText,
  domicilio_riesgo: optionalText,
  superficie_m2: z.number().int().nonnegative().optional(),
  tipo_construccion: optionalText,
  capital_edificio: optionalNumber,
  capital_contenido: optionalNumber,
  coberturas: z.array(z.string()).optional(),
});

const artSchema = baseSchema.extend({
  ramo: z.literal("art"),
  razon_social: optionalText,
  cuit_empleador: optionalText,
  actividad_ciiu: optionalText,
  cantidad_empleados: z.number().int().nonnegative().optional(),
  masa_salarial: optionalNumber,
  alicuota: optionalNumber,
});

export const polizaFormSchema = z
  .discriminatedUnion("ramo", [
    automotorSchema,
    vidaSchema,
    accidentesSchema,
    hogarSchema,
    artSchema,
  ])
  .refine((values) => new Date(values.vigencia_hasta) > new Date(values.vigencia_desde), {
    message: "Vigencia hasta debe ser posterior a vigencia desde",
    path: ["vigencia_hasta"],
  });

export type PolizaFormData = z.infer<typeof polizaFormSchema>;

export const siniestroFormSchema = z.object({
  poliza_id: z.string().uuid(),
  cliente_id: z.string().uuid(),
  numero_siniestro: z.string().trim().optional().or(z.literal("")),
  fecha_ocurrencia: z.string().min(1, "Ingresa fecha de ocurrencia"),
  descripcion: z.string().trim().min(1, "Ingresa descripcion"),
  lugar_ocurrencia: z.string().trim().optional().or(z.literal("")),
  monto_reclamado: optionalNumber,
});

export type SiniestroFormData = z.infer<typeof siniestroFormSchema>;
