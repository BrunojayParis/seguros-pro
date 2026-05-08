"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { toggleUsuarioActivoAction, updateRolAction } from "@/actions/admin";
import { Avatar, Badge, ConfirmDialog, DataTable, type DataTableColumn } from "@/components/ui";
import type { RolUsuario, UsuarioConRol } from "@/types/admin";
import { InviteModal } from "./InviteModal";

type UsuariosTableProps = {
  usuarios: UsuarioConRol[];
  currentUserId: string;
  orgId: string;
};

type ConfirmState =
  | {
      type: "rol";
      usuarioId: string;
      nombre: string;
      nuevoRol: RolUsuario;
    }
  | {
      type: "estado";
      usuarioId: string;
      nombre: string;
      activoActual: boolean;
    }
  | null;

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function UsuariosTable({ usuarios, currentUserId }: UsuariosTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  useEffect(() => {
    if (searchParams.get("invitar") === "1") {
      setInviteOpen(true);
    }
  }, [searchParams]);

  const rows = useMemo(
    () =>
      usuarios.map((usuario) => {
        const fullName = [usuario.perfil?.nombre, usuario.perfil?.apellido].filter(Boolean).join(" ") || "Sin nombre";
        return {
          id: usuario.usuario_id,
          nombre: fullName,
          email: usuario.perfil?.email ?? "-",
          rol: usuario.rol,
          activo: usuario.activo,
          created_at: usuario.created_at,
          avatar_nombre: usuario.perfil?.nombre ?? fullName,
          avatar_apellido: usuario.perfil?.apellido ?? "",
          avatar_url: usuario.perfil?.avatar_url ?? undefined,
          isSelf: usuario.usuario_id === currentUserId,
          search_blob: `${fullName} ${usuario.perfil?.email ?? ""}`,
        };
      }),
    [currentUserId, usuarios],
  );

  const onCloseInvite = () => {
    setInviteOpen(false);
    if (searchParams.get("invitar") === "1") {
      router.replace(pathname, { scroll: false });
    }
  };

  const columns: DataTableColumn[] = [
    {
      key: "nombre",
      label: "Usuario",
      width: "24%",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar
            nombre={String(row.avatar_nombre)}
            apellido={String(row.avatar_apellido)}
            src={typeof row.avatar_url === "string" ? row.avatar_url : undefined}
          />
          <div>
            <p className="font-medium text-[#f0efe9]">{row.nombre}</p>
            <span className="hidden">{row.search_blob}</span>
          </div>
        </div>
      ),
    },
    { key: "email", label: "Email", width: "22%" },
    {
      key: "rol",
      label: "Rol",
      width: "16%",
      render: (row) => <Badge variant={row.rol as RolUsuario} size="sm" />,
    },
    {
      key: "activo",
      label: "Estado",
      width: "12%",
      render: (row) => <Badge variant={row.activo ? "activo" : "inactivo"} size="sm" />,
    },
    {
      key: "created_at",
      label: "Desde",
      width: "10%",
      render: (row) => formatDate(String(row.created_at)),
    },
    {
      key: "acciones",
      label: "Acciones",
      width: "16%",
      render: (row) => {
        const isSelf = Boolean(row.isSelf);
        const userName = String(row.nombre);
        const currentRole = row.rol as RolUsuario;
        const isActive = Boolean(row.activo);

        return (
          <div className="space-y-2" onClick={(event) => event.stopPropagation()}>
            <select
              value={currentRole}
              disabled={isSelf || pending}
              className="h-8 w-full rounded-lg border border-[#2e2e2b] bg-[#161614] px-2 text-xs text-[#f0efe9] disabled:opacity-60"
              onChange={(event) => {
                const nuevoRol = event.target.value as RolUsuario;
                if (nuevoRol === currentRole) return;
                setConfirmState({
                  type: "rol",
                  usuarioId: String(row.id),
                  nombre: userName,
                  nuevoRol,
                });
              }}
            >
              <option value="admin">Admin</option>
              <option value="productor">Productor</option>
              <option value="asistente">Asistente</option>
            </select>

            <button
              type="button"
              disabled={isSelf || pending}
              className={`h-8 w-full rounded-lg border px-2 text-xs transition disabled:opacity-60 ${
                isActive
                  ? "border-[#7a3535] bg-[#552525] text-[#f8b1b1] hover:bg-[#6b2d2d]"
                  : "border-[#3d5f49] bg-[#4a7a5a]/20 text-[#98d2ab] hover:bg-[#4a7a5a]/30"
              }`}
              onClick={() => {
                setConfirmState({
                  type: "estado",
                  usuarioId: String(row.id),
                  nombre: userName,
                  activoActual: isActive,
                });
              }}
            >
              {isActive ? "Desactivar" : "Activar"}
            </button>
          </div>
        );
      },
    },
  ];

  const onConfirm = () => {
    if (!confirmState) return;

    startTransition(() => {
      const action =
        confirmState.type === "rol"
          ? updateRolAction(confirmState.usuarioId, confirmState.nuevoRol)
          : toggleUsuarioActivoAction(confirmState.usuarioId);

      action
        .then((result) => {
          if (result.error) {
            toast.error(result.error);
            return;
          }

          toast.success(
            confirmState.type === "rol"
              ? `Rol actualizado para ${confirmState.nombre}`
              : `Estado actualizado para ${confirmState.nombre}`,
          );
          setConfirmState(null);
          router.refresh();
        })
        .catch(() => {
          toast.error("No pudimos completar la accion");
        });
    });
  };

  return (
    <>
      <DataTable columns={columns} data={rows} searchable emptyMessage="No hay usuarios en la organización" />

      <InviteModal open={inviteOpen} onClose={onCloseInvite} />

      <ConfirmDialog
        open={Boolean(confirmState)}
        onClose={() => setConfirmState(null)}
        onConfirm={onConfirm}
        title={confirmState?.type === "rol" ? "Cambiar rol" : confirmState?.activoActual ? "Desactivar usuario" : "Activar usuario"}
        description={
          confirmState?.type === "rol"
            ? `Se actualizará el rol de ${confirmState.nombre} a ${confirmState.nuevoRol}.`
            : confirmState?.activoActual
              ? `Se desactivará el usuario ${confirmState?.nombre}.`
              : `Se activará el usuario ${confirmState?.nombre}.`
        }
        confirmLabel={pending ? "Guardando..." : "Confirmar"}
        variant={confirmState?.type === "estado" && confirmState?.activoActual ? "danger" : "default"}
      />
    </>
  );
}
