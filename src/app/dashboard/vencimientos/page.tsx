import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { getSession } from "@/lib/auth/getSession";
import { getVencimientosProximos } from "@/lib/supabase/vencimientos";
import { VencimientosTable } from "./VencimientosTable";

export default async function VencimientosPage() {
  const session = await getSession();
  if (!session || !session.currentOrg) {
    redirect("/login");
  }

  const { data } = await getVencimientosProximos(session.currentOrg.id, 60);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Vencimientos"
        subtitle="Polizas que vencen en los proximos 60 dias"
        actions={
          <Link
            href="#"
            className="inline-flex h-9 items-center rounded-lg border border-[#2e2e2b] bg-[#1a1a18] px-3 text-sm text-[#f0efe9] transition hover:bg-[#21211f]"
          >
            Exportar
          </Link>
        }
      />

      <VencimientosTable vencimientos={data ?? []} rol={session.rol} />
    </section>
  );
}
