import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { getSession } from "@/lib/auth/getSession";
import { createServerClient } from "@/lib/supabase/client";
import { getDocumentosByPoliza } from "@/lib/supabase/documentos";
import { getPolizaById } from "@/lib/supabase/polizas";
import { getSiniestrosByPoliza } from "@/lib/supabase/siniestros";
import { updatePolizaEstadoAction } from "@/actions/polizas";
import { PolizaDetalle } from "./PolizaDetalle";

type PolizaDetallePageProps = {
  params: Promise<{ id: string }>;
};

export default async function PolizaDetallePage({ params }: PolizaDetallePageProps) {
  const session = await getSession();
  if (!session || !session.currentOrg) {
    redirect("/login");
  }

  const { id } = await params;
  const { data: poliza } = await getPolizaById(session.currentOrg.id, id);

  if (!poliza || poliza.org_id !== session.currentOrg.id) {
    notFound();
  }

  const supabase = await createServerClient();
  const [{ data: documentos }, { data: siniestros }, { data: actividades }, { data: cliente }, { data: aseguradora }] =
    await Promise.all([
      getDocumentosByPoliza(session.currentOrg.id, id),
      getSiniestrosByPoliza(session.currentOrg.id, id),
      supabase
        .from("actividades")
        .select("*")
        .eq("org_id", session.currentOrg.id)
        .eq("poliza_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("clientes")
        .select("*")
        .eq("org_id", session.currentOrg.id)
        .eq("id", poliza.cliente_id)
        .maybeSingle(),
      poliza.aseguradora_id
        ? supabase
            .from("aseguradoras")
            .select("*")
            .eq("org_id", session.currentOrg.id)
            .eq("id", poliza.aseguradora_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const renovarAction = async () => {
    "use server";
    await updatePolizaEstadoAction(id, "vigente");
    revalidatePath(`/dashboard/polizas/${id}`);
  };

  const cancelarAction = async () => {
    "use server";
    await updatePolizaEstadoAction(id, "cancelada", "Cancelacion manual");
    revalidatePath(`/dashboard/polizas/${id}`);
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title={`N° ${poliza.numero_poliza}`}
        backHref="/dashboard/polizas"
        actions={
          <>
            {session.rol === "productor" || session.rol === "admin" ? (
              <form action={renovarAction}>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center rounded-lg border border-[#2f5696] bg-[#1a5fcc] px-3 text-sm text-[#e8f1ff] transition hover:bg-[#2f72d7]"
                >
                  Renovar
                </button>
              </form>
            ) : null}

            {session.rol === "admin" ? (
              <form action={cancelarAction}>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center rounded-lg border border-[#7a3535] bg-[#552525] px-3 text-sm text-[#f8b1b1] transition hover:bg-[#6b2d2d]"
                >
                  Cancelar
                </button>
              </form>
            ) : null}
          </>
        }
      />

      <PolizaDetalle
        poliza={poliza}
        documentos={documentos ?? []}
        actividades={actividades ?? []}
        siniestros={siniestros ?? []}
        cliente={cliente}
        aseguradora={aseguradora ?? null}
        rol={session.rol}
      />
    </section>
  );
}
