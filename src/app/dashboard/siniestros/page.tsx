import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { getSession } from "@/lib/auth/getSession";
import { createServerClient } from "@/lib/supabase/client";
import type { SiniestroConDetalle } from "@/types/siniestros";
import { SiniestrosTable } from "./SiniestrosTable";

export default async function SiniestrosPage() {
  const session = await getSession();
  if (!session || !session.currentOrg) {
    redirect("/login");
  }

  const supabase = await createServerClient();
  const { data } = await supabase
    .from("siniestros")
    .select(
      "*, cliente:clientes(id, nombre, apellido, razon_social, telefono, email), poliza:polizas(id, numero_poliza, ramo, aseguradora:aseguradoras(id, nombre))",
    )
    .eq("org_id", session.currentOrg.id)
    .order("fecha_denuncia", { ascending: false });

  return (
    <section className="space-y-6">
      <PageHeader title="Siniestros" />
      <SiniestrosTable siniestros={(data ?? []) as SiniestroConDetalle[]} rol={session.rol} />
    </section>
  );
}
