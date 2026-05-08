"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { softDeleteClienteAction, updateClienteAction } from "@/actions/clientes";
import { ConfirmDialog, Modal } from "@/components/ui";
import type { RolUsuario } from "@/lib/auth/types";
import type { Tables } from "@/types/database.types";
import { clienteFormSchema, type ClienteFormData } from "@/types/clientes";

type EditClienteModalProps = {
  open: boolean;
  onClose: () => void;
  cliente: Tables<"clientes">;
  rol: RolUsuario | null;
};

const inputClass =
  "h-10 w-full rounded-lg border border-[#2e2e2b] bg-[#161614] px-3 text-sm text-[#f0efe9] outline-none placeholder:text-[#6b6a62] focus:ring-2 focus:ring-[#2f5696]";

export function EditClienteModal({ open, onClose, cliente, rol }: EditClienteModalProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const { register, handleSubmit, watch } = useForm<ClienteFormData>({
    defaultValues: {
      tipo_persona: cliente.tipo_persona,
      estado: cliente.estado,
      nombre: cliente.nombre ?? "",
      apellido: cliente.apellido ?? "",
      dni: cliente.dni ?? "",
      fecha_nacimiento: cliente.fecha_nacimiento ?? "",
      cuit_cuil: cliente.cuit_cuil ?? "",
      estado_civil: cliente.estado_civil ?? "",
      razon_social: cliente.razon_social ?? "",
      cuit_empresa: cliente.cuit_empresa ?? "",
      email: cliente.email ?? "",
      telefono: cliente.telefono ?? "",
      domicilio: cliente.domicilio ?? "",
      localidad: cliente.localidad ?? "",
      provincia: cliente.provincia ?? "",
      codigo_postal: cliente.codigo_postal ?? "",
      notas: cliente.notas ?? "",
    },
  });

  const tipoPersona = watch("tipo_persona");

  const onSubmit = (values: ClienteFormData) => {
    setFieldError(null);
    const parsed = clienteFormSchema.safeParse(values);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Revisa los datos";
      setFieldError(message);
      toast.error(message);
      return;
    }

    startTransition(() => {
      updateClienteAction(cliente.id, parsed.data)
        .then((result) => {
          if (result.error) {
            toast.error(result.error);
            return;
          }
          toast.success("Cliente actualizado");
          onClose();
          router.refresh();
        })
        .catch(() => toast.error("No pudimos actualizar"));
    });
  };

  const onDelete = () => {
    startTransition(() => {
      softDeleteClienteAction(cliente.id)
        .then((result) => {
          if (result?.error) {
            toast.error(result.error);
          }
        })
        .catch(() => toast.error("No pudimos dar de baja el cliente"));
    });
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Editar cliente"
        size="lg"
        footer={
          <div className="flex w-full items-center justify-between gap-2">
            {rol === "admin" ? (
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                disabled={pending}
                className="h-9 rounded-lg border border-[#7a3535] bg-[#552525] px-3 text-sm text-[#f8b1b1] disabled:opacity-60"
              >
                Eliminar
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-9 rounded-lg border border-[#2e2e2b] px-3 text-sm text-[#f0efe9] transition hover:bg-[#1e1e1c]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="edit-cliente-form"
                disabled={pending}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#2f5696] bg-[#1a5fcc] px-3 text-sm text-[#e8f1ff] disabled:opacity-60"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Guardar cambios
              </button>
            </div>
          </div>
        }
      >
        <form id="edit-cliente-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.08em] text-[#9e9d94]">Tipo de persona</p>
            <div className="flex gap-2">
              <label className="inline-flex items-center gap-2 rounded-lg border border-[#2e2e2b] px-3 py-2 text-sm">
                <input type="radio" value="fisica" {...register("tipo_persona")} /> Persona fisica
              </label>
              <label className="inline-flex items-center gap-2 rounded-lg border border-[#2e2e2b] px-3 py-2 text-sm">
                <input type="radio" value="juridica" {...register("tipo_persona")} /> Persona juridica
              </label>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {tipoPersona === "fisica" ? (
              <>
                <input className={inputClass} placeholder="Nombre" {...register("nombre")} />
                <input className={inputClass} placeholder="Apellido" {...register("apellido")} />
                <input className={inputClass} placeholder="DNI" {...register("dni")} />
                <input className={inputClass} placeholder="Fecha de nacimiento" type="date" {...register("fecha_nacimiento")} />
                <input className={inputClass} placeholder="CUIT/CUIL" {...register("cuit_cuil")} />
                <input className={inputClass} placeholder="Estado civil" {...register("estado_civil")} />
              </>
            ) : (
              <>
                <input className={inputClass} placeholder="Razon social" {...register("razon_social")} />
                <input className={inputClass} placeholder="CUIT empresa" {...register("cuit_empresa")} />
              </>
            )}

            <input className={inputClass} placeholder="Email" type="email" {...register("email")} />
            <input className={inputClass} placeholder="Telefono" {...register("telefono")} />
            <input className={inputClass} placeholder="Domicilio" {...register("domicilio")} />
            <input className={inputClass} placeholder="Localidad" {...register("localidad")} />
            <input className={inputClass} placeholder="Provincia" {...register("provincia")} />
            <input className={inputClass} placeholder="Codigo postal" {...register("codigo_postal")} />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.08em] text-[#9e9d94]">Estado</label>
            <select className={inputClass} {...register("estado")}>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="prospecto">Prospecto</option>
              <option value="baja">Baja</option>
            </select>
          </div>

          <textarea className="min-h-24 w-full rounded-lg border border-[#2e2e2b] bg-[#161614] px-3 py-2 text-sm" placeholder="Notas" {...register("notas")} />

          {fieldError ? <p className="text-sm text-[#f49a9a]">{fieldError}</p> : null}
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={onDelete}
        title="Eliminar cliente"
        description="Se dara de baja el cliente y se redireccionara al listado."
        variant="danger"
        confirmLabel={pending ? "Eliminando..." : "Eliminar"}
      />
    </>
  );
}
