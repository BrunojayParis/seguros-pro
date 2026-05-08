"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Avatar, Badge, DataTable, type DataTableColumn } from "@/components/ui";
import type { RolUsuario } from "@/lib/auth/types";
import type { Tables } from "@/types/database.types";
import { NewClienteModal } from "./NewClienteModal";

type ClienteRow = Tables<"clientes"> & { polizas_count: number };

type ClientesTableProps = {
  clientes: ClienteRow[];
  rol: RolUsuario | null;
  openNewDefault?: boolean;
};

const filters = [
  { key: "todos", label: "Todos" },
  { key: "activo", label: "Activo" },
  { key: "inactivo", label: "Inactivo" },
  { key: "prospecto", label: "Prospecto" },
] as const;

export function ClientesTable({ clientes, rol, openNewDefault = false }: ClientesTableProps) {
  const router = useRouter();
  const [estado, setEstado] = useState<(typeof filters)[number]["key"]>("todos");
  const [openNewModal, setOpenNewModal] = useState(openNewDefault);

  const filtered = useMemo(() => {
    if (estado === "todos") return clientes;
    return clientes.filter((item) => item.estado === estado);
  }, [clientes, estado]);

  const rows = useMemo(
    () =>
      filtered.map((cliente) => ({
        id: cliente.id,
        nombre:
          cliente.tipo_persona === "juridica"
            ? cliente.razon_social || "-"
            : [cliente.nombre, cliente.apellido].filter(Boolean).join(" ") || "-",
        dni: cliente.dni ?? "-",
        email: cliente.email ?? "",
        telefono: cliente.telefono ?? "-",
        polizas_count: cliente.polizas_count,
        estado: cliente.estado,
        ramo: cliente.tipo_persona,
        cliente,
      })),
    [filtered],
  );

  const columns: DataTableColumn[] = [
    {
      key: "nombre",
      label: "Cliente",
      width: "28%",
      render: (row) => {
        const cliente = row.cliente as ClienteRow;
        return (
          <div className="flex items-center gap-3">
            <Avatar nombre={cliente.nombre || cliente.razon_social || "Cliente"} apellido={cliente.apellido ?? ""} />
            <div>
              <p className="font-medium text-[#f0efe9]">{row.nombre}</p>
              <p className="text-xs text-[#9e9d94]">{cliente.email ?? "Sin email"}</p>
            </div>
          </div>
        );
      },
    },
    { key: "dni", label: "DNI", width: "12%" },
    { key: "telefono", label: "Telefono", width: "16%" },
    {
      key: "polizas_count",
      label: "Polizas",
      width: "10%",
      render: (row) => <span>{String(row.polizas_count ?? 0)}</span>,
    },
    {
      key: "estado",
      label: "Estado",
      width: "12%",
      render: (row) => <Badge variant={row.estado} />,
    },
    {
      key: "acciones",
      label: "Acciones",
      width: "22%",
      render: (row) => (
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            className="rounded-lg border border-[#2e2e2b] px-2 py-1 text-[#c3c2b8] transition hover:bg-[#1e1e1c]"
            onClick={(event) => {
              event.stopPropagation();
              router.push(`/dashboard/clientes/${row.id}`);
            }}
          >
            Ver
          </button>
          {rol !== "asistente" ? (
            <span className="rounded-lg border border-[#2f5696] bg-[#1a5fcc] px-2 py-1 text-[#e8f1ff]">Editar</span>
          ) : (
            <span className="text-[#6b6a62]">Sin permisos</span>
          )}
        </div>
      ),
    },
  ];

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

        {rol !== "asistente" ? (
          <button
            type="button"
            onClick={() => setOpenNewModal(true)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#2f5696] bg-[#1a5fcc] px-3 text-sm text-[#e8f1ff] transition hover:bg-[#2f72d7]"
          >
            <Plus className="h-4 w-4" />
            Nuevo cliente
          </button>
        ) : null}
      </div>

      <DataTable
        columns={columns}
        data={rows}
        searchable
        emptyMessage="No hay clientes cargados"
        onRowClick={(row) => router.push(`/dashboard/clientes/${row.id}`)}
      />

      <NewClienteModal open={openNewModal} onClose={() => setOpenNewModal(false)} />
    </div>
  );
}
