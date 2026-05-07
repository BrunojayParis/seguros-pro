export interface SkeletonProps {
  width?: string;
  height?: string;
  rounded?: boolean;
}

export function Skeleton({ width = "100%", height = "1rem", rounded = true }: SkeletonProps) {
  return (
    <span
      className={`block animate-pulse bg-[#272724] ${rounded ? "rounded-md" : "rounded-none"}`}
      style={{ width, height }}
      aria-hidden
    />
  );
}
