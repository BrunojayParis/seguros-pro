import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backHref?: string;
}

export function PageHeader({ title, subtitle, actions, backHref }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        {backHref ? (
          <Link
            href={backHref}
            className="mb-2 inline-flex items-center gap-1 text-sm text-[#9e9d94] transition hover:text-[#f0efe9]"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        ) : null}
        <h1 className="text-2xl font-semibold text-[#f0efe9]">{title?.trim() || "-"}</h1>
        {subtitle ? <p className="mt-1 text-sm text-[#6b6a62]">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
