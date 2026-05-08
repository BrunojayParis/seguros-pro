"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Badge, DataTable, type DataTableColumn } from "@/components/ui";
import type { RolUsuario } from "@/lib/auth/types";
import type { Tables } from "@/types/database.types";

type VencimientoRow = Tables<"v_vencimientos_proximos">;

type VencimientosTableProps = {
  vencimientos: VencimientoRow[];
  rol: RolUsuario | null;
};

const FILTERS = [
  { key: "todos", label: "Todos" },
  { key: "criticos", label: "Criticos (<=7d)" },
  { key: "proximos", label: "Proximos (8-20d)" },
  { key: "en_plazo", label: "En plazo (21-60d)" },
] as const;

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getRamoVariant(ramo: string | null) {
  if (
    ramo === "automotor" ||
    ramo === "vida" ||
    ramo === "accidentes_personales" ||
    ramo === "hogar" ||
    ramo === "art"
  ) {
    return ramo;
  }

  return "otros";
}

function getDiasBadge(dias: number | null) {
  const safeDias = Number(dias ?? 0);

  if (safeDias <= 0) {
    return <Badge variant="vencida" label="Vencida" />;
  }

  if (safeDias <= 7) {
    return <Badge variant="vencida" label={`${safeDias} dias`} />;
  }

  if (safeDias <= 20) {
    return <Badge variant="por_vencer" label={`${safeDias} dias`} />;
  }

  return <Badge variant="inactivo" label={`${safeDias} dias`} />;
}

export function VencimientosTable({ vencimientos, rol }: VencimientosTableProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("todos");

  const filteredRows = useMemo(() => {
    const sorted = [...(vencimientos ?? [])].sort(
      (a, b) => Number(a.dias_restantes ?? Number.MAX_SAFE_INTEGER) - Number(b.dias_restantes ?? Number.MAX_SAFE_INTEGER),
    );

    return sorted.filter((item) => {
      const dias = Number(item.dias_restantes ?? Number.MAX_SAFE_INTEGER);

      if (filter === "criticos") return dias <= 7;
      if (filter === "proximos") return dias >= 8 && dias <= 20;
      if (filter === "en_plazo") return dias >= 21 && dias <= 60;

      return true;
    });
  }, [filter, vencimientos]);

  const rows = filteredRows.map((item) => ({
    ...item,
    id: item.id ?? `venc-${item.cliente_id ?? "x"}-${item.numero_poliza ?? "x"}`,
  }));

  const columns: DataTableColumn[] = [
    {
      key: "asegurado",
      label: "Asegurado",
      width: "20%",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar nombre={(row.cliente_nombre as string | null) ?? "Cliente"} />
          <span>{(row.cliente_nombre as string | null) ?? "-"}</span>
        </div>
      ),
    },
    { key: "numero_poliza", label: "N° Poliza", width: "14%" },
    {
      key: "ramo",
      label: "Ramo",
      width: "12%",
      render: (row) => <Badge variant={getRamoVariant(row.ramo as string | null)} />,
    },
    { key: "aseguradora_nombre", label: "Aseguradora", width: "14%" },
    {
      key: "vigencia_hasta",
      label: "Vence",
      width: "12%",
      render: (row) => formatDate(row.vigencia_hasta as string | null),
    },
    {
      key: "dias_restantes",
      label: "Dias restantes",
      width: "12%",
      render: (row) => getDiasBadge(row.dias_restantes as number | null),
    },
    {
      key: "accion",
      label: "Accion",
      width: "16%",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-[#2e2e2b] px-2 py-1 text-xs text-[#c3c2b8] transition hover:bg-[#1e1e1c]"
            onClick={(event) => {
              event.stopPropagation();
              if (!row.cliente_id) return;
              router.push(`/dashboard/clientes/${row.cliente_id}`);
            }}
          >
            Ver cliente {"->"}
          </button>

          {rol !== "asistente" ? (
            <button
              type="button"
              className="rounded-lg border border-[#2f5696] bg-[#1a5fcc] px-2 py-1 text-xs text-[#e8f1ff] transition hover:bg-[#2f72d7]"
              onClick={(event) => {
                event.stopPropagation();
                const clienteId = typeof row.cliente_id === "string" ? row.cliente_id : "";
                const polizaId = typeof row.id === "string" ? row.id : "";
                router.push(
                  `/dashboard/polizas/new?clienteId=${encodeURIComponent(clienteId)}&polizaId=${encodeURIComponent(polizaId)}`,
                );
              }}
            >
              Renovar {"->"}
            </button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => {
          const active = filter === item.key;
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

      <DataTable columns={columns} data={rows} emptyMessage="No hay vencimientos en este rango" searchable />
    </div>
  );
}
