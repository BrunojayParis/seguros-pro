"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, DataTable, EmptyState, StatusTimeline, type DataTableColumn } from "@/components/ui";
import { DocumentosTab } from "@/components/documentos/DocumentosTab";
import type { RolUsuario } from "@/lib/auth/types";
import type { Tables } from "@/types/database.types";
import { EditClienteModal } from "./EditClienteModal";

type ClienteDetalleProps = {
  cliente: Tables<"clientes">;
  polizas: Tables<"polizas">[];
  actividades: Tables<"actividades">[];
  rol: RolUsuario | null;
  orgId: string;
};

const tabs = ["datos", "polizas", "documentos", "actividad"] as const;

export function ClienteDetalle({ cliente, polizas, actividades, rol, orgId }: ClienteDetalleProps) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof tabs)[number]>("datos");
  const [openEdit, setOpenEdit] = useState(false);

  const vigentes = polizas.filter((item) => item.estado === "vigente").length;
  const primaTotal = polizas.reduce((acc, item) => acc + Number(item.prima_total ?? 0), 0);

  const timelineItems = actividades.map((item) => ({
    label: item.titulo,
    date: new Date(item.created_at).toLocaleString("es-AR"),
    active: false,
    variant: "default" as const,
  }));

  const polizasRows = useMemo(
    () =>
      polizas.map((item) => ({
        ...item,
        estadoVariant:
          item.estado === "suspendida" || item.estado === "en_tramite" ? "por_vencer" : item.estado,
        ramoVariant: item.ramo === "combinado_familiar" ? "hogar" : item.ramo,
      })),
    [polizas],
  );

  const columns: DataTableColumn[] = [
    { key: "numero_poliza", label: "N° Poliza", width: "22%" },
    {
      key: "ramo",
      label: "Ramo",
      width: "18%",
      render: (row) => (
        <Badge
          variant={row.ramoVariant}
          label={row.ramo === "combinado_familiar" ? "Combinado familiar" : undefined}
        />
      ),
    },
    {
      key: "prima_total",
      label: "Prima",
      width: "18%",
      render: (row) => `$ ${Number(row.prima_total ?? 0).toLocaleString("es-AR")}`,
    },
    { key: "vigencia_hasta", label: "Vigencia hasta", width: "20%" },
    {
      key: "estado",
      label: "Estado",
      width: "22%",
      render: (row) => <Badge variant={row.estadoVariant} label={row.estado === "en_tramite" ? "En tramite" : undefined} />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`h-8 rounded-full border px-3 text-xs uppercase tracking-[0.08em] ${
              tab === item
                ? "border-[#2f5696] bg-[#1a5fcc] text-[#e8f1ff]"
                : "border-[#2e2e2b] bg-[#1a1a18] text-[#9e9d94]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "datos" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#272724] bg-[#1a1a18] p-4">
            <h3 className="text-sm font-semibold text-[#f0efe9]">Datos personales</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-[#9e9d94]">Tipo</dt><dd>{cliente.tipo_persona}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-[#9e9d94]">Email</dt><dd>{cliente.email ?? "-"}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-[#9e9d94]">Telefono</dt><dd>{cliente.telefono ?? "-"}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-[#9e9d94]">DNI/CUIT</dt><dd>{cliente.dni ?? cliente.cuit_cuil ?? cliente.cuit_empresa ?? "-"}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-[#9e9d94]">Domicilio</dt><dd>{cliente.domicilio ?? "-"}</dd></div>
            </dl>
            {rol !== "asistente" ? (
              <button
                type="button"
                onClick={() => setOpenEdit(true)}
                className="mt-4 rounded-lg border border-[#2e2e2b] px-3 py-2 text-sm text-[#f0efe9] transition hover:bg-[#1e1e1c]"
              >
                Editar cliente
              </button>
            ) : null}
          </div>

          <div className="rounded-2xl border border-[#272724] bg-[#1a1a18] p-4">
            <h3 className="text-sm font-semibold text-[#f0efe9]">Resumen del expediente</h3>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-[#272724] p-3"><p className="text-[#9e9d94]">Polizas vigentes</p><p className="mt-1 text-lg">{vigentes}</p></div>
              <div className="rounded-xl border border-[#272724] p-3"><p className="text-[#9e9d94]">Prima total</p><p className="mt-1 text-lg">$ {primaTotal.toLocaleString("es-AR")}</p></div>
              <div className="rounded-xl border border-[#272724] p-3"><p className="text-[#9e9d94]">Documentos</p><p className="mt-1 text-lg">0</p></div>
              <div className="rounded-xl border border-[#272724] p-3"><p className="text-[#9e9d94]">Siniestros</p><p className="mt-1 text-lg">0</p></div>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "polizas" ? (
        polizasRows.length ? (
          <DataTable columns={columns} data={polizasRows} onRowClick={(row) => router.push(`/dashboard/polizas/${row.id}`)} />
        ) : (
          <EmptyState title="Sin polizas" description="Este cliente todavia no tiene polizas asociadas." />
        )
      ) : null}

      {tab === "documentos" ? (
        <DocumentosTab clienteId={cliente.id} orgId={orgId} rol={rol ?? "asistente"} />
      ) : null}

      {tab === "actividad" ? (
        <div className="rounded-2xl border border-[#272724] bg-[#1a1a18] p-4">
          {timelineItems.length ? (
            <StatusTimeline items={timelineItems} />
          ) : (
            <EmptyState title="Sin actividad" description="No hay movimientos registrados para este cliente." />
          )}
        </div>
      ) : null}

      <EditClienteModal open={openEdit} onClose={() => setOpenEdit(false)} cliente={cliente} rol={rol} />
    </div>
  );
}
