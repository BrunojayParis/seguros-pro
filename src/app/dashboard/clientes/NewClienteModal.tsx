"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createClienteAction } from "@/actions/clientes";
import { Modal } from "@/components/ui";
import { clienteFormSchema, type ClienteFormData } from "@/types/clientes";

type NewClienteModalProps = {
  open: boolean;
  onClose: () => void;
};

const inputClass =
  "h-10 w-full rounded-lg border border-[#2e2e2b] bg-[#161614] px-3 text-sm text-[#f0efe9] outline-none placeholder:text-[#6b6a62] focus:ring-2 focus:ring-[#2f5696]";

export function NewClienteModal({ open, onClose }: NewClienteModalProps) {
  const [pending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { register, handleSubmit, watch, reset } = useForm<ClienteFormData>({
    defaultValues: {
      tipo_persona: "fisica",
      estado: "activo",
      nombre: "",
      apellido: "",
      dni: "",
      fecha_nacimiento: "",
      cuit_cuil: "",
      estado_civil: "",
      razon_social: "",
      cuit_empresa: "",
      email: "",
      telefono: "",
      domicilio: "",
      localidad: "",
      provincia: "",
      codigo_postal: "",
      notas: "",
    },
  });

  const tipoPersona = watch("tipo_persona");

  const onSubmit = (values: ClienteFormData) => {
    setFieldErrors({});
    const parsed = clienteFormSchema.safeParse(values);
    if (!parsed.success) {
      const errors = Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]));
      setFieldErrors(errors);
      toast.error(parsed.error.issues[0]?.message ?? "Revisa los datos");
      return;
    }

    startTransition(() => {
      createClienteAction(parsed.data)
        .then((result) => {
          if (result.error) {
            toast.error(result.error);
            return;
          }

          toast.success("Cliente creado correctamente");
          reset();
          onClose();
        })
        .catch(() => {
          toast.error("No pudimos crear el cliente");
        });
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo cliente"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-[#2e2e2b] px-3 text-sm text-[#f0efe9] transition hover:bg-[#1e1e1c]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="new-cliente-form"
            disabled={pending}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#2f5696] bg-[#1a5fcc] px-3 text-sm text-[#e8f1ff] transition hover:bg-[#2f72d7] disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Guardar
          </button>
        </div>
      }
    >
      <form id="new-cliente-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
          </select>
        </div>

        <textarea className="min-h-24 w-full rounded-lg border border-[#2e2e2b] bg-[#161614] px-3 py-2 text-sm" placeholder="Notas" {...register("notas")} />

        {Object.keys(fieldErrors).length > 0 ? <p className="text-sm text-[#f49a9a]">{Object.values(fieldErrors)[0]}</p> : null}
      </form>
    </Modal>
  );
}
