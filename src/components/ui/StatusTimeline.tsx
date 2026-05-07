interface StatusTimelineItem {
  label: string;
  date?: string;
  variant?: "default" | "success" | "warning" | "danger";
  active?: boolean;
}

export interface StatusTimelineProps {
  items: StatusTimelineItem[];
}

const DOT_COLORS: Record<NonNullable<StatusTimelineItem["variant"]>, string> = {
  default: "#6b6a62",
  success: "#4a7a5a",
  warning: "#d4a017",
  danger: "#e05555",
};

export function StatusTimeline({ items }: StatusTimelineProps) {
  const safeItems = items ?? [];

  if (!safeItems.length) {
    return <p className="text-sm text-[#9e9d94]">Sin actividad registrada.</p>;
  }

  return (
    <ol className="space-y-4">
      {safeItems.map((item, index) => {
        const variant = item.variant ?? "default";
        const isLast = index === safeItems.length - 1;

        return (
          <li key={`${item.label}-${index}`} className="relative flex gap-3">
            <div className="relative flex w-4 justify-center">
              <span
                className="mt-1 block h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: DOT_COLORS[variant],
                  boxShadow: item.active ? `0 0 0 3px rgba(17, 17, 16, 1), 0 0 0 5px ${DOT_COLORS[variant]}` : undefined,
                }}
              />
              {!isLast ? <span className="absolute top-4 h-full w-px bg-[#2e2e2b]" aria-hidden /> : null}
            </div>
            <div className="pb-3">
              <p className={`text-sm ${item.active ? "text-[#f0efe9]" : "text-[#9e9d94]"}`}>{item.label || "-"}</p>
              {item.date ? <p className="text-xs text-[#6b6a62]">{item.date}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
