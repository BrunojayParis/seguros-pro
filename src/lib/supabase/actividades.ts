import type { PostgrestError } from "@supabase/supabase-js";
import { createServerClient } from "./client";
import type { Tables, TablesInsert } from "@/types/database.types";

type HelperError = PostgrestError | Error;
type HelperResult<T> = Promise<{ data: T | null; error: HelperError | null }>;
type Actividad = Tables<"actividades">;
type ActividadInsert = Omit<TablesInsert<"actividades">, "org_id">;
type ClienteNombreLite = {
  nombre: string | null;
  apellido: string | null;
  razon_social: string | null;
  tipo_persona: "fisica" | "juridica";
};

export type ActividadReciente = Pick<Actividad, "id" | "titulo" | "tipo" | "created_at" | "cliente_id"> & {
  cliente_nombre: string | null;
};

const toError = (error: unknown) =>
  error instanceof Error ? error : new Error("Unexpected Supabase helper error");

export async function getActividadesByCliente(
  orgId: string,
  clienteId: string,
  limit = 20,
): HelperResult<Actividad[]> {
  try {
    const supabase = await createServerClient();

    return await supabase
      .from("actividades")
      .select("*")
      .eq("org_id", orgId)
      .eq("cliente_id", clienteId)
      .order("created_at", { ascending: false })
      .limit(limit);
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}

export async function createActividad(
  orgId: string,
  data: ActividadInsert,
): HelperResult<Actividad> {
  try {
    const supabase = await createServerClient();

    return await supabase
      .from("actividades")
      .insert({ ...data, org_id: orgId })
      .select()
      .single();
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}

function formatClienteNombre(cliente: ClienteNombreLite | null) {
  if (!cliente) return null;
  if (cliente.tipo_persona === "juridica") {
    return cliente.razon_social?.trim() || null;
  }

  const nombreCompleto = [cliente.nombre, cliente.apellido].filter(Boolean).join(" ").trim();
  return nombreCompleto || null;
}

export async function getActividadesRecientes(
  orgId: string,
  limit = 8,
): HelperResult<ActividadReciente[]> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("actividades")
      .select("id, titulo, tipo, created_at, cliente_id, clientes(nombre, apellido, razon_social, tipo_persona)")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return { data: null, error };
    }

    const rows = (data ?? []) as Array<{
      id: string;
      titulo: string;
      tipo: Actividad["tipo"];
      created_at: string;
      cliente_id: string | null;
      clientes: ClienteNombreLite | ClienteNombreLite[] | null;
    }>;

    const normalized = rows.map((item) => {
      const cliente = Array.isArray(item.clientes) ? (item.clientes[0] ?? null) : item.clientes;

      return {
        id: item.id,
        titulo: item.titulo,
        tipo: item.tipo,
        created_at: item.created_at,
        cliente_id: item.cliente_id,
        cliente_nombre: formatClienteNombre(cliente),
      };
    });

    return { data: normalized, error: null };
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}
