import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AlertTriangle, CalendarClock, FileText, Gauge, Users, Workflow } from "lucide-react";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { getSession } from "@/lib/auth/getSession";
import { logout, switchOrg } from "@/lib/auth/actions";
import { createServerClient } from "@/lib/supabase/client";
import { getVencimientosProximos } from "@/lib/supabase/vencimientos";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  { href: "/dashboard/polizas", label: "Polizas", icon: FileText },
  { href: "/dashboard/crm", label: "CRM", icon: Workflow },
  { href: "/dashboard/siniestros", label: "Siniestros", icon: AlertTriangle },
  { href: "/dashboard/vencimientos", label: "Vencimientos", icon: CalendarClock },
] as const;

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!session.currentOrg) {
    redirect("/login");
  }

  const userDisplayName =
    [session.perfil?.nombre, session.perfil?.apellido].filter(Boolean).join(" ") || session.user.email;
  const avatarFallback = (session.perfil?.nombre?.[0] ?? session.user.email?.[0] ?? "U").toUpperCase();
  const { data: vencimientosData } = await getVencimientosProximos(session.currentOrg.id, 30);
  const vencimientosBadge = (vencimientosData ?? []).filter((item) => Number(item.dias_restantes ?? 9999) <= 30).length;
  const supabase = await createServerClient();
  const { count: siniestrosBadge } = await supabase
    .from("siniestros")
    .select("id", { count: "exact", head: true })
    .eq("org_id", session.currentOrg.id)
    .not("estado", "in", "(pagado,cerrado)");

  const resolvedNavItems = navItems.map((item) => ({
    ...item,
    badge:
      item.href === "/dashboard/vencimientos"
        ? vencimientosBadge
        : item.href === "/dashboard/siniestros"
          ? (siniestrosBadge ?? 0)
          : undefined,
  }));

  const switchOrgAction = async (formData: FormData) => {
    "use server";

    const orgId = formData.get("orgId");

    if (typeof orgId !== "string") {
      return;
    }

    await switchOrg(orgId);
    revalidatePath("/");
  };

  return (
    <SessionProvider value={session}>
      <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
        <aside className="flex w-72 flex-col border-r border-zinc-800 bg-zinc-900/80 p-5">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3">
            <p className="text-xs tracking-[0.12em] text-zinc-500">ORGANIZACION</p>
            <p className="mt-1 truncate text-sm font-medium text-zinc-100">
              {session.currentOrg?.nombre ?? "Sin organizacion"}
            </p>
          </div>

          {session.orgs.length > 1 ? (
            <form action={switchOrgAction} className="mt-3">
              <label htmlFor="orgId" className="mb-1 block text-xs tracking-[0.1em] text-zinc-500">
                CAMBIAR ORGANIZACION
              </label>
              <select
                id="orgId"
                name="orgId"
                defaultValue={session.currentOrg?.id}
                className="h-10 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm outline-none ring-blue-500 focus:ring-2"
              >
                {session.orgs.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.nombre}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="mt-2 h-9 w-full rounded-xl border border-zinc-700 text-sm text-zinc-200 transition hover:bg-zinc-800"
              >
                Cambiar
              </button>
            </form>
          ) : null}

          <nav className="mt-7 flex flex-1 flex-col gap-2">
            {resolvedNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-zinc-100"
              >
                <span className="inline-flex items-center gap-2">
                  <item.icon className={`h-4 w-4 ${item.href === "/dashboard/siniestros" ? "text-amber-400" : ""}`} />
                  {item.label}
                </span>
                {item.badge && item.badge > 0 ? (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#e05555] px-1.5 text-[10px] font-semibold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            ))}

            {session.rol === "admin" ? (
              <Link
                href="/dashboard/admin"
                className="rounded-xl px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-zinc-100"
              >
                Admin
              </Link>
            ) : null}
          </nav>

          <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-content-center rounded-full bg-blue-500/20 text-sm font-semibold text-blue-200">
                {avatarFallback}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-100">{userDisplayName}</p>
                <p className="truncate text-xs uppercase tracking-[0.08em] text-zinc-500">
                  {session.rol ?? "sin rol"}
                </p>
              </div>
            </div>
            <form action={logout} className="mt-3">
              <button
                type="submit"
                className="h-9 w-full rounded-xl border border-zinc-700 text-sm text-zinc-200 transition hover:bg-zinc-800"
              >
                Cerrar sesion
              </button>
            </form>
          </div>
        </aside>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </SessionProvider>
  );
}
