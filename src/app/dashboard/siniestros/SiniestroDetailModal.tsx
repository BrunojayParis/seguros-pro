"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge, Modal, StatusTimeline } from "@/components/ui";
import type { StatusTimelineProps } from "@/components/ui";
import type { RolUsuario } from "@/lib/auth/types";
import type { EstadoSiniestro, SiniestroConDetalle } from "@/types/siniestros";
import { UpdateEstadoForm } from "./UpdateEstadoForm";

type SiniestroDetailModalProps = {
  open: boolean;
  onClose: () => void;
  siniestro: SiniestroConDetalle | null;
  rol: RolUsuario | null;
};

const ESTADOS: EstadoSiniestro[] = [
  "denunciado",
  "en_instruccion",
  "periciado",
  "aprobado",
  "rechazado",
  "pagado",
  "cerrado",
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

export function SiniestroDetailModal({ open, onClose, siniestro, rol }: SiniestroDetailModalProps) {
  const [estadoLocal, setEstadoLocal] = useState<EstadoSiniestro | null>(null);
  const [observacionesLocal, setObservacionesLocal] = useState<string>("");

  useEffect(() => {
    if (!open || !siniestro) return;
    setEstadoLocal(null);
    setObservacionesLocal(siniestro.observaciones ?? "");
  }, [open, siniestro]);

  const currentEstado = estadoLocal ?? siniestro?.estado ?? null;
  const canUpdate = rol === "admin" || rol === "productor";

  const timeline = useMemo<StatusTimelineProps["items"]>(() => {
    if (!currentEstado) return [];

    const currentIndex = ESTADOS.indexOf(currentEstado);
    const variantFor = (estado: EstadoSiniestro, index: number): "default" | "success" | "warning" => {
      if (index > currentIndex) return "default";
      return estado === currentEstado ? "warning" : "success";
    };

    return ESTADOS.map((estado, index) => ({
      label: estadoLabel(estado),
      active: index <= currentIndex,
      variant: variantFor(estado, index),
      date: index === currentIndex ? formatDate(siniestro?.updated_at ?? null) : undefined,
    }));
  }, [currentEstado, siniestro?.updated_at]);

  if (!siniestro) return null;

  const observaciones = observacionesLocal || siniestro.observaciones || "";

  const clienteNombre = siniestro.cliente
    ? [siniestro.cliente.nombre, siniestro.cliente.apellido].filter(Boolean).join(" ") || siniestro.cliente.razon_social || "-"
    : "-";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={siniestro.numero_siniestro ?? "Detalle de siniestro"}
      size="lg"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            {canUpdate ? (
              <UpdateEstadoForm
                siniestroId={siniestro.id}
                estadoActual={currentEstado ?? siniestro.estado}
                observacion={observaciones}
                onObservacionChange={setObservacionesLocal}
                onUpdated={(next, observacion) => {
                  setEstadoLocal(next);
                  setObservacionesLocal(observacion.trim());
                }}
              />
            ) : null}
          </div>

          <Link
            href={`/dashboard/polizas/${siniestro.poliza_id}`}
            className="inline-flex h-9 items-center rounded-lg border border-[#2f5696] bg-[#1a5fcc] px-3 text-sm text-[#e8f1ff]"
          >
            Ver poliza {"->"}
          </Link>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Badge variant="siniestro" label={estadoLabel(currentEstado ?? siniestro.estado)} size="sm" />
          <span className="text-xs text-[#9e9d94]">Denuncia: {formatDate(siniestro.fecha_denuncia)}</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-xl border border-[#272724] bg-[#161614] p-3">
            <h3 className="text-xs uppercase tracking-[0.08em] text-[#9e9d94]">Datos del siniestro</h3>
            <p className="mt-2 text-sm">Fecha ocurrencia: {formatDate(siniestro.fecha_ocurrencia)}</p>
            <p className="mt-1 text-sm">Lugar: {siniestro.lugar_ocurrencia ?? "-"}</p>
            <p className="mt-1 text-sm">Descripcion: {siniestro.descripcion}</p>
          </article>

          <article className="rounded-xl border border-[#272724] bg-[#161614] p-3">
            <h3 className="text-xs uppercase tracking-[0.08em] text-[#9e9d94]">Poliza vinculada</h3>
            <p className="mt-2 text-sm">N° Poliza: {siniestro.poliza?.numero_poliza ?? "-"}</p>
            <p className="mt-1 text-sm">Ramo: {siniestro.poliza?.ramo ?? "-"}</p>
            <p className="mt-1 text-sm">Aseguradora: {siniestro.poliza?.aseguradora?.nombre ?? "-"}</p>
            <Link href={`/dashboard/polizas/${siniestro.poliza_id}`} className="mt-2 inline-block text-xs text-[#89b8ff]">
              Ir a poliza
            </Link>
          </article>

          <article className="rounded-xl border border-[#272724] bg-[#161614] p-3">
            <h3 className="text-xs uppercase tracking-[0.08em] text-[#9e9d94]">Cliente</h3>
            <p className="mt-2 text-sm">{clienteNombre}</p>
            <p className="mt-1 text-sm">Telefono: {siniestro.cliente?.telefono ?? "-"}</p>
            <p className="mt-1 text-sm">Email: {siniestro.cliente?.email ?? "-"}</p>
            <Link href={`/dashboard/clientes/${siniestro.cliente_id}`} className="mt-2 inline-block text-xs text-[#89b8ff]">
              Ir a cliente
            </Link>
          </article>

          <article className="rounded-xl border border-[#272724] bg-[#161614] p-3">
            <h3 className="text-xs uppercase tracking-[0.08em] text-[#9e9d94]">Economico</h3>
            <p className="mt-2 text-sm">Monto reclamado: {toArs(siniestro.monto_reclamado)}</p>
            <p className="mt-1 text-sm">Monto liquidado: {toArs(siniestro.monto_liquidado)}</p>
            <p className="mt-1 text-sm">Fecha pago: {formatDate(siniestro.fecha_pago)}</p>
            <p className="mt-1 text-sm">Liquidador: {siniestro.liquidador ?? "-"}</p>
          </article>
        </div>

        <article className="rounded-xl border border-[#272724] bg-[#161614] p-3">
          <h3 className="text-xs uppercase tracking-[0.08em] text-[#9e9d94]">Observaciones</h3>
          {rol !== "asistente" ? (
            <textarea
              value={observaciones}
              onChange={(event) => setObservacionesLocal(event.target.value)}
              className="mt-2 min-h-20 w-full rounded-lg border border-[#2e2e2b] bg-[#161614] px-3 py-2 text-sm text-[#f0efe9]"
            />
          ) : (
            <p className="mt-2 text-sm">{observaciones || "Sin observaciones"}</p>
          )}
        </article>

        <article className="rounded-xl border border-[#272724] bg-[#161614] p-3">
          <h3 className="text-xs uppercase tracking-[0.08em] text-[#9e9d94]">Timeline de estado</h3>
          <div className="mt-3">
            <StatusTimeline items={timeline} />
          </div>
        </article>
      </div>
    </Modal>
  );
}
