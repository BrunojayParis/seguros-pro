"use client";

import { useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { createPolizaAction } from "@/actions/polizas";
import type { Tables } from "@/types/database.types";
import { polizaFormSchema, type PolizaFormData } from "@/types/polizas";

type NewPolizaFormProps = {
  clientes: Tables<"clientes">[];
  aseguradoras: Tables<"aseguradoras">[];
};

const inputClass =
  "h-10 w-full rounded-lg border border-[#2e2e2b] bg-[#161614] px-3 text-sm text-[#f0efe9] outline-none placeholder:text-[#6b6a62] focus:ring-2 focus:ring-[#2f5696]";

const ramos = [
  { value: "automotor", label: "Automotor" },
  { value: "vida", label: "Vida" },
  { value: "accidentes_personales", label: "Accidentes personales" },
  { value: "hogar", label: "Hogar" },
  { value: "art", label: "ART" },
] as const;

function nombreCliente(cliente: Tables<"clientes">) {
  if (cliente.tipo_persona === "juridica") return cliente.razon_social || "Cliente";
  return [cliente.nombre, cliente.apellido].filter(Boolean).join(" ") || "Cliente";
}

function RamoFields({
  ramo,
  register,
  control,
}: {
  ramo: PolizaFormData["ramo"];
  register: ReturnType<typeof useForm<PolizaFormData>>["register"];
  control: ReturnType<typeof useForm<PolizaFormData>>["control"];
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "beneficiarios",
  });

  if (ramo === "automotor") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={inputClass} placeholder="Marca" {...register("marca")} />
        <input className={inputClass} placeholder="Modelo" {...register("modelo")} />
        <input className={inputClass} type="number" placeholder="Año" {...register("anio", { valueAsNumber: true })} />
        <input className={inputClass} placeholder="Versión" {...register("version")} />
        <input className={inputClass} placeholder="Patente" {...register("patente")} />
        <input className={inputClass} placeholder="Chasis" {...register("chasis")} />
        <input className={inputClass} placeholder="Motor" {...register("motor")} />
        <input className={inputClass} placeholder="Color" {...register("color")} />
        <input className={inputClass} placeholder="Uso" {...register("uso")} />
        <input className={inputClass} placeholder="Tipo cobertura" {...register("tipo_cobertura")} />
        <input className={inputClass} type="number" placeholder="Valor venal" {...register("valor_venal", { valueAsNumber: true })} />
        <div className="flex items-center gap-4 rounded-lg border border-[#2e2e2b] px-3 py-2">
          <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" {...register("cero_km")} /> Cero KM</label>
          <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" {...register("gnc")} /> GNC</label>
        </div>
      </div>
    );
  }

  if (ramo === "vida") {
    return (
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input className={inputClass} placeholder="Tipo de vida" {...register("tipo_vida")} />
          <input className={inputClass} type="number" placeholder="Capital asegurado" {...register("capital_asegurado", { valueAsNumber: true })} />
          <input className={inputClass} placeholder="Plan" {...register("plan")} />
          <input className={inputClass} type="date" placeholder="Fecha nacimiento" {...register("fecha_nacimiento")} />
          <input className={inputClass} placeholder="Profesión" {...register("profesion")} />
          <label className="inline-flex items-center gap-2 rounded-lg border border-[#2e2e2b] px-3 py-2 text-sm"><input type="checkbox" {...register("fumador")} /> Fumador</label>
        </div>

        <div className="space-y-2 rounded-xl border border-[#272724] p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.08em] text-[#9e9d94]">Beneficiarios</p>
            <button
              type="button"
              onClick={() => append({ nombre: "", dni: "", porcentaje: 0 })}
              className="inline-flex items-center gap-1 text-xs text-[#89b8ff]"
            >
              <Plus className="h-3 w-3" />
              Agregar
            </button>
          </div>

          {fields.length === 0 ? <p className="text-sm text-[#9e9d94]">Sin beneficiarios</p> : null}

          {fields.map((field, index) => (
            <div key={field.id} className="grid gap-2 sm:grid-cols-4">
              <input className={inputClass} placeholder="Nombre" {...register(`beneficiarios.${index}.nombre`)} />
              <input className={inputClass} placeholder="DNI" {...register(`beneficiarios.${index}.dni`)} />
              <input className={inputClass} type="number" placeholder="%" {...register(`beneficiarios.${index}.porcentaje`, { valueAsNumber: true })} />
              <button
                type="button"
                onClick={() => remove(index)}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-[#7a3535] bg-[#552525] text-[#f8b1b1]"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (ramo === "accidentes_personales") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={inputClass} type="number" placeholder="Capital muerte" {...register("capital_muerte", { valueAsNumber: true })} />
        <input className={inputClass} type="number" placeholder="Capital invalidez" {...register("capital_invalidez", { valueAsNumber: true })} />
        <input className={inputClass} type="number" placeholder="Asistencia médica" {...register("asistencia_medica", { valueAsNumber: true })} />
        <input className={inputClass} placeholder="Actividad cubierta" {...register("actividad_cubierta")} />
        <input className={inputClass} placeholder="Horario cobertura" {...register("horario_cobertura")} />
      </div>
    );
  }

  if (ramo === "hogar") {
    return (
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input className={inputClass} placeholder="Tipo bien" {...register("tipo_bien")} />
          <input className={inputClass} placeholder="Domicilio riesgo" {...register("domicilio_riesgo")} />
          <input className={inputClass} type="number" placeholder="Superficie m2" {...register("superficie_m2", { valueAsNumber: true })} />
          <input className={inputClass} placeholder="Tipo construcción" {...register("tipo_construccion")} />
          <input className={inputClass} type="number" placeholder="Capital edificio" {...register("capital_edificio", { valueAsNumber: true })} />
          <input className={inputClass} type="number" placeholder="Capital contenido" {...register("capital_contenido", { valueAsNumber: true })} />
        </div>
        <div className="flex flex-wrap gap-3 rounded-lg border border-[#2e2e2b] px-3 py-2 text-sm">
          <label className="inline-flex items-center gap-2"><input type="checkbox" value="incendio" {...register("coberturas")} /> Incendio</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" value="robo" {...register("coberturas")} /> Robo</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" value="agua" {...register("coberturas")} /> Agua</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" value="granizo" {...register("coberturas")} /> Granizo</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" value="cristales" {...register("coberturas")} /> Cristales</label>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <input className={inputClass} placeholder="Razón social" {...register("razon_social")} />
      <input className={inputClass} placeholder="CUIT empleador" {...register("cuit_empleador")} />
      <input className={inputClass} placeholder="Actividad CIIU" {...register("actividad_ciiu")} />
      <input className={inputClass} type="number" placeholder="Cantidad empleados" {...register("cantidad_empleados", { valueAsNumber: true })} />
      <input className={inputClass} type="number" placeholder="Masa salarial" {...register("masa_salarial", { valueAsNumber: true })} />
      <input className={inputClass} type="number" placeholder="Alícuota" {...register("alicuota", { valueAsNumber: true })} />
    </div>
  );
}

export function NewPolizaForm({ clientes, aseguradoras }: NewPolizaFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { register, control, handleSubmit, watch } = useForm<PolizaFormData>({
    defaultValues: {
      cliente_id: "",
      aseguradora_id: "",
      numero_poliza: "",
      ramo: "automotor",
      fecha_emision: "",
      vigencia_desde: "",
      vigencia_hasta: "",
      prima_neta: 0,
      impuestos: 0,
      periodicidad: "mensual",
      suma_asegurada: undefined,
      notas: "",
      cero_km: false,
      gnc: false,
      fumador: false,
      beneficiarios: [],
      coberturas: [],
    } as PolizaFormData,
  });

  const ramo = watch("ramo");
  const primaNeta = Number(watch("prima_neta") ?? 0);
  const impuestos = Number(watch("impuestos") ?? 0);
  const primaTotal = primaNeta + impuestos;

  const clientesOptions = useMemo(
    () =>
      clientes.map((cliente) => ({
        id: cliente.id,
        nombre: nombreCliente(cliente),
      })),
    [clientes],
  );

  const onSubmit = (values: PolizaFormData) => {
    const parsed = polizaFormSchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revisa los datos");
      return;
    }

    startTransition(() => {
      createPolizaAction(parsed.data)
        .then((result) => {
          if (result.error || !result.data) {
            toast.error(result.error ?? "No pudimos crear la póliza");
            return;
          }

          toast.success("Póliza creada correctamente");
          router.push(`/dashboard/polizas/${result.data.id}`);
        })
        .catch(() => toast.error("No pudimos crear la póliza"));
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <section className="space-y-3 rounded-2xl border border-[#272724] bg-[#1a1a18] p-4">
        <h3 className="text-sm font-semibold text-[#f0efe9]">1. Datos generales</h3>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <input list="clientes-list" className={inputClass} placeholder="Buscar cliente" {...register("cliente_id")} />
            <datalist id="clientes-list">
              {clientesOptions.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
              ))}
            </datalist>
          </div>

          <select className={inputClass} {...register("aseguradora_id")}>
            <option value="">Selecciona aseguradora</option>
            {aseguradoras.map((aseguradora) => (
              <option key={aseguradora.id} value={aseguradora.id}>{aseguradora.nombre}</option>
            ))}
          </select>

          <input className={inputClass} placeholder="Número póliza" {...register("numero_poliza")} />
          <select className={inputClass} {...register("ramo")}>
            {ramos.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>

          <input className={inputClass} type="date" {...register("fecha_emision")} />
          <input className={inputClass} type="date" {...register("vigencia_desde")} />
          <input className={inputClass} type="date" {...register("vigencia_hasta")} />

          <input className={inputClass} type="number" step="0.01" placeholder="Prima neta" {...register("prima_neta", { valueAsNumber: true })} />
          <input className={inputClass} type="number" step="0.01" placeholder="Impuestos" {...register("impuestos", { valueAsNumber: true })} />
          <input className={inputClass} value={primaTotal.toLocaleString("es-AR")} readOnly />

          <select className={inputClass} {...register("periodicidad")}>
            <option value="mensual">Mensual</option>
            <option value="trimestral">Trimestral</option>
            <option value="semestral">Semestral</option>
            <option value="anual">Anual</option>
          </select>

          <input className={inputClass} type="number" placeholder="Suma asegurada" {...register("suma_asegurada", { valueAsNumber: true })} />
        </div>

        <textarea className="min-h-24 w-full rounded-lg border border-[#2e2e2b] bg-[#161614] px-3 py-2 text-sm" placeholder="Notas" {...register("notas")} />
      </section>

      <section className="space-y-3 rounded-2xl border border-[#272724] bg-[#1a1a18] p-4">
        <h3 className="text-sm font-semibold text-[#f0efe9]">2. Datos del ramo</h3>
        <RamoFields key={ramo} ramo={ramo} register={register} control={control} />
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#2f5696] bg-[#1a5fcc] px-4 text-sm text-[#e8f1ff] transition hover:bg-[#2f72d7] disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Crear póliza
        </button>
      </div>
    </form>
  );
}
