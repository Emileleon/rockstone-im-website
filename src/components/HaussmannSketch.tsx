"use client";

import { useEffect, useRef } from "react";

/**
 * HaussmannSketch — a fine-pencil, architect-style line drawing of a Parisian
 * Haussmann façade that draws itself on an infinite loop: construction guides
 * first, then the building stroke by stroke while a pencil glides along, a
 * pause on the finished drawing, a soft fade, and it starts over.
 *
 * Hand-drawn feel comes from an SVG turbulence/displacement filter.
 * Orchestrated with the Web Animations API; fully static (and pencil hidden)
 * under prefers-reduced-motion.
 */

const COLS = [95, 165, 235, 305];
const WIN_W = 40;
const FLOOR_TOPS = [150, 222, 294, 366]; // top → bottom

// timing (seconds)
const DRAW = 0.9; // per-stroke draw time
const HOLD = 1.7; // pause on the finished drawing
const FADE = 0.8; // fade-out before redraw

type DrawAttrs = { "data-delay": number; pathLength: 1 };
const s = (delay: number): DrawAttrs => ({ "data-delay": delay, pathLength: 1 });

function Window({ x, top, delay, gold = false }: { x: number; top: number; delay: number; gold?: boolean }) {
  const winTop = top + 12;
  const winH = 44;
  const winBottom = winTop + winH;
  return (
    <g className={gold ? "text-gold" : undefined}>
      <rect x={x} y={winTop} width={WIN_W} height={winH} rx={WIN_W / 2} ry={6} {...s(delay)} />
      <line x1={x + WIN_W / 2} y1={winTop + 6} x2={x + WIN_W / 2} y2={winBottom - 3} {...s(delay + 0.08)} />
      <line x1={x + 3} y1={winTop + 16} x2={x + WIN_W - 3} y2={winTop + 16} {...s(delay + 0.12)} />
      <line x1={x - 5} y1={winBottom + 4} x2={x + WIN_W + 5} y2={winBottom + 4} {...s(delay + 0.16)} />
      {Array.from({ length: 7 }).map((_, i) => {
        const bx = x - 3 + i * ((WIN_W + 6) / 6);
        return <line key={i} x1={bx} y1={winBottom + 4} x2={bx} y2={winBottom + 14} {...s(delay + 0.18 + i * 0.015)} />;
      })}
    </g>
  );
}

export function HaussmannSketch({ className = "" }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const els = Array.from(svg.querySelectorAll<SVGElement>("[data-delay]"));
    if (els.length === 0) return;

    const delays = els.map((el) => parseFloat(el.dataset.delay || "0"));
    const maxDelay = Math.max(...delays);
    const lastEnd = maxDelay + DRAW;
    const cycle = lastEnd + HOLD + FADE; // seconds
    const fadeStart = (lastEnd + HOLD) / cycle;

    const anims: Animation[] = [];

    els.forEach((el, i) => {
      el.style.strokeDasharray = "1";
      const d = delays[i];
      const start = d / cycle;
      const end = (d + DRAW) / cycle;
      anims.push(
        el.animate(
          [
            { strokeDashoffset: 1, opacity: 1, offset: 0 },
            { strokeDashoffset: 1, opacity: 1, offset: start },
            { strokeDashoffset: 0, opacity: 1, offset: Math.min(end, fadeStart) },
            { strokeDashoffset: 0, opacity: 1, offset: fadeStart },
            { strokeDashoffset: 0, opacity: 0, offset: 1 },
          ],
          { duration: cycle * 1000, iterations: Infinity, easing: "ease-in-out" }
        )
      );
    });

    // Pencil glides while the building is being drawn, then fades during the hold.
    const pencil = svg.querySelector<SVGGElement>(".pencil");
    if (pencil) {
      const at = (t: number) => t / cycle;
      anims.push(
        pencil.animate(
          [
            { transform: "translate(40px, 470px)", opacity: 0, offset: 0 },
            { opacity: 1, offset: 0.04 },
            { transform: "translate(330px, 95px)", opacity: 1, offset: at(lastEnd * 0.3) },
            { transform: "translate(95px, 250px)", opacity: 1, offset: at(lastEnd * 0.6) },
            { transform: "translate(320px, 460px)", opacity: 1, offset: at(lastEnd) },
            { transform: "translate(210px, 505px)", opacity: 0, offset: fadeStart },
            { transform: "translate(40px, 470px)", opacity: 0, offset: 1 },
          ],
          { duration: cycle * 1000, iterations: Infinity, easing: "ease-in-out" }
        )
      );
    }

    return () => anims.forEach((a) => a.cancel());
  }, []);

  return (
    <svg
      ref={ref}
      viewBox="0 0 440 580"
      role="img"
      aria-label="Illustration au crayon d'un immeuble haussmannien parisien qui se dessine"
      className={`sketch h-full w-full overflow-visible text-ink [stroke-linecap:round] [stroke-linejoin:round] ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.1}
    >
      <defs>
        {/* Hand-drawn wobble */}
        <filter id="rs-pencil-filter" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={7} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      <g filter="url(#rs-pencil-filter)" vectorEffect="non-scaling-stroke">
        {/* ── Construction guides (architect under-drawing) ── */}
        <g className="text-ink/25" strokeWidth={0.5}>
          <line x1={220} y1={70} x2={220} y2={545} {...s(0)} />
          <line x1={40} y1={150} x2={400} y2={150} {...s(0.05)} />
          <path d="M60 540 L380 150 M380 540 L60 150" {...s(0.1)} />
        </g>

        {/* ── Ground line ─────────────────────────── */}
        <line x1={20} y1={540} x2={420} y2={540} {...s(0.2)} />

        {/* ── Building outline ────────────────────── */}
        <path d="M60 540 V150 M380 540 V150" {...s(0.35)} />

        {/* ── Roof: mansard ───────────────────────── */}
        <line x1={52} y1={150} x2={388} y2={150} strokeWidth={1.4} {...s(0.5)} />
        <path d="M60 150 L96 86 M380 150 L344 86" {...s(0.6)} />
        <line x1={96} y1={86} x2={344} y2={86} {...s(0.7)} />
        <line x1={70} y1={78} x2={370} y2={78} strokeWidth={0.8} {...s(0.78)} />
        {[150, 220, 290].map((dx, i) => (
          <path key={i} d={`M${dx} 132 v-22 q0 -8 8 -8 h12 q8 0 8 8 v22`} {...s(0.85 + i * 0.06)} />
        ))}
        <path d="M130 86 v-16 h14 v16 M300 86 v-20 h12 v20" strokeWidth={0.9} {...s(1.05)} />

        {/* ── Floors (top → bottom) ───────────────── */}
        {FLOOR_TOPS.map((top, fi) => {
          const isNoble = fi === 1;
          const base = 1.1 + fi * 0.42;
          return (
            <g key={fi}>
              <line x1={60} y1={top + 68} x2={380} y2={top + 68} strokeWidth={fi === 0 ? 1.3 : 0.7} {...s(base)} />
              {COLS.map((x, ci) => (
                <Window key={ci} x={x} top={top} delay={base + 0.1 + ci * 0.12} gold={isNoble && ci === 1} />
              ))}
              {isNoble && (
                <line className="text-gold" x1={70} y1={top + 64} x2={370} y2={top + 64} strokeWidth={1.2} {...s(base + 0.7)} />
              )}
            </g>
          );
        })}

        {/* ── Ground floor: portal + shopfronts ───── */}
        <path className="text-gold" d="M196 540 V470 q0 -16 16 -16 h16 q16 0 16 16 V540" strokeWidth={1.3} {...s(2.85)} />
        <line className="text-gold" x1={220} y1={454} x2={220} y2={540} strokeWidth={0.8} {...s(2.95)} />
        <rect x={92} y={474} width={70} height={66} rx={3} {...s(3.0)} />
        <rect x={278} y={474} width={70} height={66} rx={3} {...s(3.05)} />

        {/* ── The pencil ──────────────────────────── */}
        <g className="pencil text-gold" stroke="none">
          <path d="M0 0 L26 -8 L30 4 L4 12 Z" fill="currentColor" opacity={0.18} />
          <path d="M26 -8 L34 -10 L36 -2 L30 4 Z" fill="currentColor" />
          <path d="M34 -10 L40 -11 L41 -6 L36 -2 Z" fill="var(--color-ink)" opacity={0.5} />
          <circle cx={2} cy={6} r={1.8} fill="currentColor" />
        </g>
      </g>
    </svg>
  );
}
