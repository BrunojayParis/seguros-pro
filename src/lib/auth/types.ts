import type { User } from "@supabase/supabase-js";
import type { Enums, Tables } from "@/types/database.types";

export type Perfil = Tables<"perfiles">;
export type Organizacion = Tables<"organizaciones">;
export type RolUsuario = Enums<"rol_usuario">;

export type SessionData = {
  user: User;
  perfil: Perfil | null;
  orgs: Organizacion[];
  currentOrg: Organizacion | null;
  rol: RolUsuario | null;
};

export type AuthActionResult = {
  error: string | null;
  message?: string;
};
