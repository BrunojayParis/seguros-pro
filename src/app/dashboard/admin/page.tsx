import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, ShieldCheck, Users } from "lucide-react";
import { MetricCard, PageHeader } from "@/components/ui";
import { getSession } from "@/lib/auth/getSession";
import { createServerClient } from "@/lib/supabase/client";

export default async function AdminPage() {
  const session = await getSession();

  if (!session || !session.currentOrg) {
    redirect("/login");
  }

  if (session.rol !== "admin") {
    redirect("/dashboard");
  }

  const supabase = await createServerClient();
  const [{ count: usuariosTotal }, { count: aseguradorasActivas }] = await Promise.all([
    supabase.from("org_usuarios").select("id", { count: "exact", head: true }).eq("org_id", session.currentOrg.id),
    supabase
      .from("aseguradoras")
      .select("id", { count: "exact", head: true })
      .eq("org_id", session.currentOrg.id)
      .eq("activo", true),
  ]);

  return (
    <section className="space-y-6">
      <PageHeader title="Administración" subtitle="Gestión de usuarios, roles y aseguradoras" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/admin/usuarios"
          className="rounded-2xl border border-[#272724] bg-[#1a1a18] p-5 transition hover:border-[#2f5696] hover:bg-[#1d1d1b]"
        >
          <div className="flex items-center gap-2 text-[#f0efe9]">
            <Users className="h-4 w-4" />
            <h2 className="text-sm font-semibold">Usuarios</h2>
          </div>
          <p className="mt-2 text-sm text-[#9e9d94]">Invita usuarios y administra roles por organización.</p>
        </Link>

        <Link
          href="/dashboard/admin/aseguradoras"
          className="rounded-2xl border border-[#272724] bg-[#1a1a18] p-5 transition hover:border-[#2f5696] hover:bg-[#1d1d1b]"
        >
          <div className="flex items-center gap-2 text-[#f0efe9]">
            <Building2 className="h-4 w-4" />
            <h2 className="text-sm font-semibold">Aseguradoras</h2>
          </div>
          <p className="mt-2 text-sm text-[#9e9d94]">Crea, edita y administra las aseguradoras activas de la organización.</p>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard
          label="Total usuarios"
          value={usuariosTotal ?? 0}
          sub="Miembros de la organización"
          icon={<ShieldCheck className="h-4 w-4" />}
        />
        <MetricCard
          label="Aseguradoras activas"
          value={aseguradorasActivas ?? 0}
          sub="Disponibles para nuevas pólizas"
          icon={<Building2 className="h-4 w-4" />}
        />
      </div>
    </section>
  );
}
