import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { getSession } from "@/lib/auth/getSession";
import { createServerClient } from "@/lib/supabase/client";
import { getClientes } from "@/lib/supabase/clientes";
import { NewPolizaForm } from "./NewPolizaForm";

export default async function NewPolizaPage() {
  const session = await getSession();
  if (!session || !session.currentOrg) {
    redirect("/login");
  }

  if (session.rol === "asistente") {
    redirect("/dashboard/polizas");
  }

  const supabase = await createServerClient();
  const [{ data: clientesData }, { data: aseguradorasData }] = await Promise.all([
    getClientes(session.currentOrg.id),
    supabase
      .from("aseguradoras")
      .select("*")
      .eq("org_id", session.currentOrg.id)
      .eq("activo", true)
      .order("nombre", { ascending: true }),
  ]);

  return (
    <section className="space-y-6">
      <PageHeader title="Nueva póliza" backHref="/dashboard/polizas" />
      <NewPolizaForm clientes={clientesData ?? []} aseguradoras={aseguradorasData ?? []} />
    </section>
  );
}
