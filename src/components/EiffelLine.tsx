"use client";

import { useEffect, useRef } from "react";

/**
 * EiffelLine — a restrained, luxury line study of the Eiffel Tower drawn with
 * its true concave silhouette, in a single confident gold line, with sparse
 * hatching for volume and generous negative space. A fine nib traces the line.
 *
 * Slow, contemplative self-draw on an infinite loop (Web Animations API).
 * Static (nib hidden) under prefers-reduced-motion. Clean curves — no
 * displacement filter — for a crisp, refined feel.
 */

const DRAW = 1.2; // per-stroke draw time (slow, elegant)
const HOLD = 2.6;
const FADE = 1.1;

type DrawAttrs = { "data-delay": number; pathLength: 1 };
const s = (delay: number): DrawAttrs => ({ "data-delay": delay, pathLength: 1 });

export function EiffelLine({ className = "" }: { className?: string }) {
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
    const cycle = lastEnd + HOLD + FADE;
    const fadeStart = (lastEnd + HOLD) / cycle;
    const anims: Animation[] = [];

    els.forEach((el, i) => {
      el.style.strokeDasharray = "1";
      const d = delays[i];
      anims.push(
        el.animate(
          [
            { strokeDashoffset: 1, opacity: 1, offset: 0 },
            { strokeDashoffset: 1, opacity: 1, offset: d / cycle },
            { strokeDashoffset: 0, opacity: 1, offset: Math.min((d + DRAW) / cycle, fadeStart) },
            { strokeDashoffset: 0, opacity: 1, offset: fadeStart },
            { strokeDashoffset: 0, opacity: 0, offset: 1 },
          ],
          { duration: cycle * 1000, iterations: Infinity, easing: "ease-in-out" }
        )
      );
    });

    const nib = svg.querySelector<SVGGElement>(".nib");
    if (nib) {
      const at = (t: number) => t / cycle;
      anims.push(
        nib.animate(
          [
            { transform: "translate(310px, 478px)", opacity: 0, offset: 0 },
            { opacity: 1, offset: 0.04 },
            { transform: "translate(262px, 388px)", opacity: 1, offset: at(0.5) },
            { transform: "translate(224px, 300px)", opacity: 1, offset: at(0.8) },
            { transform: "translate(196px, 150px)", opacity: 1, offset: at(1.05) },
            { transform: "translate(180px, 60px)", opacity: 1, offset: at(1.25) },
            { transform: "translate(180px, 58px)", opacity: 0, offset: fadeStart },
            { transform: "translate(310px, 478px)", opacity: 0, offset: 1 },
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
      viewBox="0 0 360 520"
      role="img"
      aria-label="Étude au trait de la Tour Eiffel qui se dessine"
      className={`h-full w-full overflow-visible [stroke-linecap:round] [stroke-linejoin:round] ${className}`}
      fill="none"
    >
      {/* ── Silhouette: two mirrored concave edges (the true Eiffel curve) ── */}
      <g className="text-gold" stroke="currentColor" strokeWidth={1.7}>
        <path
          d="M310 478 C 300 436, 276 408, 262 388 C 246 358, 232 330, 224 300 C 214 248, 201 196, 196 150 C 193 118, 190 96, 188 90 L 180 60"
          {...s(0.1)}
        />
        <path
          d="M50 478 C 60 436, 84 408, 98 388 C 114 358, 128 330, 136 300 C 146 248, 159 196, 164 150 C 167 118, 170 96, 172 90 L 180 60"
          {...s(0.1)}
        />
      </g>

      {/* ── Inner girders (subtle vertical structure) ── */}
      <g className="text-ink/30" stroke="currentColor" strokeWidth={0.6}>
        <path d="M168 478 C 170 360, 176 220, 180 90" {...s(0.5)} />
        <path d="M192 478 C 190 360, 184 220, 180 90" {...s(0.55)} />
      </g>

      {/* ── Platforms (varied weight) ── */}
      <g stroke="currentColor">
        <g className="text-ink">
          <line x1={96} y1={388} x2={264} y2={388} strokeWidth={1.6} {...s(1.3)} />
          <line x1={104} y1={394} x2={256} y2={394} strokeWidth={0.6} {...s(1.4)} />
          <line x1={134} y1={300} x2={226} y2={300} strokeWidth={1.4} {...s(1.55)} />
          <line x1={140} y1={305} x2={220} y2={305} strokeWidth={0.5} {...s(1.62)} />
          <line x1={163} y1={150} x2={197} y2={150} strokeWidth={1.2} {...s(1.75)} />
        </g>
      </g>

      {/* ── The great arch (gold, the signature of the base) ── */}
      <g className="text-gold" stroke="currentColor">
        <path d="M118 478 C 138 402, 222 402, 242 478" strokeWidth={1.3} {...s(1.95)} />
        <path d="M134 478 C 150 420, 210 420, 226 478" strokeWidth={0.7} {...s(2.05)} />
      </g>

      {/* ── Sparse hatching for volume (lower legs + shaft) ── */}
      <g className="text-ink/25" stroke="currentColor" strokeWidth={0.45}>
        {/* lower-left leg */}
        {[0.2, 0.45, 0.7].map((t, i) => (
          <line key={`ll${i}`} x1={70 + t * 24} y1={470 - t * 70} x2={92 + t * 24} y2={476 - t * 70} {...s(2.2 + i * 0.08)} />
        ))}
        {/* lower-right leg */}
        {[0.2, 0.45, 0.7].map((t, i) => (
          <line key={`lr${i}`} x1={268 - t * 24} y1={470 - t * 70} x2={290 - t * 24} y2={476 - t * 70} {...s(2.2 + i * 0.08)} />
        ))}
        {/* slender shaft cross-hatch between 2nd and 3rd platforms */}
        {[0, 1, 2, 3].map((i) => {
          const t0 = i / 4;
          const t1 = (i + 1) / 4;
          const y0 = 300 - t0 * 150;
          const y1v = 300 - t1 * 150;
          const h0 = 44 - t0 * 28;
          const h1 = 44 - t1 * 28;
          return (
            <g key={`sh${i}`}>
              <line x1={180 - h0 / 2} y1={y0} x2={180 + h1 / 2} y2={y1v} {...s(2.45 + i * 0.06)} />
              <line x1={180 + h0 / 2} y1={y0} x2={180 - h1 / 2} y2={y1v} {...s(2.48 + i * 0.06)} />
            </g>
          );
        })}
      </g>

      {/* ── Summit + antenna ── */}
      <g className="text-gold" stroke="currentColor">
        <line x1={180} y1={90} x2={180} y2={48} strokeWidth={1} {...s(2.75)} />
        <circle cx={180} cy={44} r={2.4} fill="currentColor" stroke="none" {...s(2.85)} />
      </g>

      {/* ── Fine nib that traces the line ── */}
      <g className="nib text-gold" stroke="none">
        <path d="M0 0 L16 -5 L18 2 L3 8 Z" fill="currentColor" opacity={0.2} />
        <path d="M16 -5 L23 -6 L24 0 L18 2 Z" fill="currentColor" />
        <circle cx={1.5} cy={4} r={1.4} fill="currentColor" />
      </g>
    </svg>
  );
}
