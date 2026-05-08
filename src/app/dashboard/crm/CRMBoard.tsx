"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui";
import type { BadgeVariant } from "@/components/ui";
import { updateLeadAction } from "@/actions/leads";
import type { RolUsuario } from "@/lib/auth/types";
import type { Tables } from "@/types/database.types";
import type { EtapaLead } from "@/types/leads";
import { LeadModal } from "./LeadModal";
import { LeadsArchivo } from "./LeadsArchivo";

type LeadRow = Tables<"leads">;

type CRMBoardProps = {
  leads: LeadRow[];
  productores: Array<{ id: string; nombre: string }>;
  rol: RolUsuario | null;
  openNewDefault?: boolean;
};

type BoardEtapa = "contactado" | "cotizado" | "negociacion" | "ganado";

const BOARD_COLUMNS: Array<{ key: BoardEtapa; label: string }> = [
  { key: "contactado", label: "Contactado" },
  { key: "cotizado", label: "Cotizado" },
  { key: "negociacion", label: "Negociacion" },
  { key: "ganado", label: "Ganado" },
];

const RAMOS: Array<{ key: "todos" | NonNullable<LeadRow["ramo_interes"]>; label: string }> = [
  { key: "todos", label: "Todos" },
  { key: "automotor", label: "Automotor" },
  { key: "vida", label: "Vida" },
  { key: "accidentes_personales", label: "Accidentes" },
  { key: "hogar", label: "Hogar" },
  { key: "combinado_familiar", label: "Combinado" },
  { key: "art", label: "ART" },
  { key: "otros", label: "Otros" },
];

function toArs(value: number | string | null) {
  return `$ ${Number(value ?? 0).toLocaleString("es-AR")}`;
}

function formatDate(dateValue: string | null) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function timeAgo(dateValue: string | null) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";

  const diffMs = date.getTime() - Date.now();
  const minutes = Math.round(diffMs / 60000);
  const absMinutes = Math.abs(minutes);

  if (absMinutes < 60) {
    if (minutes >= 0) return `En ${absMinutes} ${absMinutes === 1 ? "minuto" : "minutos"}`;
    return `Hace ${absMinutes} ${absMinutes === 1 ? "minuto" : "minutos"}`;
  }

  const hours = Math.round(absMinutes / 60);
  if (hours < 24) {
    if (minutes >= 0) return `En ${hours} ${hours === 1 ? "hora" : "horas"}`;
    return `Hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
  }

  const days = Math.round(hours / 24);
  if (days < 7) {
    if (minutes >= 0) return `En ${days} ${days === 1 ? "dia" : "dias"}`;
    return `Hace ${days} ${days === 1 ? "dia" : "dias"}`;
  }

  return formatDate(dateValue);
}

function getRamoBadgeVariant(ramo: LeadRow["ramo_interes"]): { variant: BadgeVariant; label?: string } | null {
  if (!ramo) return null;
  if (ramo === "combinado_familiar") {
    return { variant: "otros" as const, label: "Combinado familiar" };
  }
  return { variant: ramo as BadgeVariant, label: undefined };
}

export function CRMBoard({ leads, productores, rol, openNewDefault = false }: CRMBoardProps) {
  const [leadsState, setLeadsState] = useState(leads);
  const [productorFilter, setProductorFilter] = useState<string>("todos");
  const [ramoFilter, setRamoFilter] = useState<(typeof RAMOS)[number]["key"]>("todos");
  const [search, setSearch] = useState("");
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);
  const [hoverColumn, setHoverColumn] = useState<BoardEtapa | null>(null);
  const [selectedLeadForKeyboard, setSelectedLeadForKeyboard] = useState<string | null>(null);
  const [editingLead, setEditingLead] = useState<LeadRow | null>(null);
  const [openCreate, setOpenCreate] = useState(openNewDefault);
  const [pending, startTransition] = useTransition();

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();
    return leadsState.filter((lead) => {
      const byProductor = productorFilter === "todos" || lead.productor_id === productorFilter;
      const byRamo = ramoFilter === "todos" || lead.ramo_interes === ramoFilter;
      const bySearch = !query || lead.nombre.toLowerCase().includes(query);
      return byProductor && byRamo && bySearch;
    });
  }, [leadsState, productorFilter, ramoFilter, search]);

  const boardLeads = useMemo(
    () => filteredLeads.filter((lead) => lead.etapa !== "perdido" && lead.etapa !== "descartado"),
    [filteredLeads],
  );
  const archivedLeads = useMemo(
    () => filteredLeads.filter((lead) => lead.etapa === "perdido" || lead.etapa === "descartado"),
    [filteredLeads],
  );

  const moveLeadOptimistically = (leadId: string, etapa: EtapaLead) => {
    const previous = leadsState;
    setLeadsState((current) => current.map((lead) => (lead.id === leadId ? { ...lead, etapa } : lead)));

    startTransition(() => {
      updateLeadAction(leadId, { etapa })
        .then((result) => {
          if (result.error) {
            setLeadsState(previous);
            toast.error(result.error);
          }
        })
        .catch(() => {
          setLeadsState(previous);
          toast.error("No pudimos mover el lead");
        });
    });
  };

  const handleDrop = (targetEtapa: BoardEtapa) => {
    if (!draggingLeadId) return;
    const lead = leadsState.find((item) => item.id === draggingLeadId);
    setHoverColumn(null);
    setDraggingLeadId(null);
    if (!lead || lead.etapa === targetEtapa) return;
    moveLeadOptimistically(lead.id, targetEtapa);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#272724] bg-[#1a1a18] p-3">
        {rol === "admin" ? (
          <select
            value={productorFilter}
            onChange={(event) => setProductorFilter(event.target.value)}
            className="h-9 rounded-lg border border-[#2e2e2b] bg-[#161614] px-3 text-sm text-[#f0efe9]"
          >
            <option value="todos">Todos los productores</option>
            {productores.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {RAMOS.map((ramo) => {
            const active = ramoFilter === ramo.key;
            return (
              <button
                key={ramo.key}
                type="button"
                onClick={() => setRamoFilter(ramo.key)}
                className={`h-8 rounded-full border px-3 text-xs uppercase tracking-[0.08em] transition ${
                  active
                    ? "border-[#2f5696] bg-[#1a5fcc] text-[#e8f1ff]"
                    : "border-[#2e2e2b] bg-[#1a1a18] text-[#9e9d94] hover:bg-[#1e1e1c]"
                }`}
              >
                {ramo.label}
              </button>
            );
          })}
        </div>

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre"
          className="h-9 min-w-[220px] flex-1 rounded-lg border border-[#2e2e2b] bg-[#161614] px-3 text-sm text-[#f0efe9] placeholder:text-[#6b6a62]"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {BOARD_COLUMNS.map((column) => {
          const items = boardLeads.filter((lead) => lead.etapa === column.key);
          const total = items.reduce((acc, item) => acc + Number(item.valor_estimado ?? 0), 0);
          const isHover = hoverColumn === column.key;

          return (
            <article
              key={column.key}
              className={`flex min-h-[480px] flex-col rounded-2xl border bg-[#1a1a18] ${
                isHover ? "border-[#2f5696]" : "border-[#272724]"
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                setHoverColumn(column.key);
              }}
              onDragLeave={() => setHoverColumn(null)}
              onDrop={(event) => {
                event.preventDefault();
                handleDrop(column.key);
              }}
            >
              <header className="space-y-2 border-b border-[#272724] px-3 py-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#f0efe9]">{column.label}</h3>
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-[#2f5696] bg-[#1a5fcc]/20 px-2 text-xs text-[#d9e8ff]">
                    {items.length}
                  </span>
                </div>
                <p className="text-xs text-[#9e9d94]">{toArs(total)} ARS</p>
              </header>

              <div className="flex-1 space-y-2 overflow-y-auto p-3">
                {items.map((lead) => (
                  <button
                    key={lead.id}
                    type="button"
                    draggable
                    onDragStart={() => setDraggingLeadId(lead.id)}
                    onDragEnd={() => {
                      setDraggingLeadId(null);
                      setHoverColumn(null);
                    }}
                    onClick={() => setEditingLead(lead)}
                    onFocus={() => setSelectedLeadForKeyboard(lead.id)}
                    className="w-full rounded-xl border border-[#2e2e2b] bg-[#161614] p-3 text-left transition hover:border-[#3a3a36]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-[#f0efe9]">{lead.nombre}</p>
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#2e2e2b] bg-[#1e1e1c] text-xs text-[#f0efe9]">
                        {lead.nombre
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((part) => part[0]?.toUpperCase())
                          .join("") || "L"}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      {lead.ramo_interes ? (
                        <Badge
                          variant={getRamoBadgeVariant(lead.ramo_interes)?.variant ?? "otros"}
                          label={getRamoBadgeVariant(lead.ramo_interes)?.label}
                          size="sm"
                        />
                      ) : (
                        <span />
                      )}
                      <p className="text-xs text-[#c3c2b8]">{toArs(lead.valor_estimado)}</p>
                    </div>
                    {lead.proxima_accion ? (
                      <div className="mt-2 text-xs text-[#9e9d94]">
                        <p>{lead.proxima_accion}</p>
                        {lead.fecha_proxima ? <p className="mt-1 text-[#6b6a62]">{timeAgo(lead.fecha_proxima)}</p> : null}
                      </div>
                    ) : null}
                  </button>
                ))}
              </div>

              <div className="border-t border-[#272724] p-3">
                <button
                  type="button"
                  onClick={() => setOpenCreate(true)}
                  className="h-9 w-full rounded-lg border border-[#2e2e2b] text-sm text-[#c3c2b8] transition hover:bg-[#1e1e1c]"
                >
                  + Agregar lead
                </button>

                {selectedLeadForKeyboard ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => moveLeadOptimistically(selectedLeadForKeyboard, column.key)}
                    className="mt-2 h-8 w-full rounded-lg border border-[#2f5696] bg-[#1a5fcc]/20 text-xs text-[#d9e8ff] disabled:opacity-60"
                  >
                    Mover lead seleccionado aqui
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      <LeadsArchivo
        leads={archivedLeads}
        onSelectLead={(lead) => setEditingLead(lead)}
      />

      <LeadModal
        open={Boolean(editingLead)}
        lead={editingLead}
        onClose={() => setEditingLead(null)}
      />

      <LeadModal
        open={openCreate}
        lead={null}
        onClose={() => setOpenCreate(false)}
      />
    </div>
  );
}
