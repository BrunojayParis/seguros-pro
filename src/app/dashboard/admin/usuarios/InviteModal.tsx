"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { inviteUsuarioAction } from "@/actions/admin";
import { Modal } from "@/components/ui";
import { inviteUsuarioSchema, type InviteUsuarioData } from "@/types/admin";

type InviteModalProps = {
  open: boolean;
  onClose: () => void;
};

const inputClass =
  "h-10 w-full rounded-lg border border-[#2e2e2b] bg-[#161614] px-3 text-sm text-[#f0efe9] outline-none placeholder:text-[#6b6a62] focus:ring-2 focus:ring-[#2f5696]";

const defaultValues: InviteUsuarioData = {
  email: "",
  nombre: "",
  apellido: "",
  rol: "asistente",
};

export function InviteModal({ open, onClose }: InviteModalProps) {
  const [pending, startTransition] = useTransition();
  const { register, handleSubmit, reset } = useForm<InviteUsuarioData>({ defaultValues });

  const onSubmit = (values: InviteUsuarioData) => {
    const parsed = inviteUsuarioSchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revisa los datos");
      return;
    }

    startTransition(() => {
      inviteUsuarioAction(parsed.data)
        .then((result) => {
          if (result.error) {
            toast.error(result.error);
            return;
          }

          toast.success(`Invitación enviada a ${parsed.data.email.trim().toLowerCase()}`);
          reset(defaultValues);
          onClose();
        })
        .catch(() => {
          toast.error("No pudimos enviar la invitacion");
        });
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invitar usuario"
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
            form="invite-usuario-form"
            disabled={pending}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#2f5696] bg-[#1a5fcc] px-3 text-sm text-[#e8f1ff] transition hover:bg-[#2f72d7] disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Enviar invitación
          </button>
        </div>
      }
    >
      <form id="invite-usuario-form" className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <input className={inputClass} placeholder="Email" type="email" {...register("email")} />
        <div className="grid gap-3 sm:grid-cols-2">
          <input className={inputClass} placeholder="Nombre" {...register("nombre")} />
          <input className={inputClass} placeholder="Apellido" {...register("apellido")} />
        </div>
        <select className={inputClass} {...register("rol")}>
          <option value="admin">Admin</option>
          <option value="productor">Productor</option>
          <option value="asistente">Asistente</option>
        </select>
      </form>
    </Modal>
  );
}
