import type { PostgrestError } from "@supabase/supabase-js";
import { createServerClient } from "./client";
import type { Enums, Tables, TablesInsert } from "@/types/database.types";

type HelperError = PostgrestError | Error;
type HelperResult<T> = Promise<{ data: T | null; error: HelperError | null }>;
type Documento = Tables<"documentos">;
type DocumentoInsert = Omit<TablesInsert<"documentos">, "org_id">;
type SignedUrl = { signedUrl: string };

const toError = (error: unknown) =>
  error instanceof Error ? error : new Error("Unexpected Supabase helper error");

export async function getDocumentosByCliente(
  orgId: string,
  clienteId: string,
  categoria?: Enums<"categoria_doc">,
): HelperResult<Documento[]> {
  try {
    const supabase = await createServerClient();
    let query = supabase
      .from("documentos")
      .select("*")
      .eq("org_id", orgId)
      .eq("cliente_id", clienteId)
      .order("created_at", { ascending: false });

    if (categoria) query = query.eq("categoria", categoria);

    return await query;
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}

export async function getDocumentosByPoliza(
  orgId: string,
  polizaId: string,
): HelperResult<Documento[]> {
  try {
    const supabase = await createServerClient();

    return await supabase
      .from("documentos")
      .select("*")
      .eq("org_id", orgId)
      .eq("poliza_id", polizaId)
      .order("created_at", { ascending: false });
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}

export async function createDocumento(
  orgId: string,
  data: DocumentoInsert,
): HelperResult<Documento> {
  try {
    const supabase = await createServerClient();

    return await supabase
      .from("documentos")
      .insert({ ...data, org_id: orgId })
      .select()
      .single();
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}

export async function deleteDocumento(
  orgId: string,
  documentoId: string,
): HelperResult<Documento> {
  try {
    const supabase = await createServerClient();

    return await supabase
      .from("documentos")
      .delete()
      .eq("org_id", orgId)
      .eq("id", documentoId)
      .select()
      .single();
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}

export async function getSignedUrl(
  storagePath: string,
  expiresIn = 3600,
): HelperResult<SignedUrl> {
  try {
    const supabase = await createServerClient();

    return await supabase.storage
      .from("documentos")
      .createSignedUrl(storagePath, expiresIn);
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}
