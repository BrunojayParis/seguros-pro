import type { PostgrestError } from "@supabase/supabase-js";
import { createServerClient } from "./client";
import type { Enums, Tables, TablesInsert, TablesUpdate } from "@/types/database.types";

type HelperError = PostgrestError | Error;
type HelperResult<T> = Promise<{ data: T | null; error: HelperError | null }>;
type Cliente = Tables<"clientes">;
type ClienteInsert = Omit<TablesInsert<"clientes">, "org_id">;
type ClienteUpdate = Omit<TablesUpdate<"clientes">, "org_id" | "id">;

export type ClienteFilters = {
  estado?: Enums<"estado_cliente">;
  search?: string;
  productorId?: string;
};

const toError = (error: unknown) =>
  error instanceof Error ? error : new Error("Unexpected Supabase helper error");

export async function getClientes(
  orgId: string,
  filters: ClienteFilters = {},
): HelperResult<Cliente[]> {
  try {
    const supabase = await createServerClient();
    let query = supabase
      .from("clientes")
      .select("*")
      .eq("org_id", orgId)
      .order("updated_at", { ascending: false });

    if (filters.estado) query = query.eq("estado", filters.estado);
    if (filters.productorId) query = query.eq("productor_id", filters.productorId);
    if (filters.search?.trim()) {
      query = query.ilike("nombre_busqueda", `%${filters.search.trim()}%`);
    }

    return await query;
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}

export async function getClienteById(
  orgId: string,
  clienteId: string,
): HelperResult<Cliente> {
  try {
    const supabase = await createServerClient();

    return await supabase
      .from("clientes")
      .select("*")
      .eq("org_id", orgId)
      .eq("id", clienteId)
      .single();
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}

export async function createCliente(
  orgId: string,
  data: ClienteInsert,
): HelperResult<Cliente> {
  try {
    const supabase = await createServerClient();

    return await supabase
      .from("clientes")
      .insert({ ...data, org_id: orgId })
      .select()
      .single();
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}

export async function updateCliente(
  orgId: string,
  clienteId: string,
  data: ClienteUpdate,
): HelperResult<Cliente> {
  try {
    const supabase = await createServerClient();

    return await supabase
      .from("clientes")
      .update(data)
      .eq("org_id", orgId)
      .eq("id", clienteId)
      .select()
      .single();
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}

export async function softDeleteCliente(
  orgId: string,
  clienteId: string,
): HelperResult<Cliente> {
  return updateCliente(orgId, clienteId, { estado: "baja" });
}
