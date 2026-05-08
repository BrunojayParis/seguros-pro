"use server";

import { revalidatePath } from "next/cache";
import { createActividad } from "@/lib/supabase/actividades";
import { getSession } from "@/lib/auth/getSession";
import { createServerClient } from "@/lib/supabase/client";
import {
  createDocumento,
  deleteDocumento,
  getDocumentosByCliente,
  getDocumentosByPoliza,
  getSignedUrl,
} from "@/lib/supabase/documentos";
import type { CategoriaDoc, DocumentoConUrl } from "@/types/documentos";

type ActionResult<T> = {
  data: T | null;
  error: string | null;
};

const BUCKET = "documentos";
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);
const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
]);

function sanitizeFilename(fileName: string) {
  return fileName
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getFileExtension(fileName: string) {
  const index = fileName.lastIndexOf(".");
  if (index < 0) return "";
  return fileName.slice(index).toLowerCase();
}

function isAllowedFile(file: File) {
  const extension = getFileExtension(file.name);
  if (extension && ALLOWED_EXTENSIONS.has(extension)) return true;
  if (file.type?.startsWith("image/")) return true;
  return ALLOWED_MIME_TYPES.has(file.type);
}

function withoutStoragePath<T extends { storage_path: string }>(
  documento: T,
  signedUrl: string,
): Omit<T, "storage_path"> & { signedUrl: string } {
  const { storage_path: _storagePath, ...rest } = documento;
  return { ...rest, signedUrl };
}

async function getDocumentoById(documentoId: string, orgId: string) {
  const supabase = await createServerClient();
  return supabase
    .from("documentos")
    .select("*")
    .eq("id", documentoId)
    .eq("org_id", orgId)
    .maybeSingle();
}

export async function getDocumentosAction(
  clienteId: string,
  polizaId?: string,
  categoria?: CategoriaDoc,
): Promise<ActionResult<DocumentoConUrl[]>> {
  const session = await getSession();
  if (!session || !session.currentOrg) {
    throw new Error("No autenticado");
  }

  const orgId = session.currentOrg.id;
  const result = polizaId
    ? await getDocumentosByPoliza(orgId, polizaId)
    : await getDocumentosByCliente(orgId, clienteId, categoria);

  if (result.error || !result.data) {
    return { data: null, error: result.error?.message ?? "No pudimos obtener documentos" };
  }

  const filtered = categoria
    ? result.data.filter((item) => item.categoria === categoria)
    : result.data;

  const signedResults = await Promise.all(
    filtered.map(async (item) => {
      const signed = await getSignedUrl(item.storage_path, 3600);
      if (signed.error || !signed.data?.signedUrl) return null;
      return withoutStoragePath(item, signed.data.signedUrl);
    }),
  );

  return { data: signedResults.filter((item): item is DocumentoConUrl => item !== null), error: null };
}

export async function uploadDocumentosAction(
  formData: FormData,
): Promise<ActionResult<{ uploaded: number }>> {
  const session = await getSession();
  if (!session || !session.currentOrg) {
    throw new Error("No autenticado");
  }

  const clienteId = String(formData.get("clienteId") ?? "").trim();
  const polizaIdRaw = String(formData.get("polizaId") ?? "").trim();
  const polizaId = polizaIdRaw || null;
  const categoria = String(formData.get("categoria") ?? "otro") as CategoriaDoc;
  const notaRaw = String(formData.get("nota") ?? "").trim();
  const nota = notaRaw || null;
  const orgId = String(formData.get("orgId") ?? "").trim();
  const files = formData.getAll("files").filter((item): item is File => item instanceof File);

  if (!clienteId || !orgId || files.length === 0) {
    return { data: null, error: "Faltan datos obligatorios para subir documentos" };
  }

  if (orgId !== session.currentOrg.id) {
    return { data: null, error: "Organizacion invalida" };
  }

  const supabase = await createServerClient();
  let uploaded = 0;

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      return { data: null, error: `El archivo ${file.name} supera el limite de 20MB` };
    }

    if (!isAllowedFile(file)) {
      return { data: null, error: `Tipo de archivo no permitido: ${file.name}` };
    }

    const cleanedName = sanitizeFilename(file.name) || "archivo";
    const uniqueName = `${crypto.randomUUID()}_${cleanedName}`;
    const storagePath = polizaId
      ? `${orgId}/${clienteId}/${polizaId}/${uniqueName}`
      : `${orgId}/${clienteId}/${uniqueName}`;

    const uploadResult = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, { upsert: false, contentType: file.type || undefined });

    if (uploadResult.error) {
      return {
        data: null,
        error: `No pudimos subir ${file.name}: ${uploadResult.error.message}`,
      };
    }

    const insertResult = await createDocumento(orgId, {
      cliente_id: clienteId,
      poliza_id: polizaId,
      categoria,
      nombre_archivo: file.name,
      storage_bucket: BUCKET,
      storage_path: storagePath,
      mime_type: file.type || null,
      size_bytes: file.size,
      nota,
      subido_por: session.user.id,
    });

    if (insertResult.error || !insertResult.data) {
      await supabase.storage.from(BUCKET).remove([storagePath]);
      return {
        data: null,
        error: `No pudimos registrar ${file.name} en la base de datos`,
      };
    }

    await createActividad(orgId, {
      tipo: "documento_subido",
      titulo: `Documento subido: ${file.name}`,
      descripcion: nota,
      cliente_id: clienteId,
      poliza_id: polizaId,
      usuario_id: session.user.id,
      metadata: {
        documento_id: insertResult.data.id,
        categoria,
      },
    });

    uploaded += 1;
  }

  revalidatePath(`/dashboard/clientes/${clienteId}`);
  revalidatePath("/dashboard/clientes/[id]");
  if (polizaId) {
    revalidatePath(`/dashboard/polizas/${polizaId}`);
    revalidatePath("/dashboard/polizas/[id]");
  }

  return { data: { uploaded }, error: null };
}

export async function deleteDocumentoAction(documentoId: string): Promise<ActionResult<null>> {
  const session = await getSession();
  if (!session || !session.currentOrg) {
    throw new Error("No autenticado");
  }

  if (session.rol !== "admin" && session.rol !== "productor") {
    return { data: null, error: "No autorizado" };
  }

  const orgId = session.currentOrg.id;
  const { data: documento, error: documentoError } = await getDocumentoById(documentoId, orgId);

  if (documentoError || !documento) {
    return { data: null, error: "Documento no encontrado" };
  }

  const supabase = await createServerClient();
  const storageResult = await supabase.storage.from(BUCKET).remove([documento.storage_path]);
  if (storageResult.error) {
    return {
      data: null,
      error: `No pudimos eliminar el archivo en Storage: ${storageResult.error.message}`,
    };
  }

  const deleteResult = await deleteDocumento(orgId, documentoId);
  if (deleteResult.error) {
    return { data: null, error: deleteResult.error.message ?? "No pudimos eliminar el documento" };
  }

  revalidatePath(`/dashboard/clientes/${documento.cliente_id}`);
  revalidatePath("/dashboard/clientes/[id]");
  if (documento.poliza_id) {
    revalidatePath(`/dashboard/polizas/${documento.poliza_id}`);
    revalidatePath("/dashboard/polizas/[id]");
  }

  return { data: null, error: null };
}

export async function getSignedUrlAction(
  documentoId: string,
): Promise<ActionResult<{ url: string }>> {
  const session = await getSession();
  if (!session || !session.currentOrg) {
    throw new Error("No autenticado");
  }

  const { data: documento, error: documentoError } = await getDocumentoById(
    documentoId,
    session.currentOrg.id,
  );

  if (documentoError || !documento) {
    return { data: null, error: "Documento no encontrado" };
  }

  const signedResult = await getSignedUrl(documento.storage_path, 3600);
  if (signedResult.error || !signedResult.data?.signedUrl) {
    return { data: null, error: "No pudimos generar URL firmada" };
  }

  return { data: { url: signedResult.data.signedUrl }, error: null };
}
