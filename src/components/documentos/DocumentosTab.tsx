"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  File,
  FileSpreadsheet,
  FileText,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog, FileUpload } from "@/components/ui";
import {
  deleteDocumentoAction,
  getDocumentosAction,
  getSignedUrlAction,
} from "@/actions/documentos";
import type { CategoriaDoc, DocumentoConUrl } from "@/types/documentos";
import { UploadModal } from "./UploadModal";

type DocumentosTabProps = {
  clienteId: string;
  orgId: string;
  polizaId?: string;
  rol: string;
};

const FILTERS: Array<{ label: string; value: "all" | CategoriaDoc }> = [
  { label: "Todos", value: "all" },
  { label: "Póliza", value: "poliza" },
  { label: "Foto vehículo", value: "foto_vehiculo" },
  { label: "Denuncia", value: "denuncia_siniestro" },
  { label: "DNI", value: "dni" },
  { label: "Factura", value: "factura" },
  { label: "Otro", value: "otro" },
];

function formatBytes(value: number | null) {
  const size = Number(value ?? 0);
  if (!Number.isFinite(size) || size <= 0) return "0 B";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function isImage(mimeType: string | null, fileName: string) {
  if (mimeType?.startsWith("image/")) return true;
  return /\.(jpg|jpeg|png|webp)$/i.test(fileName);
}

function getFileIcon(fileName: string) {
  if (/\.pdf$/i.test(fileName)) {
    return <FileText className="h-8 w-8 text-[#f26c6c]" />;
  }
  if (/\.(doc|docx)$/i.test(fileName)) {
    return <FileText className="h-8 w-8 text-[#5b9cf6]" />;
  }
  if (/\.(xls|xlsx)$/i.test(fileName)) {
    return <FileSpreadsheet className="h-8 w-8 text-[#4fb077]" />;
  }
  return <File className="h-8 w-8 text-[#9e9d94]" />;
}

export function DocumentosTab({ clienteId, orgId, polizaId, rol }: DocumentosTabProps) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["value"]>("all");
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<DocumentoConUrl[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const canDelete = rol === "admin" || rol === "productor";

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    const result = await getDocumentosAction(
      clienteId,
      polizaId,
      filter === "all" ? undefined : filter,
    );
    setLoading(false);

    if (result.error || !result.data) {
      toast.error(result.error ?? "No pudimos cargar documentos");
      return;
    }

    setDocuments(result.data);
  }, [clienteId, filter, polizaId]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const totalSize = useMemo(
    () => documents.reduce((acc, item) => acc + Number(item.size_bytes ?? 0), 0),
    [documents],
  );

  const handleDownload = async (documento: DocumentoConUrl) => {
    const signedResult = await getSignedUrlAction(documento.id);
    if (signedResult.error || !signedResult.data?.url) {
      toast.error(signedResult.error ?? "No pudimos generar el enlace de descarga");
      return;
    }
    window.open(signedResult.data.url, "_blank", "noopener,noreferrer");
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;

    setDeletingId(confirmDeleteId);
    const result = await deleteDocumentoAction(confirmDeleteId);
    setDeletingId(null);
    setConfirmDeleteId(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Documento eliminado");
    await loadDocuments();
  };

  return (
    <div className="space-y-4">
      <FileUpload
        onFiles={(files) => {
          setPendingFiles(files);
          setUploadOpen(true);
        }}
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={`h-8 rounded-full border px-3 text-xs uppercase tracking-[0.08em] ${
              filter === item.value
                ? "border-[#2f5696] bg-[#1a5fcc] text-[#e8f1ff]"
                : "border-[#2e2e2b] bg-[#1a1a18] text-[#9e9d94]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-2xl border border-[#272724] bg-[#1a1a18] p-6 text-sm text-[#9e9d94]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando documentos...
        </div>
      ) : documents.length === 0 ? (
        <div className="rounded-2xl border border-[#272724] bg-[#1a1a18] p-6 text-sm text-[#9e9d94]">
          No hay documentos cargados para este filtro.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {documents.map((item) => {
            const image = isImage(item.mime_type, item.nombre_archivo);
            return (
              <article
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-[#272724] bg-[#1a1a18] p-4"
              >
                <div className="mb-3 overflow-hidden rounded-xl border border-[#2e2e2b] bg-[#161614]">
                  {image ? (
                    <Image
                      src={item.signedUrl}
                      alt={item.nombre_archivo}
                      width={480}
                      height={280}
                      unoptimized
                      className="h-32 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-32 items-center justify-center">
                      {getFileIcon(item.nombre_archivo)}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="truncate text-sm font-medium text-[#f0efe9]">{item.nombre_archivo}</p>
                  <p className="text-xs text-[#6b6a62]">
                    {formatBytes(item.size_bytes)} - {formatDate(item.created_at)}
                  </p>
                  {item.nota ? <p className="line-clamp-2 text-xs text-[#9e9d94]">{item.nota}</p> : null}
                </div>

                <div className="pointer-events-none absolute inset-0 flex items-end justify-end gap-2 bg-black/40 p-3 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => handleDownload(item)}
                    className="pointer-events-auto inline-flex h-9 items-center gap-1 rounded-lg border border-[#2e2e2b] bg-[#1e1e1c] px-3 text-xs text-[#f0efe9] transition hover:bg-[#282825]"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Descargar
                  </button>
                  {canDelete ? (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="pointer-events-auto inline-flex h-9 items-center gap-1 rounded-lg border border-[#7a3535] bg-[#3b1f1f] px-3 text-xs text-[#f49a9a] transition hover:bg-[#4f2828]"
                      disabled={deletingId === item.id}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </button>
                  ) : null}
                </div>

                <div className="absolute right-3 top-3 rounded-full border border-[#2e2e2b] bg-[#151513]/90 px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-[#c3c2b8]">
                  {item.categoria.replaceAll("_", " ")}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between rounded-2xl border border-[#272724] bg-[#1a1a18] px-4 py-3 text-sm">
        <p className="text-[#9e9d94]">{documents.length} documento(s)</p>
        <p className="text-[#f0efe9]">Total: {formatBytes(totalSize)}</p>
      </div>

      <UploadModal
        open={uploadOpen}
        onClose={() => {
          setUploadOpen(false);
          setPendingFiles([]);
        }}
        files={pendingFiles}
        clienteId={clienteId}
        orgId={orgId}
        polizaId={polizaId}
        onUploaded={loadDocuments}
      />

      <ConfirmDialog
        open={Boolean(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar documento"
        description="Esta acción no se puede deshacer. Se eliminará el archivo y su registro."
        confirmLabel={deletingId ? "Eliminando..." : "Eliminar"}
        variant="danger"
      />
    </div>
  );
}
