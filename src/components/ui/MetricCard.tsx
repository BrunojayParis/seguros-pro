import type { ReactNode } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";

export interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  icon?: ReactNode;
}

export function MetricCard({ label, value, sub, trend = "neutral", icon }: MetricCardProps) {
  const trendStyles =
    trend === "up"
      ? "text-[#98d2ab]"
      : trend === "down"
        ? "text-[#f49a9a]"
        : "text-[#9e9d94]";

  return (
    <article className="rounded-2xl border border-[#272724] bg-[#1a1a18] p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.1em] text-[#6b6a62]">{label?.trim() || "-"}</p>
        {icon ? <div className="text-[#9e9d94]">{icon}</div> : null}
      </div>
      <p className="mt-2 text-3xl font-semibold text-[#f0efe9]">{value ?? "-"}</p>
      {sub ? (
        <div className={`mt-2 inline-flex items-center gap-1 text-xs ${trendStyles}`}>
          {trend === "up" ? <ArrowUpRight className="h-3.5 w-3.5" /> : null}
          {trend === "down" ? <ArrowDownRight className="h-3.5 w-3.5" /> : null}
          {trend === "neutral" ? <ArrowRight className="h-3.5 w-3.5" /> : null}
          <span>{sub}</span>
        </div>
      ) : null}
    </article>
  );
}
