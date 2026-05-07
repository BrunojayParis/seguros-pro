"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, children, size = "md", footer }: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previousActiveRef.current = document.activeElement as HTMLElement | null;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable?.[0];
    first?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (!dialogRef.current) return;

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }

      if (event.key === "Tab") {
        const elements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );

        if (!elements.length) {
          event.preventDefault();
          return;
        }

        const firstElement = elements[0];
        const lastElement = elements[elements.length - 1];
        const activeElement = document.activeElement as HTMLElement | null;

        if (event.shiftKey && activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previousActiveRef.current?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  const widthClass = size === "sm" ? "max-w-md" : size === "lg" ? "max-w-3xl" : "max-w-xl";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`w-full ${widthClass} rounded-2xl border border-[#272724] bg-[#1a1a18] shadow-2xl`}
      >
        <div className="flex items-center justify-between border-b border-[#272724] px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-[#f0efe9]">
            {title?.trim() || "-"}
          </h2>
          <button
            type="button"
            className="rounded-lg p-1 text-[#9e9d94] transition hover:bg-[#1e1e1c] hover:text-[#f0efe9]"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4 text-sm text-[#f0efe9]">{children}</div>

        {footer ? <div className="border-t border-[#272724] px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}
