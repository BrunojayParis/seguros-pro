"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

export interface DataTableColumn {
  key: string;
  label: string;
  width?: string;
  render?: (row: Record<string, any>) => React.ReactNode;
}

export interface DataTableProps {
  columns: DataTableColumn[];
  data: Record<string, any>[];
  onRowClick?: (row: Record<string, any>) => void;
  loading?: boolean;
  emptyMessage?: string;
  searchable?: boolean;
}

function rowToSearchText(row: Record<string, any>) {
  return Object.values(row)
    .map((value) => {
      if (value === null || value === undefined) return "";
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return String(value);
      }
      return "";
    })
    .join(" ")
    .toLowerCase();
}

export function DataTable({
  columns,
  data,
  onRowClick,
  loading = false,
  emptyMessage = "No hay datos para mostrar",
  searchable = false,
}: DataTableProps) {
  const [query, setQuery] = useState("");

  const safeColumns = columns ?? [];
  const safeData = data ?? [];

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return safeData;
    const lowerQuery = query.toLowerCase();
    return safeData.filter((row) => rowToSearchText(row).includes(lowerQuery));
  }, [query, safeData, searchable]);

  return (
    <div className="space-y-3">
      {searchable ? (
        <label className="flex h-10 items-center gap-2 rounded-xl border border-[#2e2e2b] bg-[#161614] px-3 text-sm text-[#9e9d94]">
          <Search className="h-4 w-4" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar..."
            className="w-full bg-transparent text-[#f0efe9] outline-none placeholder:text-[#6b6a62]"
          />
        </label>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-[#272724] bg-[#1a1a18]">
        <table className="w-full min-w-[640px] table-fixed">
          <thead>
            <tr className="border-b border-[#272724]">
              {safeColumns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.08em] text-[#6b6a62]"
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="border-b border-[#272724] last:border-b-0">
                    {safeColumns.map((column) => (
                      <td key={column.key} className="px-4 py-3">
                        <Skeleton width="80%" height="14px" />
                      </td>
                    ))}
                  </tr>
                ))
              : null}

            {!loading && filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-[#9e9d94]" colSpan={Math.max(safeColumns.length, 1)}>
                  {emptyMessage}
                </td>
              </tr>
            ) : null}

            {!loading
              ? filtered.map((row, rowIndex) => (
                  <tr
                    key={`row-${rowIndex}`}
                    className={`border-b border-[#272724] last:border-b-0 ${onRowClick ? "cursor-pointer hover:bg-[#1e1e1c]" : ""}`}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {safeColumns.map((column) => (
                      <td key={column.key} className="px-4 py-3 text-sm text-[#f0efe9]">
                        {column.render ? column.render(row) : (row[column.key] ?? "-")}
                      </td>
                    ))}
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
