import { site } from "@/lib/site";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-display tracking-[0.12em] leading-none ${className}`}
      aria-label={site.name}
    >
      <span className="text-gold">ROCKSTONE</span>{" "}
      <span className="text-muted font-light">IM</span>
    </span>
  );
}
