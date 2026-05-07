import type { PostgrestError } from "@supabase/supabase-js";
import { createServerClient } from "./client";
import type { Enums, Tables, TablesInsert, TablesUpdate } from "@/types/database.types";

type HelperError = PostgrestError | Error;
type HelperResult<T> = Promise<{ data: T | null; error: HelperError | null }>;
type Lead = Tables<"leads">;
type Cliente = Tables<"clientes">;
type LeadInsert = Omit<TablesInsert<"leads">, "org_id">;
type LeadUpdate = Omit<TablesUpdate<"leads">, "org_id" | "id">;
type ClienteInsert = Omit<TablesInsert<"clientes">, "org_id">;

export type LeadFilters = {
  etapa?: Enums<"etapa_lead">;
  productorId?: string;
};

const toError = (error: unknown) =>
  error instanceof Error ? error : new Error("Unexpected Supabase helper error");

export async function getLeads(
  orgId: string,
  filters: LeadFilters = {},
): HelperResult<Lead[]> {
  try {
    const supabase = await createServerClient();
    let query = supabase
      .from("leads")
      .select("*")
      .eq("org_id", orgId)
      .order("updated_at", { ascending: false });

    if (filters.etapa) query = query.eq("etapa", filters.etapa);
    if (filters.productorId) query = query.eq("productor_id", filters.productorId);

    return await query;
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}

export async function getLeadById(
  orgId: string,
  leadId: string,
): HelperResult<Lead> {
  try {
    const supabase = await createServerClient();

    return await supabase
      .from("leads")
      .select("*")
      .eq("org_id", orgId)
      .eq("id", leadId)
      .single();
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}

export async function createLead(
  orgId: string,
  data: LeadInsert,
): HelperResult<Lead> {
  try {
    const supabase = await createServerClient();

    return await supabase
      .from("leads")
      .insert({ ...data, org_id: orgId })
      .select()
      .single();
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}

export async function updateLead(
  orgId: string,
  leadId: string,
  data: LeadUpdate,
): HelperResult<Lead> {
  try {
    const supabase = await createServerClient();

    return await supabase
      .from("leads")
      .update(data)
      .eq("org_id", orgId)
      .eq("id", leadId)
      .select()
      .single();
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}

export async function convertirLeadACliente(
  orgId: string,
  leadId: string,
  clienteData: ClienteInsert,
): HelperResult<Cliente> {
  try {
    const supabase = await createServerClient();

    const { data: cliente, error: clienteError } = await supabase
      .from("clientes")
      .insert({ ...clienteData, org_id: orgId })
      .select()
      .single();

    if (clienteError || !cliente) return { data: null, error: clienteError };

    const { error: leadError } = await supabase
      .from("leads")
      .update({ cliente_id: cliente.id, etapa: "ganado" })
      .eq("org_id", orgId)
      .eq("id", leadId);

    if (leadError) {
      await supabase
        .from("clientes")
        .delete()
        .eq("org_id", orgId)
        .eq("id", cliente.id);

      return { data: null, error: leadError };
    }

    return { data: cliente, error: null };
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}
