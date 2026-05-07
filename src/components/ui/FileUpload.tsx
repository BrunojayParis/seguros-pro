"use client";

import { useMemo, useRef, useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";

export interface FileUploadProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  loading?: boolean;
  progress?: number;
}

export function FileUpload({
  onFiles,
  accept = "image/*,.pdf,.doc,.docx,.xls,.xlsx",
  multiple = true,
  loading = false,
  progress,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);

  const safeProgress = useMemo(() => {
    if (typeof progress !== "number" || Number.isNaN(progress)) return 0;
    return Math.max(0, Math.min(100, progress));
  }, [progress]);

  const handleFiles = (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []);
    setSelectedCount(files.length);
    if (!files.length) return;
    onFiles(files);
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={`w-full rounded-2xl border-2 border-dashed p-6 text-left transition ${
          isDragging
            ? "border-[#5b9cf6] bg-[#1e1e1c]"
            : "border-[#2e2e2b] bg-[#161614] hover:border-[#3a3a36] hover:bg-[#1a1a18]"
        }`}
        disabled={loading}
      >
        <div className="flex items-center gap-3 text-[#f0efe9]">
          {loading ? <Loader2 className="h-5 w-5 animate-spin text-[#5b9cf6]" /> : <UploadCloud className="h-5 w-5 text-[#5b9cf6]" />}
          <span className="text-sm font-medium">Arrastra archivos aqui o haz click para seleccionar</span>
        </div>
        <p className="mt-2 text-xs text-[#6b6a62]">Formatos permitidos: {accept}</p>
      </button>

      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(event) => handleFiles(event.target.files)}
      />

      {selectedCount > 0 ? <p className="text-sm text-[#9e9d94]">{selectedCount} archivo(s) seleccionado(s)</p> : null}

      {loading ? (
        <div className="space-y-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#272724]">
            <div className="h-full rounded-full bg-[#1a5fcc] transition-all" style={{ width: `${safeProgress}%` }} />
          </div>
          <p className="text-xs text-[#6b6a62]">Subiendo... {safeProgress}%</p>
        </div>
      ) : null}
    </div>
  );
}
