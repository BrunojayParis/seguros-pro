"use client";

import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "danger" | "default";
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  variant = "default",
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-[#2e2e2b] px-3 text-sm text-[#f0efe9] transition hover:bg-[#1e1e1c]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-9 rounded-lg border px-3 text-sm transition ${
              variant === "danger"
                ? "border-[#7a3535] bg-[#552525] text-[#f8b1b1] hover:bg-[#6a2e2e]"
                : "border-[#2f5696] bg-[#1a5fcc] text-[#e8f1ff] hover:bg-[#2f72d7]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      }
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-[#272724] p-2 text-[#d4a017]">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <p className="text-sm text-[#9e9d94]">{description || "Esta accion no se puede deshacer."}</p>
      </div>
    </Modal>
  );
}
