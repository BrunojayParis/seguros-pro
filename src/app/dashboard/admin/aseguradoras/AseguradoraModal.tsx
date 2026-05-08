"use client";

import { useEffect, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createAseguradoraAction, updateAseguradoraAction } from "@/actions/admin";
import { Modal } from "@/components/ui";
import { aseguradoraFormSchema, type AseguradoraFormData } from "@/types/admin";
import type { Tables } from "@/types/database.types";

type AseguradoraModalProps = {
  open: boolean;
  onClose: () => void;
  aseguradora?: Tables<"aseguradoras"> | null;
};

const inputClass =
  "h-10 w-full rounded-lg border border-[#2e2e2b] bg-[#161614] px-3 text-sm text-[#f0efe9] outline-none placeholder:text-[#6b6a62] focus:ring-2 focus:ring-[#2f5696]";

const defaultValues: AseguradoraFormData = {
  nombre: "",
  cuit: "",
  codigo: "",
  contacto: "",
  telefono: "",
  email: "",
};

export function AseguradoraModal({ open, onClose, aseguradora }: AseguradoraModalProps) {
  const [pending, startTransition] = useTransition();
  const { register, handleSubmit, reset } = useForm<AseguradoraFormData>({ defaultValues });

  useEffect(() => {
    if (!open) return;

    if (!aseguradora) {
      reset(defaultValues);
      return;
    }

    reset({
      nombre: aseguradora.nombre ?? "",
      cuit: aseguradora.cuit ?? "",
      codigo: aseguradora.codigo ?? "",
      contacto: aseguradora.contacto ?? "",
      telefono: aseguradora.telefono ?? "",
      email: aseguradora.email ?? "",
    });
  }, [aseguradora, open, reset]);

  const onSubmit = (values: AseguradoraFormData) => {
    const parsed = aseguradoraFormSchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revisa los datos");
      return;
    }

    startTransition(() => {
      const action = aseguradora
        ? updateAseguradoraAction(aseguradora.id, parsed.data)
        : createAseguradoraAction(parsed.data);

      action
        .then((result) => {
          if (result.error) {
            toast.error(result.error);
            return;
          }

          toast.success(aseguradora ? "Aseguradora actualizada" : "Aseguradora creada");
          onClose();
        })
        .catch(() => {
          toast.error("No pudimos guardar la aseguradora");
        });
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={aseguradora ? "Editar aseguradora" : "Nueva aseguradora"}
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
            form="aseguradora-form"
            disabled={pending}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#2f5696] bg-[#1a5fcc] px-3 text-sm text-[#e8f1ff] transition hover:bg-[#2f72d7] disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Guardar
          </button>
        </div>
      }
    >
      <form id="aseguradora-form" className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <input className={inputClass} placeholder="Nombre" {...register("nombre")} />
        <div className="grid gap-3 sm:grid-cols-2">
          <input className={inputClass} placeholder="CUIT" {...register("cuit")} />
          <input className={inputClass} placeholder="Código" {...register("codigo")} />
          <input className={inputClass} placeholder="Contacto" {...register("contacto")} />
          <input className={inputClass} placeholder="Teléfono" {...register("telefono")} />
          <input className={inputClass} type="email" placeholder="Email" {...register("email")} />
        </div>
      </form>
    </Modal>
  );
}
