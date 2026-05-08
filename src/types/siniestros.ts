import type { Enums, Tables } from "@/types/database.types";

export type EstadoSiniestro = Enums<"estado_siniestro">;

export type SiniestroConDetalle = Tables<"siniestros"> & {
  cliente: {
    id: string;
    nombre: string | null;
    apellido: string | null;
    razon_social: string | null;
    telefono: string | null;
    email: string | null;
  } | null;
  poliza: {
    id: string;
    numero_poliza: string;
    ramo: Enums<"ramo_seguro">;
    aseguradora: {
      id: string;
      nombre: string;
    } | null;
  } | null;
};
