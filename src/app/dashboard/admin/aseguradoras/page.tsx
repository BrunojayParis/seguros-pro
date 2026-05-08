import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { getSession } from "@/lib/auth/getSession";
import { createServerClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database.types";
import { AseguradorasTable } from "./AseguradorasTable";

export default async function AdminAseguradorasPage() {
  const session = await getSession();

  if (!session || !session.currentOrg) {
    redirect("/login");
  }

  if (session.rol !== "admin") {
    redirect("/dashboard");
  }

  const { data } = await (await createServerClient())
    .from("aseguradoras")
    .select("*")
    .eq("org_id", session.currentOrg.id)
    .order("nombre", { ascending: true });

  return (
    <section className="space-y-6">
      <PageHeader
        title="Aseguradoras"
        actions={
          <Link
            href="/dashboard/admin/aseguradoras?nueva=1"
            className="inline-flex h-9 items-center rounded-lg border border-[#2f5696] bg-[#1a5fcc] px-3 text-sm text-[#e8f1ff] transition hover:bg-[#2f72d7]"
          >
            + Nueva aseguradora
          </Link>
        }
      />

      <AseguradorasTable aseguradoras={(data ?? []) as Tables<"aseguradoras">[]} rol={session.rol} />
    </section>
  );
}
