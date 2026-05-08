import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { getActividadesRecientes } from "@/lib/supabase/actividades";
import { getDashboardMetrics } from "@/lib/supabase/dashboard";
import { getLeads } from "@/lib/supabase/leads";
import { getResumenProductor, getVencimientosProximos } from "@/lib/supabase/vencimientos";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session || !session.currentOrg) {
    redirect("/login");
  }

  if (session.rol === "asistente") {
    redirect("/dashboard/clientes");
  }

  const orgId = session.currentOrg.id;

  const [resumenResult, vencimientosResult, leadsResult, actividadesResult, metricsResult] = await Promise.all([
    getResumenProductor(orgId),
    getVencimientosProximos(orgId, 60),
    getLeads(orgId),
    getActividadesRecientes(orgId, 8),
    getDashboardMetrics(orgId),
  ]);

  const userName =
    [session.perfil?.nombre, session.perfil?.apellido].filter(Boolean).join(" ") || session.user.email || "Usuario";

  return (
    <DashboardClient
      resumen={resumenResult.data ?? []}
      vencimientos={vencimientosResult.data ?? []}
      leads={leadsResult.data ?? []}
      actividades={actividadesResult.data ?? []}
      metrics={metricsResult.data}
      userName={userName}
      rol={session.rol}
    />
  );
}
