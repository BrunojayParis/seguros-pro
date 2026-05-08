"use client";

import { useMemo, useState } from "react";
import { Avatar, Badge, DataTable, type DataTableColumn } from "@/components/ui";
import type { BadgeVariant } from "@/components/ui";
import type { RolUsuario } from "@/lib/auth/types";
import type { EstadoSiniestro, SiniestroConDetalle } from "@/types/siniestros";
import { SiniestroDetailModal } from "./SiniestroDetailModal";

type SiniestrosTableProps = {
  siniestros: SiniestroConDetalle[];
  rol: RolUsuario | null;
};

const FILTERS: Array<{ key: "todos" | EstadoSiniestro; label: string }> = [
  { key: "todos", label: "Todos" },
  { key: "denunciado", label: "Denunciado" },
  { key: "en_instruccion", label: "En instruccion" },
  { key: "periciado", label: "Periciado" },
  { key: "aprobado", label: "Aprobado" },
  { key: "rechazado", label: "Rechazado" },
  { key: "pagado", label: "Pagado" },
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

function estadoLabel(estado: EstadoSiniestro) {
  if (estado === "en_instruccion") return "En instruccion";
  return estado.charAt(0).toUpperCase() + estado.slice(1);
}

function getRamoBadgeVariant(ramo: string | null | undefined): { variant: BadgeVariant; label?: string } | null {
  if (!ramo) return null;
  if (ramo === "combinado_familiar") {
    return { variant: "otros" as const, label: "Combinado familiar" };
  }
  return { variant: ramo as BadgeVariant, label: undefined };
}

export function SiniestrosTable({ siniestros, rol }: SiniestrosTableProps) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("todos");
  const [selected, setSelected] = useState<SiniestroConDetalle | null>(null);

  const filtered = useMemo(() => {
    if (filter === "todos") return siniestros;
    return siniestros.filter((item) => item.estado === filter);
  }, [filter, siniestros]);

  const rows = useMemo(
    () =>
      filtered.map((item) => {
        const clienteNombre = item.cliente
          ? [item.cliente.nombre, item.cliente.apellido].filter(Boolean).join(" ") || item.cliente.razon_social || "-"
          : "-";

        return {
          id: item.id,
          numero_siniestro: item.numero_siniestro ?? "-",
          cliente_nombre: clienteNombre,
          numero_poliza: item.poliza?.numero_poliza ?? "-",
          ramo: item.poliza?.ramo,
          fecha_ocurrencia: item.fecha_ocurrencia,
          estado: item.estado,
          monto_reclamado: item.monto_reclamado,
          search_blob: `${item.numero_siniestro ?? ""} ${clienteNombre} ${item.poliza?.numero_poliza ?? ""}`,
          siniestro: item,
        };
      }),
    [filtered],
  );

  const columns: DataTableColumn[] = [
    { key: "numero_siniestro", label: "N° Siniestro", width: "12%" },
    {
      key: "cliente_nombre",
      label: "Asegurado",
      width: "20%",
      render: (row) => {
        const siniestro = row.siniestro as SiniestroConDetalle;
        const nombre = row.cliente_nombre as string;
        return (
          <div className="flex items-center gap-2">
            <Avatar nombre={nombre} apellido="" size="sm" />
            <span>{nombre}</span>
            <span className="hidden">{row.search_blob}</span>
          </div>
        );
      },
    },
    { key: "numero_poliza", label: "N° Poliza", width: "12%" },
    {
      key: "ramo",
      label: "Ramo",
      width: "10%",
      render: (row) =>
        row.ramo ? (
          <Badge
            variant={getRamoBadgeVariant(row.ramo)?.variant ?? "otros"}
            label={getRamoBadgeVariant(row.ramo)?.label}
            size="sm"
          />
        ) : (
          "-"
        ),
    },
    {
      key: "fecha_ocurrencia",
      label: "Fecha ocurrencia",
      width: "12%",
      render: (row) => formatDate(row.fecha_ocurrencia),
    },
    {
      key: "estado",
      label: "Estado",
      width: "12%",
      render: (row) => <Badge variant="siniestro" label={estadoLabel(row.estado)} size="sm" />,
    },
    {
      key: "monto_reclamado",
      label: "Monto reclamado",
      width: "12%",
      render: (row) => toArs(row.monto_reclamado),
    },
    {
      key: "acciones",
      label: "Acciones",
      width: "10%",
      render: () => <span className="text-xs text-[#9e9d94]">Ver detalle</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => {
          const active = item.key === filter;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`h-8 rounded-full border px-3 text-xs uppercase tracking-[0.08em] transition ${
                active
                  ? "border-[#2f5696] bg-[#1a5fcc] text-[#e8f1ff]"
                  : "border-[#2e2e2b] bg-[#1a1a18] text-[#9e9d94] hover:bg-[#1e1e1c]"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <DataTable
        columns={columns}
        data={rows}
        searchable
        emptyMessage="No hay siniestros cargados"
        onRowClick={(row) => setSelected(row.siniestro as SiniestroConDetalle)}
      />

      <SiniestroDetailModal open={Boolean(selected)} onClose={() => setSelected(null)} siniestro={selected} rol={rol} />
    </div>
  );
}
