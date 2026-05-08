"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

interface SidebarItem {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: number;
}

interface SidebarOrg {
  id: string;
  nombre: string;
}

export interface SidebarProps {
  items: SidebarItem[];
  currentPath: string;
  orgNombre: string;
  userName: string;
  userRol: string;
  orgs?: SidebarOrg[];
  onSwitchOrg?: (orgId: string) => void;
}

export function Sidebar({
  items,
  currentPath,
  orgNombre,
  userName,
  userRol,
  orgs = [],
  onSwitchOrg,
}: SidebarProps) {
  const [nombre = "Usuario", apellido] = userName?.trim().split(/\s+/, 2) ?? [];
  const adminItem =
    userRol === "admin"
      ? items.find((item) => item.href === "/dashboard/admin") ?? {
          label: "Admin",
          href: "/dashboard/admin",
          icon: <Settings className="h-4 w-4" />,
          badge: undefined,
        }
      : null;
  const regularItems = (items ?? []).filter((item) => item.href !== "/dashboard/admin");

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-[#272724] bg-[#161614] p-4">
      <div className="rounded-2xl border border-[#272724] bg-[#1a1a18] p-3">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#6b6a62]">Organizacion</p>
        <p className="mt-1 truncate text-sm font-medium text-[#f0efe9]">{orgNombre?.trim() || "Sin organizacion"}</p>
      </div>

      {orgs.length > 1 ? (
        <div className="mt-3">
          <label className="mb-1 block text-[11px] uppercase tracking-[0.1em] text-[#6b6a62]">Cambiar org</label>
          <select
            className="h-10 w-full rounded-xl border border-[#2e2e2b] bg-[#1a1a18] px-3 text-sm text-[#f0efe9] outline-none ring-[#5b9cf6] focus:ring-2"
            onChange={(event) => onSwitchOrg?.(event.target.value)}
          >
            {orgs.map((org) => (
              <option key={org.id} value={org.id}>
                {org.nombre}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <nav className="mt-6 flex flex-1 flex-col gap-1.5">
        {regularItems.map((item) => {
          const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-10 items-center justify-between rounded-xl px-3 text-sm transition ${
                isActive
                  ? "border border-[#2f5696] bg-[#1a5fcc]/20 text-[#d9e8ff]"
                  : "text-[#9e9d94] hover:bg-[#1a1a18] hover:text-[#f0efe9]"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={item.href === "/dashboard/siniestros" ? "text-amber-400" : "text-current"}>{item.icon}</span>
                <span>{item.label}</span>
              </span>
              {item.badge && item.badge > 0 ? (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#e05555] px-1.5 text-[10px] font-semibold text-white">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}

        {adminItem ? (
          <Link
            href={adminItem.href}
            className={`mt-auto flex h-10 items-center justify-between rounded-xl px-3 text-sm transition ${
              currentPath === adminItem.href || currentPath.startsWith(`${adminItem.href}/`)
                ? "border border-[#2f5696] bg-[#1a5fcc]/20 text-[#d9e8ff]"
                : "text-[#9e9d94] hover:bg-[#1a1a18] hover:text-[#f0efe9]"
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-current">{adminItem.icon}</span>
              <span>{adminItem.label}</span>
            </span>
            {adminItem.badge && adminItem.badge > 0 ? (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#e05555] px-1.5 text-[10px] font-semibold text-white">
                {adminItem.badge}
              </span>
            ) : null}
          </Link>
        ) : null}
      </nav>

      <div className="rounded-2xl border border-[#272724] bg-[#1a1a18] p-3">
        <div className="flex items-center gap-2.5">
          <Avatar nombre={nombre} apellido={apellido} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm text-[#f0efe9]">{userName?.trim() || "Usuario"}</p>
            <p className="truncate text-xs uppercase tracking-[0.08em] text-[#6b6a62]">{userRol || "sin rol"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
