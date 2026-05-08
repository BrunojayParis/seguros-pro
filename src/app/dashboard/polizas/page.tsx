import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { getSession } from "@/lib/auth/getSession";
import { createServerClient } from "@/lib/supabase/client";
import { getPolizas } from "@/lib/supabase/polizas";
import type { Tables } from "@/types/database.types";
import { PolizasTable } from "./PolizasTable";

type PolizaDetalleRow = Tables<"v_polizas_detalle">;

export default async function PolizasPage() {
  const session = await getSession();
  if (!session || !session.currentOrg) {
    redirect("/login");
  }

  await getPolizas(session.currentOrg.id);

  const supabase = await createServerClient();
  const { data: viewData } = await supabase
    .from("v_polizas_detalle")
    .select("*")
    .eq("org_id", session.currentOrg.id)
    .order("vigencia_hasta", { ascending: true });

  const polizas = (viewData ?? []).filter((row): row is PolizaDetalleRow => Boolean(row.id));

  return (
    <section className="space-y-6">
      <PageHeader
        title="Pólizas"
        actions={
          session.rol !== "asistente" ? (
            <Link
              href="/dashboard/polizas/new"
              className="inline-flex h-9 items-center rounded-lg border border-[#2f5696] bg-[#1a5fcc] px-3 text-sm text-[#e8f1ff] transition hover:bg-[#2f72d7]"
            >
              + Nueva póliza
            </Link>
          ) : null
        }
      />

      <PolizasTable polizas={polizas} rol={session.rol} />
    </section>
  );
}
