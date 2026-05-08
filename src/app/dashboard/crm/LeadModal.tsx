"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { convertirLeadAClienteAction, createLeadAction, updateLeadAction } from "@/actions/leads";
import { Modal } from "@/components/ui";
import type { Tables } from "@/types/database.types";
import { leadFormSchema, type LeadFormData } from "@/types/leads";
import type { ClienteFormData } from "@/types/clientes";

type LeadModalProps = {
  open: boolean;
  onClose: () => void;
  lead: Tables<"leads"> | null;
};

const inputClass =
  "h-10 w-full rounded-lg border border-[#2e2e2b] bg-[#161614] px-3 text-sm text-[#f0efe9] outline-none placeholder:text-[#6b6a62] focus:ring-2 focus:ring-[#2f5696]";

const defaultValues: LeadFormData = {
  nombre: "",
  telefono: "",
  email: "",
  ramo_interes: undefined,
  etapa: "contactado",
  valor_estimado: undefined,
  origen: undefined,
  proxima_accion: "",
  fecha_proxima: "",
  notas: "",
  perdido_motivo: "",
};

export function LeadModal({ open, onClose, lead }: LeadModalProps) {
  const [pending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [converting, setConverting] = useState(false);
  const { register, handleSubmit, watch, reset } = useForm<LeadFormData>({ defaultValues });

  useEffect(() => {
    if (!open) return;
    setFieldErrors({});

    if (!lead) {
      reset(defaultValues);
      return;
    }

    reset({
      nombre: lead.nombre,
      telefono: lead.telefono ?? "",
      email: lead.email ?? "",
      ramo_interes: lead.ramo_interes ?? undefined,
      etapa: lead.etapa,
      valor_estimado: lead.valor_estimado !== null ? Number(lead.valor_estimado) : undefined,
      origen: (lead.origen as LeadFormData["origen"]) ?? undefined,
      proxima_accion: lead.proxima_accion ?? "",
      fecha_proxima: lead.fecha_proxima ?? "",
      notas: lead.notas ?? "",
      perdido_motivo: lead.perdido_motivo ?? "",
    });
  }, [lead, open, reset]);

  const etapa = watch("etapa");
  const isPerdido = etapa === "perdido" || etapa === "descartado";
  const title = lead ? "Editar lead" : "Nuevo lead";

  const canConvertToCliente = useMemo(() => Boolean(lead && !lead.cliente_id), [lead]);

  const onSubmit = (values: LeadFormData) => {
    setFieldErrors({});
    const parsed = leadFormSchema.safeParse(values);
    if (!parsed.success) {
      const errors = Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]));
      setFieldErrors(errors);
      toast.error(parsed.error.issues[0]?.message ?? "Revisa los datos");
      return;
    }

    startTransition(() => {
      const action = lead ? updateLeadAction(lead.id, parsed.data) : createLeadAction(parsed.data);

      action
        .then((result) => {
          if (result.error) {
            toast.error(result.error);
            return;
          }

          toast.success(lead ? "Lead actualizado" : "Lead creado");
          onClose();
          if (!lead) reset(defaultValues);
        })
        .catch(() => {
          toast.error("No pudimos guardar el lead");
        });
    });
  };

  const handleConvert = () => {
    if (!lead) return;

    setConverting(true);
    const nombreParts = lead.nombre.trim().split(/\s+/);
    const nombre = nombreParts[0] ?? "";
    const apellido = nombreParts.slice(1).join(" ");

    const clienteData: ClienteFormData = {
      tipo_persona: "fisica",
      estado: "activo",
      nombre,
      apellido,
      dni: "",
      fecha_nacimiento: "",
      cuit_cuil: "",
      estado_civil: "",
      razon_social: "",
      cuit_empresa: "",
      email: lead.email ?? "",
      telefono: lead.telefono ?? "",
      domicilio: "",
      localidad: "",
      provincia: "",
      codigo_postal: "",
      notas: lead.notas ?? "",
    };

    convertirLeadAClienteAction(lead.id, clienteData)
      .then((result) => {
        if (result.error) {
          toast.error(result.error);
          return;
        }

        toast.success("Lead convertido en cliente");
        onClose();
      })
      .catch(() => toast.error("No pudimos convertir el lead"))
      .finally(() => setConverting(false));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            {canConvertToCliente ? (
              <button
                type="button"
                onClick={handleConvert}
                disabled={converting}
                className="h-9 rounded-lg border border-[#3d5f49] bg-[#4a7a5a]/20 px-3 text-sm text-[#98d2ab] disabled:opacity-60"
              >
                {converting ? "Convirtiendo..." : "Convertir en cliente"}
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-[#2e2e2b] px-3 text-sm text-[#f0efe9] transition hover:bg-[#1e1e1c]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="lead-form"
              disabled={pending}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#2f5696] bg-[#1a5fcc] px-3 text-sm text-[#e8f1ff] transition hover:bg-[#2f72d7] disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Guardar
            </button>
          </div>
        </div>
      }
    >
      <form id="lead-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className={inputClass} placeholder="Nombre" {...register("nombre")} />
          <input className={inputClass} placeholder="Telefono" {...register("telefono")} />
          <input className={inputClass} placeholder="Email" type="email" {...register("email")} />

          <select className={inputClass} {...register("ramo_interes")}>
            <option value="">Ramo de interes</option>
            <option value="automotor">Automotor</option>
            <option value="vida">Vida</option>
            <option value="accidentes_personales">Accidentes personales</option>
            <option value="hogar">Hogar</option>
            <option value="combinado_familiar">Combinado familiar</option>
            <option value="art">ART</option>
            <option value="otros">Otros</option>
          </select>

          <select className={inputClass} {...register("etapa")}>
            <option value="contactado">Contactado</option>
            <option value="cotizado">Cotizado</option>
            <option value="negociacion">Negociacion</option>
            <option value="ganado">Ganado</option>
            <option value="perdido">Perdido</option>
            <option value="descartado">Descartado</option>
          </select>

          <input
            className={inputClass}
            placeholder="Valor estimado"
            type="number"
            min={0}
            step="0.01"
            {...register("valor_estimado", { setValueAs: (value) => (value === "" ? undefined : Number(value)) })}
          />

          <select className={inputClass} {...register("origen")}>
            <option value="">Origen</option>
            <option value="referido">Referido</option>
            <option value="web">Web</option>
            <option value="red social">Red social</option>
            <option value="propio">Propio</option>
            <option value="otro">Otro</option>
          </select>

          <input className={inputClass} placeholder="Proxima accion" {...register("proxima_accion")} />
          <input className={inputClass} type="date" {...register("fecha_proxima")} />
        </div>

        {isPerdido ? <input className={inputClass} placeholder="Motivo de perdida/archivo" {...register("perdido_motivo")} /> : null}

        <textarea
          className="min-h-24 w-full rounded-lg border border-[#2e2e2b] bg-[#161614] px-3 py-2 text-sm text-[#f0efe9]"
          placeholder="Notas"
          {...register("notas")}
        />

        {Object.keys(fieldErrors).length > 0 ? <p className="text-sm text-[#f49a9a]">{Object.values(fieldErrors)[0]}</p> : null}
      </form>
    </Modal>
  );
}
