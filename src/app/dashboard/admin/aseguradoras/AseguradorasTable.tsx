"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { toggleAseguradoraActivaAction } from "@/actions/admin";
import { Badge, ConfirmDialog, DataTable, type DataTableColumn } from "@/components/ui";
import type { Tables } from "@/types/database.types";
import type { RolUsuario } from "@/types/admin";
import { AseguradoraModal } from "./AseguradoraModal";

type AseguradorasTableProps = {
  aseguradoras: Tables<"aseguradoras">[];
  rol: RolUsuario | null;
};

export function AseguradorasTable({ aseguradoras }: AseguradorasTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Tables<"aseguradoras"> | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Tables<"aseguradoras"> | null>(null);

  useEffect(() => {
    if (searchParams.get("nueva") === "1") {
      setCreateOpen(true);
    }
  }, [searchParams]);

  const rows = useMemo(
    () =>
      aseguradoras.map((aseguradora) => ({
        id: aseguradora.id,
        nombre: aseguradora.nombre,
        cuit: aseguradora.cuit ?? "-",
        codigo: aseguradora.codigo ?? "-",
        email: aseguradora.email ?? "-",
        telefono: aseguradora.telefono ?? "-",
        activo: aseguradora.activo,
        aseguradora,
        search_blob: `${aseguradora.nombre} ${aseguradora.cuit ?? ""} ${aseguradora.codigo ?? ""}`,
      })),
    [aseguradoras],
  );

  const columns: DataTableColumn[] = [
    {
      key: "nombre",
      label: "Nombre",
      width: "22%",
      render: (row) => (
        <div>
          <span className="font-medium text-[#f0efe9]">{row.nombre}</span>
          <span className="hidden">{row.search_blob}</span>
        </div>
      ),
    },
    { key: "cuit", label: "CUIT", width: "14%" },
    { key: "codigo", label: "Código", width: "12%" },
    { key: "email", label: "Email", width: "18%" },
    { key: "telefono", label: "Teléfono", width: "12%" },
    {
      key: "activo",
      label: "Estado",
      width: "10%",
      render: (row) => <Badge variant={row.activo ? "activo" : "inactivo"} size="sm" />,
    },
    {
      key: "acciones",
      label: "Acciones",
      width: "12%",
      render: (row) => {
        const aseguradora = row.aseguradora as Tables<"aseguradoras">;
        return (
          <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="rounded-lg border border-[#2e2e2b] px-2 py-1 text-xs text-[#c3c2b8] transition hover:bg-[#1e1e1c]"
              onClick={() => setEditing(aseguradora)}
            >
              Editar
            </button>
            <button
              type="button"
              disabled={pending}
              className={`rounded-lg border px-2 py-1 text-xs transition disabled:opacity-60 ${
                aseguradora.activo
                  ? "border-[#7a3535] bg-[#552525] text-[#f8b1b1] hover:bg-[#6b2d2d]"
                  : "border-[#3d5f49] bg-[#4a7a5a]/20 text-[#98d2ab] hover:bg-[#4a7a5a]/30"
              }`}
              onClick={() => setToggleTarget(aseguradora)}
            >
              {aseguradora.activo ? "Desactivar" : "Activar"}
            </button>
          </div>
        );
      },
    },
  ];

  const closeCreateModal = () => {
    setCreateOpen(false);
    if (searchParams.get("nueva") === "1") {
      router.replace(pathname, { scroll: false });
    }
  };

  const onConfirmToggle = () => {
    if (!toggleTarget) return;

    startTransition(() => {
      toggleAseguradoraActivaAction(toggleTarget.id)
        .then((result) => {
          if (result.error) {
            toast.error(result.error);
            return;
          }

          toast.success("Estado de aseguradora actualizado");
          setToggleTarget(null);
          router.refresh();
        })
        .catch(() => {
          toast.error("No pudimos actualizar el estado");
        });
    });
  };

  return (
    <>
      <DataTable columns={columns} data={rows} searchable emptyMessage="No hay aseguradoras registradas" />

      <AseguradoraModal open={createOpen} onClose={closeCreateModal} />
      <AseguradoraModal open={Boolean(editing)} onClose={() => setEditing(null)} aseguradora={editing} />

      <ConfirmDialog
        open={Boolean(toggleTarget)}
        onClose={() => setToggleTarget(null)}
        onConfirm={onConfirmToggle}
        title={toggleTarget?.activo ? "Desactivar aseguradora" : "Activar aseguradora"}
        description={
          toggleTarget?.activo
            ? `Se desactivará ${toggleTarget?.nombre}.`
            : `Se activará ${toggleTarget?.nombre}.`
        }
        confirmLabel={pending ? "Guardando..." : "Confirmar"}
        variant={toggleTarget?.activo ? "danger" : "default"}
      />
    </>
  );
}
