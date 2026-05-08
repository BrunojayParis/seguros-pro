"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Badge, EmptyState, StatusTimeline } from "@/components/ui";
import { DocumentosTab } from "@/components/documentos/DocumentosTab";
import type { RolUsuario } from "@/lib/auth/types";
import type { Tables } from "@/types/database.types";
import type { PolizaWithDetalle } from "@/lib/supabase/polizas";

type PolizaDetalleProps = {
  poliza: PolizaWithDetalle;
  documentos: Tables<"documentos">[];
  actividades: Tables<"actividades">[];
  siniestros: Tables<"siniestros">[];
  cliente: Tables<"clientes"> | null;
  aseguradora: Tables<"aseguradoras"> | null;
  rol: RolUsuario | null;
  orgId: string;
};

const tabs = ["resumen", "cliente", "documentos", "siniestros", "actividad"] as const;

function ars(value: number | null) {
  return `$ ${Number(value ?? 0).toLocaleString("es-AR")}`;
}

function estadoVariant(estado: string) {
  if (estado === "en_tramite" || estado === "suspendida") return "por_vencer";
  if (estado === "cancelada") return "vencida";
  return estado;
}

function ramoVariant(ramo: string) {
  if (ramo === "combinado_familiar") return "hogar";
  return ramo;
}

export function PolizaDetalle({
  poliza,
  actividades,
  siniestros,
  documentos,
  cliente,
  aseguradora,
  rol,
  orgId,
}: PolizaDetalleProps) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("resumen");

  const timelineItems = useMemo(
    () =>
      actividades.map((item, index) => ({
        variant:
          item.tipo === "poliza_emitida" || item.tipo === "poliza_renovada"
            ? ("success" as const)
            : item.tipo === "siniestro_denunciado"
              ? ("danger" as const)
              : ("default" as const),
        label: item.titulo,
        date: new Date(item.created_at).toLocaleString("es-AR"),
        active: index === 0,
      })),
    [actividades],
  );

  const clienteNombre =
    cliente?.tipo_persona === "juridica"
      ? cliente.razon_social || "Cliente"
      : [cliente?.nombre, cliente?.apellido].filter(Boolean).join(" ") || "Cliente";

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

      {tab === "resumen" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#272724] bg-[#1a1a18] p-4">
            <h3 className="text-sm font-semibold text-[#f0efe9]">Datos de la póliza</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-[#9e9d94]">Aseguradora</dt><dd>{aseguradora?.nombre ?? "-"}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-[#9e9d94]">Vigencia</dt><dd>{poliza.vigencia_desde} - {poliza.vigencia_hasta}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-[#9e9d94]">Prima neta</dt><dd>{ars(poliza.prima_neta)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-[#9e9d94]">Impuestos</dt><dd>{ars(poliza.impuestos)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-[#9e9d94]">Prima total</dt><dd>{ars(poliza.prima_total)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-[#9e9d94]">Periodicidad</dt><dd>{poliza.periodicidad}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-[#9e9d94]">Suma asegurada</dt><dd>{ars(poliza.suma_asegurada)}</dd></div>
              <div className="flex justify-between gap-3 items-center"><dt className="text-[#9e9d94]">Estado</dt><dd><Badge variant={estadoVariant(poliza.estado) as any} label={poliza.estado === "en_tramite" ? "En trámite" : undefined} /></dd></div>
            </dl>
          </div>

          <div className="rounded-2xl border border-[#272724] bg-[#1a1a18] p-4">
            <div className="mb-3 flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#f0efe9]">Datos del ramo</h3>
              <Badge variant={ramoVariant(poliza.ramo) as any} label={poliza.ramo === "combinado_familiar" ? "Combinado familiar" : undefined} />
            </div>

            {poliza.ramo === "automotor" ? (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-[#9e9d94]">Marca</dt><dd>{(poliza.detalle as Tables<"polizas_automotor"> | null)?.marca ?? "-"}</dd></div>
                <div className="flex justify-between"><dt className="text-[#9e9d94]">Modelo</dt><dd>{(poliza.detalle as Tables<"polizas_automotor"> | null)?.modelo ?? "-"}</dd></div>
                <div className="flex justify-between"><dt className="text-[#9e9d94]">Año</dt><dd>{(poliza.detalle as Tables<"polizas_automotor"> | null)?.anio ?? "-"}</dd></div>
                <div className="flex justify-between"><dt className="text-[#9e9d94]">Patente</dt><dd>{(poliza.detalle as Tables<"polizas_automotor"> | null)?.patente ?? "-"}</dd></div>
                <div className="flex justify-between"><dt className="text-[#9e9d94]">Color</dt><dd>{(poliza.detalle as Tables<"polizas_automotor"> | null)?.color ?? "-"}</dd></div>
                <div className="flex justify-between"><dt className="text-[#9e9d94]">Uso</dt><dd>{(poliza.detalle as Tables<"polizas_automotor"> | null)?.uso ?? "-"}</dd></div>
                <div className="flex justify-between"><dt className="text-[#9e9d94]">Cobertura</dt><dd>{(poliza.detalle as Tables<"polizas_automotor"> | null)?.tipo_cobertura ?? "-"}</dd></div>
                <div className="flex justify-between"><dt className="text-[#9e9d94]">Valor venal</dt><dd>{ars((poliza.detalle as Tables<"polizas_automotor"> | null)?.valor_venal ?? null)}</dd></div>
                <div className="flex justify-between"><dt className="text-[#9e9d94]">GNC</dt><dd>{(poliza.detalle as Tables<"polizas_automotor"> | null)?.gnc ? "Sí" : "No"}</dd></div>
              </dl>
            ) : null}

            {poliza.ramo === "vida" ? (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-[#9e9d94]">Tipo</dt><dd>{(poliza.detalle as Tables<"polizas_vida"> | null)?.tipo_vida ?? "-"}</dd></div>
                <div className="flex justify-between"><dt className="text-[#9e9d94]">Capital asegurado</dt><dd>{ars((poliza.detalle as Tables<"polizas_vida"> | null)?.capital_asegurado ?? null)}</dd></div>
                <div className="flex justify-between"><dt className="text-[#9e9d94]">Plan</dt><dd>{(poliza.detalle as Tables<"polizas_vida"> | null)?.plan ?? "-"}</dd></div>
                <div className="flex justify-between"><dt className="text-[#9e9d94]">Fumador</dt><dd>{(poliza.detalle as Tables<"polizas_vida"> | null)?.fumador ? "Sí" : "No"}</dd></div>
                <div>
                  <dt className="text-[#9e9d94]">Beneficiarios</dt>
                  <dd className="mt-1 space-y-1">
                    {Array.isArray((poliza.detalle as Tables<"polizas_vida"> | null)?.beneficiarios)
                      ? ((poliza.detalle as Tables<"polizas_vida"> | null)?.beneficiarios as Array<Record<string, unknown>>).map((b, i) => (
                          <p key={`b-${i}`} className="text-sm">{String(b.nombre ?? "-")} - {String(b.porcentaje ?? "-")}%</p>
                        ))
                      : <p className="text-sm">-</p>}
                  </dd>
                </div>
              </dl>
            ) : null}

            {poliza.ramo === "accidentes_personales" ? (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-[#9e9d94]">Capital muerte</dt><dd>{ars((poliza.detalle as Tables<"polizas_accidentes"> | null)?.capital_muerte ?? null)}</dd></div>
                <div className="flex justify-between"><dt className="text-[#9e9d94]">Capital invalidez</dt><dd>{ars((poliza.detalle as Tables<"polizas_accidentes"> | null)?.capital_invalidez ?? null)}</dd></div>
                <div className="flex justify-between"><dt className="text-[#9e9d94]">Asistencia médica</dt><dd>{ars((poliza.detalle as Tables<"polizas_accidentes"> | null)?.asistencia_medica ?? null)}</dd></div>
                <div className="flex justify-between"><dt className="text-[#9e9d94]">Horario</dt><dd>{(poliza.detalle as Tables<"polizas_accidentes"> | null)?.horario_cobertura ?? "-"}</dd></div>
              </dl>
            ) : null}

            {poliza.ramo === "hogar" || poliza.ramo === "combinado_familiar" ? (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-[#9e9d94]">Tipo bien</dt><dd>{(poliza.detalle as Tables<"polizas_hogar"> | null)?.tipo_bien ?? "-"}</dd></div>
                <div className="flex justify-between"><dt className="text-[#9e9d94]">Domicilio riesgo</dt><dd>{(poliza.detalle as Tables<"polizas_hogar"> | null)?.domicilio_riesgo ?? "-"}</dd></div>
                <div className="flex justify-between"><dt className="text-[#9e9d94]">Superficie</dt><dd>{(poliza.detalle as Tables<"polizas_hogar"> | null)?.superficie_m2 ?? "-"} m2</dd></div>
                <div className="flex justify-between"><dt className="text-[#9e9d94]">Construcción</dt><dd>{(poliza.detalle as Tables<"polizas_hogar"> | null)?.tipo_construccion ?? "-"}</dd></div>
                <div className="flex justify-between"><dt className="text-[#9e9d94]">Capital edificio</dt><dd>{ars((poliza.detalle as Tables<"polizas_hogar"> | null)?.capital_edificio ?? null)}</dd></div>
                <div className="flex justify-between"><dt className="text-[#9e9d94]">Capital contenido</dt><dd>{ars((poliza.detalle as Tables<"polizas_hogar"> | null)?.capital_contenido ?? null)}</dd></div>
                <div className="flex justify-between"><dt className="text-[#9e9d94]">Coberturas</dt><dd>{((poliza.detalle as Tables<"polizas_hogar"> | null)?.coberturas ?? []).join(", ") || "-"}</dd></div>
              </dl>
            ) : null}

            {poliza.ramo === "art" ? (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-[#9e9d94]">Razón social</dt><dd>{(poliza.detalle as Tables<"polizas_art"> | null)?.razon_social ?? "-"}</dd></div>
                <div className="flex justify-between"><dt className="text-[#9e9d94]">CUIT</dt><dd>{(poliza.detalle as Tables<"polizas_art"> | null)?.cuit_empleador ?? "-"}</dd></div>
                <div className="flex justify-between"><dt className="text-[#9e9d94]">Actividad</dt><dd>{(poliza.detalle as Tables<"polizas_art"> | null)?.actividad_ciiu ?? "-"}</dd></div>
                <div className="flex justify-between"><dt className="text-[#9e9d94]">Empleados</dt><dd>{(poliza.detalle as Tables<"polizas_art"> | null)?.cantidad_empleados ?? "-"}</dd></div>
                <div className="flex justify-between"><dt className="text-[#9e9d94]">Masa salarial</dt><dd>{ars((poliza.detalle as Tables<"polizas_art"> | null)?.masa_salarial ?? null)}</dd></div>
                <div className="flex justify-between"><dt className="text-[#9e9d94]">Alícuota</dt><dd>{(poliza.detalle as Tables<"polizas_art"> | null)?.alicuota ?? "-"}</dd></div>
              </dl>
            ) : null}
          </div>
        </div>
      ) : null}

      {tab === "cliente" ? (
        <div className="rounded-2xl border border-[#272724] bg-[#1a1a18] p-4 text-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-[#f0efe9]">{clienteNombre}</h3>
              <p className="mt-1 text-[#9e9d94]">{cliente?.email ?? "Sin email"}</p>
            </div>
            {cliente ? (
              <Link
                href={`/dashboard/clientes/${cliente.id}`}
                className="rounded-lg border border-[#2e2e2b] px-3 py-2 text-sm text-[#f0efe9] transition hover:bg-[#1e1e1c]"
              >
                Ver cliente
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      {tab === "documentos" ? (
        <DocumentosTab
          clienteId={poliza.cliente_id}
          polizaId={poliza.id}
          orgId={orgId}
          rol={rol ?? "asistente"}
        />
      ) : null}

      {tab === "siniestros" ? (
        <div className="space-y-3">
          {(rol === "productor" || rol === "admin") ? (
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#2f5696] bg-[#1a5fcc] px-3 text-sm text-[#e8f1ff] transition hover:bg-[#2f72d7]"
            >
              <Plus className="h-4 w-4" />
              + Denunciar siniestro
            </button>
          ) : null}

          {siniestros.length === 0 ? (
            <EmptyState title="Sin siniestros" description="Esta póliza no tiene siniestros registrados." />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {siniestros.map((item) => (
                <article key={item.id} className="rounded-2xl border border-[#272724] bg-[#1a1a18] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-[#f0efe9]">{item.numero_siniestro ?? item.id}</h4>
                    <Badge variant={item.estado === "rechazado" ? "vencida" : item.estado === "pagado" ? "vigente" : "por_vencer"} label={item.estado.replaceAll("_", " ")} />
                  </div>
                  <p className="mt-2 text-xs text-[#9e9d94]">Fecha ocurrencia: {item.fecha_ocurrencia}</p>
                  <p className="mt-2 text-sm text-[#f0efe9]">Monto reclamado: {ars(item.monto_reclamado)}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-[#c3c2b8]">{item.descripcion}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {tab === "actividad" ? (
        <div className="rounded-2xl border border-[#272724] bg-[#1a1a18] p-4">
          <StatusTimeline items={timelineItems} />
        </div>
      ) : null}
    </div>
  );
}
