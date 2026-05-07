import type { ReactNode } from "react";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-[#272724] bg-[#1a1a18] p-8 text-center">
      {icon ? <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center text-[#9e9d94]">{icon}</div> : null}
      <h3 className="text-lg font-semibold text-[#f0efe9]">{title?.trim() || "Sin resultados"}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm text-[#9e9d94]">{description}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
