import type { CSSProperties } from "react";

export type BadgeVariant =
  | "vigente"
  | "por_vencer"
  | "vencida"
  | "cancelada"
  | "siniestro"
  | "activo"
  | "inactivo"
  | "prospecto"
  | "baja"
  | "contactado"
  | "cotizado"
  | "negociacion"
  | "ganado"
  | "perdido"
  | "automotor"
  | "vida"
  | "accidentes_personales"
  | "hogar"
  | "art"
  | "otros"
  | "admin"
  | "productor"
  | "asistente";

export interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  size?: "sm" | "md";
}

export const BADGE_LABELS: Record<BadgeVariant, string> = {
  vigente: "Vigente",
  por_vencer: "Por vencer",
  vencida: "Vencida",
  cancelada: "Cancelada",
  siniestro: "Siniestro",
  activo: "Activo",
  inactivo: "Inactivo",
  prospecto: "Prospecto",
  baja: "Baja",
  contactado: "Contactado",
  cotizado: "Cotizado",
  negociacion: "Negociacion",
  ganado: "Ganado",
  perdido: "Perdido",
  automotor: "Automotor",
  vida: "Vida",
  accidentes_personales: "Accidentes personales",
  hogar: "Hogar",
  art: "ART",
  otros: "Otros",
  admin: "Admin",
  productor: "Productor",
  asistente: "Asistente",
};

const BADGE_STYLES: Record<BadgeVariant, CSSProperties> = {
  vigente: { backgroundColor: "rgba(74, 122, 90, 0.2)", color: "#98d2ab", borderColor: "#3d5f49" },
  por_vencer: { backgroundColor: "rgba(212, 160, 23, 0.18)", color: "#f0c963", borderColor: "#7f6521" },
  vencida: { backgroundColor: "rgba(224, 85, 85, 0.2)", color: "#f49a9a", borderColor: "#7a3535" },
  cancelada: { backgroundColor: "rgba(224, 85, 85, 0.2)", color: "#f49a9a", borderColor: "#7a3535" },
  siniestro: { backgroundColor: "rgba(224, 85, 85, 0.2)", color: "#f49a9a", borderColor: "#7a3535" },
  activo: { backgroundColor: "rgba(74, 122, 90, 0.2)", color: "#98d2ab", borderColor: "#3d5f49" },
  inactivo: { backgroundColor: "rgba(107, 106, 98, 0.24)", color: "#c3c2b8", borderColor: "#4a4944" },
  prospecto: { backgroundColor: "rgba(26, 95, 204, 0.2)", color: "#89b8ff", borderColor: "#2f5696" },
  baja: { backgroundColor: "rgba(224, 85, 85, 0.2)", color: "#f49a9a", borderColor: "#7a3535" },
  contactado: { backgroundColor: "rgba(26, 95, 204, 0.2)", color: "#89b8ff", borderColor: "#2f5696" },
  cotizado: { backgroundColor: "rgba(91, 156, 246, 0.2)", color: "#9dc4ff", borderColor: "#456ea8" },
  negociacion: { backgroundColor: "rgba(212, 160, 23, 0.18)", color: "#f0c963", borderColor: "#7f6521" },
  ganado: { backgroundColor: "rgba(74, 122, 90, 0.2)", color: "#98d2ab", borderColor: "#3d5f49" },
  perdido: { backgroundColor: "rgba(224, 85, 85, 0.2)", color: "#f49a9a", borderColor: "#7a3535" },
  automotor: { backgroundColor: "rgba(91, 156, 246, 0.2)", color: "#9dc4ff", borderColor: "#456ea8" },
  vida: { backgroundColor: "rgba(74, 122, 90, 0.2)", color: "#98d2ab", borderColor: "#3d5f49" },
  accidentes_personales: {
    backgroundColor: "rgba(212, 160, 23, 0.18)",
    color: "#f0c963",
    borderColor: "#7f6521",
  },
  hogar: { backgroundColor: "rgba(26, 95, 204, 0.2)", color: "#89b8ff", borderColor: "#2f5696" },
  art: { backgroundColor: "rgba(74, 122, 90, 0.2)", color: "#98d2ab", borderColor: "#3d5f49" },
  otros: { backgroundColor: "rgba(107, 106, 98, 0.24)", color: "#c3c2b8", borderColor: "#4a4944" },
  admin: { backgroundColor: "rgba(224, 85, 85, 0.2)", color: "#f49a9a", borderColor: "#7a3535" },
  productor: { backgroundColor: "rgba(26, 95, 204, 0.2)", color: "#89b8ff", borderColor: "#2f5696" },
  asistente: { backgroundColor: "rgba(107, 106, 98, 0.24)", color: "#c3c2b8", borderColor: "#4a4944" },
};

export function Badge({ variant, label, size = "md" }: BadgeProps) {
  const safeLabel = label?.trim() || BADGE_LABELS[variant] || "-";
  const sizeClass = size === "sm" ? "h-5 px-2 text-[10px]" : "h-6 px-2.5 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium uppercase tracking-[0.04em] ${sizeClass}`}
      style={BADGE_STYLES[variant]}
    >
      {safeLabel}
    </span>
  );
}
