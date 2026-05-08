"use client";

import { MetricCard, StatusTimeline } from "@/components/ui";
import type { RolUsuario } from "@/lib/auth/types";
import type { ActividadReciente } from "@/lib/supabase/actividades";
import type { DashboardMetrics } from "@/lib/supabase/dashboard";
import type { Tables } from "@/types/database.types";

type ResumenRow = Tables<"v_resumen_productor">;
type VencimientoRow = Tables<"v_vencimientos_proximos">;
type LeadRow = Tables<"leads">;

type DashboardClientProps = {
  resumen: ResumenRow[];
  vencimientos: VencimientoRow[];
  leads: LeadRow[];
  actividades: ActividadReciente[];
  metrics: DashboardMetrics | null;
  userName: string;
  rol: RolUsuario | null;
};

const RAMO_COLORS: Record<string, string> = {
  automotor: "#5b9cf6",
  vida: "#4a7a5a",
  hogar: "#4f8cff",
  accidentes_personales: "#d4a017",
  art: "#c88c14",
  otros: "#6b6a62",
};

const FUNNEL_ETAPAS: LeadRow["etapa"][] = ["contactado", "cotizado", "negociacion", "ganado"];

function toArs(value: number) {
  return `$ ${Number(value || 0).toLocaleString("es-AR")}`;
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

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(Math.floor(diffMs / 60000), 0);

  if (minutes < 60) {
    return `Hace ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `Hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `Hace ${days} ${days === 1 ? "dia" : "dias"}`;
  }

  return formatDate(dateValue);
}

function getRamoLabel(ramo: string | null) {
  if (!ramo) return "Otros";
  if (ramo === "accidentes_personales") return "Accidentes personales";
  if (ramo === "art") return "ART";
  if (ramo === "combinado_familiar") return "Combinado familiar";
  return ramo.charAt(0).toUpperCase() + ramo.slice(1);
}

function getTrend(percentage: number | null): "up" | "down" | "neutral" {
  if (percentage === null) return "neutral";
  if (percentage > 0) return "up";
  if (percentage < 0) return "down";
  return "neutral";
}

export function DashboardClient({ resumen, vencimientos, leads, actividades, metrics, userName, rol }: DashboardClientProps) {
  const primaVigenteTotal = resumen.reduce((acc, item) => acc + Number(item.prima_total_vigente ?? 0), 0);
  const polizasVigentes = resumen.reduce((acc, item) => acc + Number(item.polizas_vigentes ?? 0), 0);
  const vencenEn30 = vencimientos.filter((item) => Number(item.dias_restantes ?? 9999) <= 30).length;

  const primaVariacionPorcentual = metrics?.prima_variacion_porcentual ?? null;
  const primaVariacionTrend = getTrend(primaVariacionPorcentual);
  const primaSubtext = metrics?.prima_variacion_disponible
    ? `${primaVariacionPorcentual && Number.isFinite(primaVariacionPorcentual) ? `${primaVariacionPorcentual.toFixed(1)}%` : "0.0%"} vs mes anterior`
    : "Sin base para comparar";

  const ramos = Object.entries(
    resumen.reduce<Record<string, number>>((acc, item) => {
      const ramo = item.ramo ?? "otros";
      acc[ramo] = (acc[ramo] ?? 0) + Number(item.prima_total_vigente ?? 0);
      return acc;
    }, {}),
  )
    .map(([ramo, prima]) => ({ ramo, prima }))
    .sort((a, b) => b.prima - a.prima);

  const maxRamoPrima = ramos[0]?.prima ?? 0;

  const timelineItems = actividades.slice(0, 8).map((item, index) => ({
    label: item.cliente_nombre ? `${item.titulo} - ${item.cliente_nombre}` : item.titulo,
    date: timeAgo(item.created_at),
    active: index === 0,
    variant: "default" as const,
  }));

  const funnelCounts = FUNNEL_ETAPAS.map((etapa) => ({
    etapa,
    count: leads.filter((lead) => lead.etapa === etapa).length,
  }));
  const baseFunnel = funnelCounts.find((item) => item.etapa === "contactado")?.count ?? 0;

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-[#f0efe9]">Dashboard</h1>
        <p className="mt-2 text-sm text-[#9e9d94]">Hola, {userName} {rol ? `- ${rol}` : ""}</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Prima mensual total"
          value={toArs(primaVigenteTotal)}
          sub={primaSubtext}
          trend={primaVariacionTrend}
        />
        <MetricCard
          label="Polizas activas"
          value={polizasVigentes}
          sub={`${metrics?.polizas_emitidas_mes_actual ?? 0} emitidas este mes`}
          trend="neutral"
        />
        <MetricCard
          label="Clientes totales"
          value={metrics?.clientes_total ?? 0}
          sub={`${metrics?.clientes_sin_poliza_vigente ?? 0} sin poliza vigente`}
          trend="neutral"
        />
        <MetricCard
          label="Vencen en 30 dias"
          value={vencenEn30}
          sub={vencenEn30 > 0 ? "Requieren atencion" : "Sin urgencias"}
          trend={vencenEn30 > 0 ? "down" : "neutral"}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-[#272724] bg-[#1a1a18] p-4">
          <h2 className="text-sm font-semibold text-[#f0efe9]">Produccion por ramo</h2>
          <div className="mt-4 space-y-3">
            {ramos.length === 0 ? <p className="text-sm text-[#9e9d94]">Sin datos para mostrar.</p> : null}
            {ramos.map((item) => {
              const width = maxRamoPrima > 0 ? (item.prima / maxRamoPrima) * 100 : 0;
              const color = RAMO_COLORS[item.ramo] ?? RAMO_COLORS.otros;

              return (
                <div key={item.ramo} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-[#c3c2b8]">
                    <span>{getRamoLabel(item.ramo)}</span>
                    <span>{toArs(item.prima)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#232320]">
                    <div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-2xl border border-[#272724] bg-[#1a1a18] p-4">
          <h2 className="text-sm font-semibold text-[#f0efe9]">Actividad reciente</h2>
          <div className="mt-4">
            <StatusTimeline items={timelineItems} />
          </div>
        </article>
      </div>

      <article className="rounded-2xl border border-[#272724] bg-[#1a1a18] p-4">
        <h2 className="text-sm font-semibold text-[#f0efe9]">Embudo de ventas</h2>
        <div className="mt-4 space-y-3">
          {funnelCounts.map((item) => {
            const width = baseFunnel > 0 ? (item.count / baseFunnel) * 100 : 0;
            const isGanado = item.etapa === "ganado";

            return (
              <div key={item.etapa} className="space-y-1">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.08em] text-[#c3c2b8]">
                  <span>{item.etapa}</span>
                  <span>{item.count}</span>
                </div>
                <div className="h-7 overflow-hidden rounded-lg bg-[#232320]">
                  <div
                    className="flex h-full items-center justify-end px-2 text-xs font-semibold text-white"
                    style={{
                      width: `${Math.max(width, item.count > 0 ? 10 : 0)}%`,
                      backgroundColor: isGanado ? "#4a7a5a" : "#1a5fcc",
                    }}
                  >
                    {item.count}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </article>
    </section>
  );
}
