"use client";

import { useMemo, useState } from "react";
import { Loader2, RotateCcw, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui";
import { uploadDocumentosAction } from "@/actions/documentos";
import type { CategoriaDoc } from "@/types/documentos";

type UploadStatus = "pending" | "uploading" | "success" | "error";

type FileItem = {
  id: string;
  file: File;
  status: UploadStatus;
  error: string | null;
  progress: number;
};

type UploadModalProps = {
  open: boolean;
  onClose: () => void;
  files: File[];
  clienteId: string;
  orgId: string;
  polizaId?: string;
  onUploaded: () => Promise<void> | void;
};

const CATEGORIAS: Array<{ value: CategoriaDoc; label: string }> = [
  { value: "poliza", label: "Póliza" },
  { value: "foto_vehiculo", label: "Foto vehículo" },
  { value: "denuncia_siniestro", label: "Denuncia" },
  { value: "dni", label: "DNI" },
  { value: "cuit", label: "CUIT" },
  { value: "factura", label: "Factura" },
  { value: "otro", label: "Otro" },
];

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  const kb = value / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function UploadModal({
  open,
  onClose,
  files,
  clienteId,
  orgId,
  polizaId,
  onUploaded,
}: UploadModalProps) {
  const [categoria, setCategoria] = useState<CategoriaDoc>("otro");
  const [nota, setNota] = useState("");
  const [running, setRunning] = useState(false);
  const [items, setItems] = useState<FileItem[]>([]);

  const pendingItems = useMemo(
    () =>
      files.map((file, index) => ({
        id: `${file.name}-${file.size}-${index}`,
        file,
        status: "pending" as const,
        error: null,
        progress: 0,
      })),
    [files],
  );

  const currentItems = items.length ? items : pendingItems;

  const runUpload = async (retryOnlyFailed = false) => {
    if (!currentItems.length || running) return;

    setRunning(true);
    const snapshot = currentItems.map((item) => ({ ...item }));
    let uploadedCount = 0;
    let hadErrors = false;

    for (const item of snapshot) {
      const shouldSkip = retryOnlyFailed
        ? item.status !== "error"
        : item.status === "success";
      if (shouldSkip) continue;

      setItems((prev) =>
        (prev.length ? prev : pendingItems).map((entry) =>
          entry.id === item.id
            ? { ...entry, status: "uploading", error: null, progress: 20 }
            : entry,
        ),
      );

      const payload = new FormData();
      payload.set("clienteId", clienteId);
      payload.set("orgId", orgId);
      payload.set("categoria", categoria);
      if (polizaId) payload.set("polizaId", polizaId);
      if (nota.trim()) payload.set("nota", nota.trim());
      payload.append("files", item.file);

      const result = await uploadDocumentosAction(payload);
      if (result.error) {
        hadErrors = true;
        setItems((prev) =>
          prev.map((entry) =>
            entry.id === item.id
              ? { ...entry, status: "error", error: result.error, progress: 0 }
              : entry,
          ),
        );
        continue;
      }

      uploadedCount += 1;
      setItems((prev) =>
        prev.map((entry) =>
          entry.id === item.id
            ? { ...entry, status: "success", error: null, progress: 100 }
            : entry,
        ),
      );
    }

    setRunning(false);

    if (uploadedCount > 0) {
      await onUploaded();
      toast.success(
        uploadedCount === 1
          ? "Documento subido correctamente"
          : `${uploadedCount} documentos subidos`,
      );
    }

    if (!hadErrors) {
      setItems([]);
      setNota("");
      onClose();
      return;
    }

    toast.error("Algunos archivos no se pudieron subir. Reintentá los fallidos.");
  };

  const failedCount = currentItems.filter((item) => item.status === "error").length;

  return (
    <Modal
      open={open}
      onClose={() => {
        if (running) return;
        setItems([]);
        setNota("");
        onClose();
      }}
      title="Subir documentos"
      size="lg"
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
          {failedCount > 0 ? (
            <button
              type="button"
              onClick={() => runUpload(true)}
              disabled={running}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#2e2e2b] px-3 text-sm text-[#f0efe9] transition hover:bg-[#1e1e1c] disabled:opacity-60"
            >
              <RotateCcw className="h-4 w-4" />
              Reintentar fallidos
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => runUpload(false)}
            disabled={running || currentItems.length === 0}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#2f5696] bg-[#1a5fcc] px-3 text-sm text-[#e8f1ff] transition hover:bg-[#2f72d7] disabled:opacity-60"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            Confirmar subida
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-[#c3c2b8]">Categoría</span>
            <select
              value={categoria}
              onChange={(event) => setCategoria(event.target.value as CategoriaDoc)}
              className="h-10 w-full rounded-lg border border-[#2e2e2b] bg-[#151513] px-3 text-sm text-[#f0efe9]"
            >
              {CATEGORIAS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-[#c3c2b8]">Nota (opcional)</span>
            <input
              value={nota}
              onChange={(event) => setNota(event.target.value)}
              className="h-10 w-full rounded-lg border border-[#2e2e2b] bg-[#151513] px-3 text-sm text-[#f0efe9]"
              placeholder="Detalle interno"
            />
          </label>
        </div>

        <div className="space-y-2 rounded-xl border border-[#272724] bg-[#151513] p-3">
          {currentItems.map((item) => (
            <div key={item.id} className="rounded-lg border border-[#2b2b28] bg-[#1b1b19] p-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <p className="truncate text-[#f0efe9]">{item.file.name}</p>
                <p className="text-[#9e9d94]">{formatBytes(item.file.size)}</p>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#2b2b28]">
                <div
                  className={`h-full rounded-full transition-all ${
                    item.status === "error"
                      ? "bg-[#a94848]"
                      : item.status === "success"
                        ? "bg-[#2f8f57]"
                        : "bg-[#2f72d7]"
                  }`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-[#9e9d94]">
                {item.status === "pending" ? "Pendiente" : null}
                {item.status === "uploading" ? "Subiendo..." : null}
                {item.status === "success" ? "Completado" : null}
                {item.status === "error" ? item.error ?? "Error al subir" : null}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
