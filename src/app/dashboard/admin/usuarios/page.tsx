import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { getSession } from "@/lib/auth/getSession";
import { createServerClient } from "@/lib/supabase/client";
import type { UsuarioConRol } from "@/types/admin";
import { UsuariosTable } from "./UsuariosTable";

type RawUsuario = {
  usuario_id: string;
  rol: UsuarioConRol["rol"];
  activo: boolean;
  created_at: string;
  perfil:
    | {
        id: string;
        nombre: string;
        apellido: string;
        email: string;
        avatar_url: string | null;
      }
    | {
        id: string;
        nombre: string;
        apellido: string;
        email: string;
        avatar_url: string | null;
      }[]
    | null;
};

export default async function AdminUsuariosPage() {
  const session = await getSession();

  if (!session || !session.currentOrg) {
    redirect("/login");
  }

  if (session.rol !== "admin") {
    redirect("/dashboard");
  }

  const supabase = await createServerClient();
  const { data } = await supabase
    .from("org_usuarios")
    .select("usuario_id, rol, activo, created_at, perfil:perfiles!org_usuarios_usuario_id_fkey(id, nombre, apellido, email, avatar_url)")
    .eq("org_id", session.currentOrg.id)
    .order("created_at", { ascending: false })
    .returns<RawUsuario[]>();

  const usuarios: UsuarioConRol[] = (data ?? []).map((row) => ({
    usuario_id: row.usuario_id,
    rol: row.rol,
    activo: row.activo,
    created_at: row.created_at,
    perfil: Array.isArray(row.perfil) ? row.perfil[0] ?? null : row.perfil,
  }));

  return (
    <section className="space-y-6">
      <PageHeader
        title="Usuarios"
        actions={
          <Link
            href="/dashboard/admin/usuarios?invitar=1"
            className="inline-flex h-9 items-center rounded-lg border border-[#2f5696] bg-[#1a5fcc] px-3 text-sm text-[#e8f1ff] transition hover:bg-[#2f72d7]"
          >
            + Invitar usuario
          </Link>
        }
      />

      <UsuariosTable usuarios={usuarios} currentUserId={session.user.id} orgId={session.currentOrg.id} />
    </section>
  );
}
