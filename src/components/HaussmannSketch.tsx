import type { CSSProperties } from "react";

/**
 * HaussmannSketch — a fine-pencil line illustration of a Parisian Haussmann
 * façade that "draws itself" via stroke-dashoffset animation, with a pencil
 * gliding along. Theme-aware (uses currentColor) and reduced-motion safe
 * (animations only apply under prefers-reduced-motion: no-preference).
 */

// helper to attach the per-stroke draw timing
const draw = (delay: number): { "data-draw": true; style: CSSProperties } => ({
  "data-draw": true,
  style: { ["--d" as string]: `${delay.toFixed(2)}s` } as CSSProperties,
});

const COLS = [95, 165, 235, 305];
const WIN_W = 40;
const FLOOR_TOPS = [150, 222, 294, 366]; // top → bottom

function Window({
  x,
  top,
  delay,
  gold = false,
}: {
  x: number;
  top: number;
  delay: number;
  gold?: boolean;
}) {
  const winTop = top + 12;
  const winH = 44;
  const winBottom = winTop + winH;
  return (
    <g className={gold ? "text-gold" : undefined}>
      {/* window frame */}
      <rect x={x} y={winTop} width={WIN_W} height={winH} rx={WIN_W / 2} ry={6} pathLength={1} {...draw(delay)} />
      {/* mullion (vertical bar) */}
      <line x1={x + WIN_W / 2} y1={winTop + 6} x2={x + WIN_W / 2} y2={winBottom - 3} pathLength={1} {...draw(delay + 0.08)} />
      {/* transom (upper cross bar) */}
      <line x1={x + 3} y1={winTop + 16} x2={x + WIN_W - 3} y2={winTop + 16} pathLength={1} {...draw(delay + 0.12)} />
      {/* French balcony railing */}
      <line x1={x - 5} y1={winBottom + 4} x2={x + WIN_W + 5} y2={winBottom + 4} pathLength={1} {...draw(delay + 0.16)} />
      {Array.from({ length: 7 }).map((_, i) => {
        const bx = x - 3 + i * ((WIN_W + 6) / 6);
        return <line key={i} x1={bx} y1={winBottom + 4} x2={bx} y2={winBottom + 14} pathLength={1} {...draw(delay + 0.18 + i * 0.015)} />;
      })}
    </g>
  );
}

export function HaussmannSketch({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 440 580"
      role="img"
      aria-label="Illustration au crayon d'un immeuble haussmannien parisien"
      className={`sketch h-full w-full overflow-visible text-ink/70 [stroke-linecap:round] [stroke-linejoin:round] ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.1}
    >
      <g vectorEffect="non-scaling-stroke">
        {/* ── Ground line ─────────────────────────── */}
        <line x1={20} y1={540} x2={420} y2={540} pathLength={1} {...draw(0.05)} />

        {/* ── Building outline ────────────────────── */}
        <path d="M60 540 V150 M380 540 V150" pathLength={1} {...draw(0.15)} />

        {/* ── Roof: mansard ───────────────────────── */}
        <line x1={52} y1={150} x2={388} y2={150} strokeWidth={1.4} pathLength={1} {...draw(0.3)} />
        <path d="M60 150 L96 86 M380 150 L344 86" pathLength={1} {...draw(0.4)} />
        <line x1={96} y1={86} x2={344} y2={86} pathLength={1} {...draw(0.5)} />
        <line x1={70} y1={78} x2={370} y2={78} strokeWidth={0.8} pathLength={1} {...draw(0.55)} />
        {/* dormer windows (lucarnes) */}
        {[150, 220, 290].map((dx, i) => (
          <path key={i} d={`M${dx} 132 v-22 q0 -8 8 -8 h12 q8 0 8 8 v22`} pathLength={1} {...draw(0.6 + i * 0.06)} />
        ))}
        {/* chimneys */}
        <path d="M130 86 v-16 h14 v16 M300 86 v-20 h12 v20" strokeWidth={0.9} pathLength={1} {...draw(0.8)} />

        {/* ── Floors (top → bottom) ───────────────── */}
        {FLOOR_TOPS.map((top, fi) => {
          const isNoble = fi === 1; // étage noble
          const base = 0.85 + fi * 0.4;
          return (
            <g key={fi}>
              {/* cornice / string course under each floor */}
              <line x1={60} y1={top + 68} x2={380} y2={top + 68} strokeWidth={fi === 0 ? 1.3 : 0.7} pathLength={1} {...draw(base)} />
              {COLS.map((x, ci) => (
                <Window key={ci} x={x} top={top} delay={base + 0.1 + ci * 0.12} gold={isNoble && ci === 1} />
              ))}
              {/* continuous balcony on the étage noble */}
              {isNoble && (
                <line className="text-gold" x1={70} y1={top + 64} x2={370} y2={top + 64} strokeWidth={1.2} pathLength={1} {...draw(base + 0.7)} />
              )}
            </g>
          );
        })}

        {/* ── Ground floor: portal + shopfronts ───── */}
        <path className="text-gold" d="M196 540 V470 q0 -16 16 -16 h16 q16 0 16 16 V540" strokeWidth={1.3} pathLength={1} {...draw(2.45)} />
        <line className="text-gold" x1={220} y1={454} x2={220} y2={540} strokeWidth={0.8} pathLength={1} {...draw(2.55)} />
        <rect x={92} y={474} width={70} height={66} rx={3} pathLength={1} {...draw(2.6)} />
        <rect x={278} y={474} width={70} height={66} rx={3} pathLength={1} {...draw(2.65)} />

        {/* ── The pencil ──────────────────────────── */}
        <g className="pencil text-gold" stroke="none">
          <path d="M0 0 L26 -8 L30 4 L4 12 Z" fill="currentColor" opacity={0.18} />
          <path d="M26 -8 L34 -10 L36 -2 L30 4 Z" fill="currentColor" />
          <path d="M34 -10 L40 -11 L41 -6 L36 -2 Z" fill="var(--color-ink)" opacity={0.5} />
          <circle cx={2} cy={6} r={1.6} fill="currentColor" />
        </g>
      </g>
    </svg>
  );
}
