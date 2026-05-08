"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Avatar, Badge, type BadgeVariant } from "@/components/ui";
import type { RolUsuario } from "@/lib/auth/types";
import type { Tables } from "@/types/database.types";

type PolizaRow = Tables<"v_polizas_detalle">;

type PolizasTableProps = {
  polizas: PolizaRow[];
  rol: RolUsuario | null;
};

const filters = [
  { key: "todos", label: "Todos" },
  { key: "vigente", label: "Vigente" },
  { key: "por_vencer", label: "Por vencer" },
  { key: "vencida", label: "Vencida" },
  { key: "siniestro", label: "Siniestro" },
] as const;

function toArs(value: number | null) {
  return `$ ${Number(value ?? 0).toLocaleString("es-AR")}`;
}

function mapEstadoVariant(estado: string | null): BadgeVariant {
  if (estado === "en_tramite" || estado === "suspendida") return "por_vencer";
  if (estado === "cancelada") return "vencida";
  if (estado === "vigente" || estado === "por_vencer" || estado === "vencida" || estado === "siniestro") {
    return estado;
  }
  return "vigente";
}

function mapRamoVariant(ramo: string | null): BadgeVariant {
  if (ramo === "combinado_familiar") return "hogar";
  if (ramo === "automotor" || ramo === "vida" || ramo === "accidentes_personales" || ramo === "hogar" || ramo === "art") {
    return ramo;
  }
  return "otros";
}

export function PolizasTable({ polizas, rol }: PolizasTableProps) {
  const router = useRouter();
  const [estado, setEstado] = useState<(typeof filters)[number]["key"]>("todos");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return polizas.filter((item) => {
      if (estado !== "todos" && item.estado !== estado) {
        return false;
      }

      if (!normalizedQuery) return true;

      const haystack = [item.numero_poliza, item.cliente_nombre, item.ramo]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [estado, polizas, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => {
            const active = estado === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setEstado(item.key)}
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

        <label className="flex h-10 w-full max-w-sm items-center gap-2 rounded-xl border border-[#2e2e2b] bg-[#161614] px-3 text-sm text-[#9e9d94]">
          <Search className="h-4 w-4" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar póliza..."
            className="w-full bg-transparent text-[#f0efe9] outline-none placeholder:text-[#6b6a62]"
          />
        </label>
      </div>

      <div data-rol={rol ?? ""} className="overflow-x-auto rounded-2xl border border-[#272724] bg-[#1a1a18]">
        <table className="w-full min-w-[860px] table-fixed">
          <thead>
            <tr className="border-b border-[#272724]">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.08em] text-[#6b6a62]">N° Póliza</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.08em] text-[#6b6a62]">Asegurado</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.08em] text-[#6b6a62]">Aseguradora</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.08em] text-[#6b6a62]">Ramo</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.08em] text-[#6b6a62]">Prima total</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.08em] text-[#6b6a62]">Vence</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.08em] text-[#6b6a62]">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-[#9e9d94]">
                  No hay pólizas para mostrar
                </td>
              </tr>
            ) : null}

            {filtered.map((poliza) => {
              const borderClass =
                poliza.estado === "por_vencer"
                  ? "border-l-4 border-l-[#d4a017]"
                  : poliza.estado === "vencida"
                    ? "border-l-4 border-l-[#e05555]"
                    : "border-l-4 border-l-transparent";

              return (
                <tr
                  key={poliza.id ?? poliza.numero_poliza ?? Math.random()}
                  className="cursor-pointer border-b border-[#272724] last:border-b-0 hover:bg-[#1e1e1c]"
                  onClick={() => poliza.id && router.push(`/dashboard/polizas/${poliza.id}`)}
                >
                  <td className="px-4 py-3 text-sm text-[#f0efe9]">
                    <div className={`${borderClass} -my-3 -ml-4 py-3 pl-3 font-semibold`}>
                      {poliza.numero_poliza ?? "-"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#f0efe9]">
                    <div className="flex items-center gap-3">
                      <Avatar nombre={poliza.cliente_nombre ?? "Cliente"} size="md" />
                      <span>{poliza.cliente_nombre ?? "-"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#f0efe9]">{poliza.aseguradora_nombre ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-[#f0efe9]">
                    <Badge
                      variant={mapRamoVariant(poliza.ramo)}
                      label={poliza.ramo === "combinado_familiar" ? "Combinado familiar" : undefined}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-[#f0efe9]">{toArs(poliza.prima_total)}</td>
                  <td className="px-4 py-3 text-sm text-[#f0efe9]">{poliza.vigencia_hasta ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-[#f0efe9]">
                    <Badge
                      variant={mapEstadoVariant(poliza.estado)}
                      label={poliza.estado === "en_tramite" ? "En trámite" : undefined}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
