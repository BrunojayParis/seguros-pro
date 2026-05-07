"use client";

import { Download, FileText, ImageIcon, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface FileGridItem {
  id: string;
  nombre_archivo: string;
  categoria: string;
  size_bytes: number;
  created_at: string;
  url?: string;
  nota?: string;
}

export interface FileGridProps {
  files: FileGridItem[];
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
  filterCategoria?: string;
}

function isImageUrl(url?: string) {
  if (!url) return false;
  return /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(url);
}

function formatBytes(sizeBytes: number) {
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = sizeBytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(date);
}

export function FileGrid({ files, onDownload, onDelete, filterCategoria }: FileGridProps) {
  const safeFiles = files ?? [];
  const visibleFiles = filterCategoria
    ? safeFiles.filter((file) => file?.categoria?.toLowerCase() === filterCategoria.toLowerCase())
    : safeFiles;

  if (!visibleFiles.length) {
    return (
      <div className="rounded-2xl border border-[#272724] bg-[#1a1a18] p-6 text-sm text-[#9e9d94]">
        No hay archivos cargados.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {visibleFiles.map((file) => (
        <article key={file.id} className="rounded-2xl border border-[#272724] bg-[#1a1a18] p-4">
          <div className="mb-3 overflow-hidden rounded-xl border border-[#2e2e2b] bg-[#161614]">
            {isImageUrl(file.url) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={file.url} alt={file.nombre_archivo || "Archivo"} className="h-32 w-full object-cover" />
            ) : (
              <div className="flex h-32 items-center justify-center gap-2 text-[#9e9d94]">
                <ImageIcon className="h-5 w-5" />
                <FileText className="h-5 w-5" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium text-[#f0efe9]">{file.nombre_archivo || "Sin nombre"}</p>
              <Badge variant="otros" size="sm" label={file.categoria || "Sin categoria"} />
            </div>
            <p className="text-xs text-[#6b6a62]">
              {formatBytes(file.size_bytes)} - {formatDate(file.created_at)}
            </p>
            {file.nota ? <p className="line-clamp-2 text-xs text-[#9e9d94]">{file.nota}</p> : null}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#2e2e2b] px-3 text-xs text-[#f0efe9] transition hover:bg-[#1e1e1c]"
              onClick={() => onDownload(file.id)}
            >
              <Download className="h-3.5 w-3.5" />
              Descargar
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#7a3535] px-3 text-xs text-[#f49a9a] transition hover:bg-[#3b1f1f]"
              onClick={() => onDelete(file.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
