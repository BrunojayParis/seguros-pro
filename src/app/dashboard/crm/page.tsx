import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { getSession } from "@/lib/auth/getSession";
import { createServerClient } from "@/lib/supabase/client";
import { getLeads } from "@/lib/supabase/leads";
import type { RolUsuario } from "@/lib/auth/types";
import { CRMBoard } from "./CRMBoard";

type ProductorLite = {
  id: string;
  nombre: string;
};

type CRMPageProps = {
  searchParams: Promise<{ nuevo?: string }>;
};

export default async function CRMPage({ searchParams }: CRMPageProps) {
  const session = await getSession();
  if (!session || !session.currentOrg) {
    redirect("/login");
  }

  const supabase = await createServerClient();

  const [{ data: leadsData }, { data: productoresData }] = await Promise.all([
    getLeads(session.currentOrg.id),
    supabase
      .from("org_usuarios")
      .select("usuario_id, rol, perfil:perfiles!org_usuarios_usuario_id_fkey(nombre, apellido)")
      .eq("org_id", session.currentOrg.id)
      .in("rol", ["admin", "productor"]),
  ]);

  const productores: ProductorLite[] = (productoresData ?? []).map((item) => {
    const perfil = Array.isArray(item.perfil) ? item.perfil[0] : item.perfil;
    const nombre = [perfil?.nombre, perfil?.apellido].filter(Boolean).join(" ").trim();

    return {
      id: item.usuario_id,
      nombre: nombre || "Sin nombre",
    };
  });

  const { nuevo } = await searchParams;

  return (
    <section className="space-y-6">
      <PageHeader
        title="CRM - Seguimiento de leads"
        actions={
          <a
            href="/dashboard/crm?nuevo=1"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#2f5696] bg-[#1a5fcc] px-3 text-sm text-[#e8f1ff] transition hover:bg-[#2f72d7]"
          >
            <Plus className="h-4 w-4" />
            Nuevo lead
          </a>
        }
      />

      <CRMBoard
        leads={leadsData ?? []}
        productores={productores}
        rol={session.rol as RolUsuario | null}
        openNewDefault={nuevo === "1"}
      />
    </section>
  );
}
