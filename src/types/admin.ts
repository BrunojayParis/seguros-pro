import { z } from "zod";
import type { Enums, Tables } from "@/types/database.types";

export type RolUsuario = Enums<"rol_usuario">;

type PerfilLite = Pick<Tables<"perfiles">, "id" | "nombre" | "apellido" | "email" | "avatar_url">;

export type UsuarioConRol = Pick<Tables<"org_usuarios">, "usuario_id" | "rol" | "activo" | "created_at"> & {
  perfil: PerfilLite | null;
};

const optionalText = z.string().trim().max(255).optional().or(z.literal(""));

export const inviteUsuarioSchema = z.object({
  email: z.string().trim().email("Ingresa un email valido"),
  nombre: z.string().trim().min(1, "Ingresa el nombre").max(255),
  apellido: z.string().trim().min(1, "Ingresa el apellido").max(255),
  rol: z.enum(["admin", "productor", "asistente"] satisfies RolUsuario[]),
});

export type InviteUsuarioData = z.infer<typeof inviteUsuarioSchema>;

export const aseguradoraFormSchema = z.object({
  nombre: z.string().trim().min(1, "Ingresa el nombre").max(255),
  cuit: optionalText,
  codigo: optionalText,
  contacto: optionalText,
  telefono: optionalText,
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || z.string().email().safeParse(value).success, "Email invalido"),
});

export type AseguradoraFormData = z.infer<typeof aseguradoraFormSchema>;
