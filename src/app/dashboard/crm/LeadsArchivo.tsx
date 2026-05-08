"use client";

import { useState } from "react";
import { Badge } from "@/components/ui";
import type { BadgeVariant } from "@/components/ui";
import type { Tables } from "@/types/database.types";

type LeadRow = Tables<"leads">;

type LeadsArchivoProps = {
  leads: LeadRow[];
  onSelectLead: (lead: LeadRow) => void;
};

function getRamoBadgeVariant(ramo: LeadRow["ramo_interes"]): { variant: BadgeVariant; label?: string } | null {
  if (!ramo) return null;
  if (ramo === "combinado_familiar") {
    return { variant: "otros" as const, label: "Combinado familiar" };
  }
  return { variant: ramo as BadgeVariant, label: undefined };
}

function toArs(value: number | string | null) {
  return `$ ${Number(value ?? 0).toLocaleString("es-AR")}`;
}

function formatDate(dateValue: string | null) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function LeadsArchivo({ leads, onSelectLead }: LeadsArchivoProps) {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-2xl border border-[#272724] bg-[#1a1a18]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-12 w-full items-center justify-between px-4 text-left text-sm text-[#f0efe9]"
      >
        <span>Ver leads archivados ({leads.length})</span>
        <span className="text-xs text-[#9e9d94]">{open ? "Ocultar" : "Mostrar"}</span>
      </button>

      {open ? (
        <div className="border-t border-[#272724] p-3">
          {leads.length === 0 ? <p className="text-sm text-[#9e9d94]">Sin leads archivados</p> : null}
          <div className="space-y-2">
            {leads.map((lead) => (
              <button
                key={lead.id}
                type="button"
                onClick={() => onSelectLead(lead)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#2e2e2b] bg-[#161614] px-3 py-2 text-left transition hover:bg-[#1e1e1c]"
              >
                <div>
                  <p className="text-sm text-[#f0efe9]">{lead.nombre}</p>
                  <p className="mt-1 text-xs text-[#9e9d94]">{formatDate(lead.updated_at)}</p>
                </div>

                <div className="flex items-center gap-2">
                  {lead.ramo_interes ? (
                    <Badge
                      variant={getRamoBadgeVariant(lead.ramo_interes)?.variant ?? "otros"}
                      label={getRamoBadgeVariant(lead.ramo_interes)?.label}
                      size="sm"
                    />
                  ) : null}
                  <span className="text-xs text-[#c3c2b8]">{toArs(lead.valor_estimado)}</span>
                  <Badge variant="perdido" size="sm" label={lead.etapa === "descartado" ? "Descartado" : "Perdido"} />
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
