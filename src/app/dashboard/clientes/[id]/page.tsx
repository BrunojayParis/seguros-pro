import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { getSession } from "@/lib/auth/getSession";
import { getActividadesByCliente } from "@/lib/supabase/actividades";
import { getClienteById } from "@/lib/supabase/clientes";
import { getPolizasByCliente } from "@/lib/supabase/polizas";
import { ClienteDetalle } from "./ClienteDetalle";

type ClienteDetallePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClienteDetallePage({ params }: ClienteDetallePageProps) {
  const session = await getSession();
  if (!session || !session.currentOrg) {
    redirect("/login");
  }

  const { id } = await params;
  const [clienteResult, polizasResult, actividadesResult] = await Promise.all([
    getClienteById(session.currentOrg.id, id),
    getPolizasByCliente(session.currentOrg.id, id),
    getActividadesByCliente(session.currentOrg.id, id, 10),
  ]);

  if (!clienteResult.data) {
    notFound();
  }

  const cliente = clienteResult.data;
  const title =
    cliente.tipo_persona === "juridica"
      ? cliente.razon_social || "Cliente"
      : [cliente.nombre, cliente.apellido].filter(Boolean).join(" ") || "Cliente";

  return (
    <section className="space-y-6">
      <PageHeader
        title={title}
        backHref="/dashboard/clientes"
        actions={
          session.rol !== "asistente" ? (
            <>
              <span className="rounded-lg border border-[#2e2e2b] px-3 py-2 text-sm text-[#f0efe9]">Editar</span>
              <span className="rounded-lg border border-[#2f5696] bg-[#1a5fcc] px-3 py-2 text-sm text-[#e8f1ff]">+ Poliza</span>
            </>
          ) : null
        }
      />

      <ClienteDetalle
        cliente={cliente}
        polizas={polizasResult.data ?? []}
        actividades={actividadesResult.data ?? []}
        rol={session.rol}
      />
    </section>
  );
}
