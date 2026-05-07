import Image from "next/image";

export interface AvatarProps {
  nombre: string;
  apellido?: string;
  size?: "sm" | "md" | "lg";
  src?: string;
}

function getInitials(nombre: string, apellido?: string) {
  const n = nombre?.trim().charAt(0) ?? "";
  const a = apellido?.trim().charAt(0) ?? "";
  const initials = `${n}${a}`.trim();
  return (initials || "U").toUpperCase();
}

export function Avatar({ nombre, apellido, size = "md", src }: AvatarProps) {
  const dimensions = size === "sm" ? 24 : size === "lg" ? 48 : 32;
  const initials = getInitials(nombre, apellido);
  const alt = [nombre, apellido].filter(Boolean).join(" ") || "Usuario";

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#2e2e2b] bg-[#1e1e1c] text-[#f0efe9]"
      style={{ width: dimensions, height: dimensions }}
      aria-label={alt}
    >
      {src ? (
        <Image src={src} alt={alt} fill sizes={`${dimensions}px`} className="object-cover" />
      ) : (
        <span className={size === "sm" ? "text-[10px]" : size === "lg" ? "text-base" : "text-xs"}>{initials}</span>
      )}
    </div>
  );
}
