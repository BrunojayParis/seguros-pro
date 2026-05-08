"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateSiniestroEstadoAction } from "@/actions/siniestros";
import type { EstadoSiniestro } from "@/types/siniestros";

type UpdateEstadoFormProps = {
  siniestroId: string;
  estadoActual: EstadoSiniestro;
  observacion: string;
  onObservacionChange: (value: string) => void;
  onUpdated: (nextEstado: EstadoSiniestro, observaciones: string) => void;
};

const NEXT_STATES: Record<EstadoSiniestro, EstadoSiniestro[]> = {
  denunciado: ["en_instruccion"],
  en_instruccion: ["periciado"],
  periciado: ["aprobado", "rechazado"],
  aprobado: ["pagado"],
  rechazado: ["cerrado"],
  pagado: ["cerrado"],
  cerrado: [],
};

function estadoLabel(estado: EstadoSiniestro) {
  if (estado === "en_instruccion") return "En instruccion";
  return estado.charAt(0).toUpperCase() + estado.slice(1);
}

export function UpdateEstadoForm({
  siniestroId,
  estadoActual,
  observacion,
  onObservacionChange,
  onUpdated,
}: UpdateEstadoFormProps) {
  const [selected, setSelected] = useState<EstadoSiniestro | "">("");
  const [pending, startTransition] = useTransition();

  const options = useMemo(() => NEXT_STATES[estadoActual], [estadoActual]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) {
      toast.error("Selecciona el proximo estado");
      return;
    }

    startTransition(() => {
      updateSiniestroEstadoAction(siniestroId, selected, observacion)
        .then((result) => {
          if (result.error) {
            toast.error(result.error);
            return;
          }
          toast.success("Estado actualizado");
          onUpdated(selected, observacion);
          setSelected("");
        })
        .catch(() => toast.error("No pudimos actualizar el estado"));
    });
  };

  if (!options.length) {
    return <p className="text-sm text-[#9e9d94]">No hay transiciones disponibles para este estado.</p>;
  }

  return (
    <form className="space-y-2" onSubmit={onSubmit}>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={selected}
          onChange={(event) => setSelected(event.target.value as EstadoSiniestro)}
          className="h-9 rounded-lg border border-[#2e2e2b] bg-[#161614] px-3 text-sm text-[#f0efe9]"
        >
          <option value="">Actualizar estado</option>
          {options.map((item) => (
            <option key={item} value={item}>
              {estadoLabel(item)}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={pending || !selected}
          className="h-9 rounded-lg border border-[#2f5696] bg-[#1a5fcc] px-3 text-sm text-[#e8f1ff] disabled:opacity-60"
        >
          Confirmar
        </button>
      </div>

      <textarea
        value={observacion}
        onChange={(event) => onObservacionChange(event.target.value)}
        placeholder="Observacion (opcional)"
        className="min-h-20 w-full rounded-lg border border-[#2e2e2b] bg-[#161614] px-3 py-2 text-sm text-[#f0efe9]"
      />
    </form>
  );
}
