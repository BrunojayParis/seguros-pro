import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { getSession } from "@/lib/auth/getSession";
import { getClientes } from "@/lib/supabase/clientes";
import { getPolizas } from "@/lib/supabase/polizas";
import { ClientesTable } from "./ClientesTable";

type ClientesPageProps = {
  searchParams: Promise<{ nuevo?: string }>;
};

export default async function ClientesPage({ searchParams }: ClientesPageProps) {
  const session = await getSession();
  if (!session || !session.currentOrg) {
    redirect("/login");
  }

  const [{ data: clientesData }, { data: polizasData }] = await Promise.all([
    getClientes(session.currentOrg.id),
    getPolizas(session.currentOrg.id),
  ]);

  const polizasByCliente = new Map<string, number>();
  (polizasData ?? []).forEach((poliza) => {
    polizasByCliente.set(poliza.cliente_id, (polizasByCliente.get(poliza.cliente_id) ?? 0) + 1);
  });

  const clientes = (clientesData ?? []).map((cliente) => ({
    ...cliente,
    polizas_count: polizasByCliente.get(cliente.id) ?? 0,
  }));

  const { nuevo } = await searchParams;
  const openNewDefault = nuevo === "1";

  return (
    <section className="space-y-6">
      <PageHeader
        title="Clientes"
        subtitle="Gestion y seguimiento de cartera"
        actions={session.rol !== "asistente" ? (
          <a
            href="/dashboard/clientes?nuevo=1"
            className="inline-flex h-9 items-center rounded-lg border border-[#2f5696] bg-[#1a5fcc] px-3 text-sm text-[#e8f1ff] transition hover:bg-[#2f72d7]"
          >
            + Nuevo cliente
          </a>
        ) : null}
      />
      <ClientesTable clientes={clientes} rol={session.rol} openNewDefault={openNewDefault} />
    </section>
  );
}
