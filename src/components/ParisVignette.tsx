"use client";

import { useEffect, useRef } from "react";

/**
 * ParisVignette — an ink vignette: a richly detailed Haussmann façade in the
 * foreground (mansard roof, dormers, chimneys, modillion cornice, string
 * courses, wrought-iron balconies on the 2nd "étage noble" and 5th floors,
 * pedimented windows, rusticated ground floor with a portal), and the Eiffel
 * Tower rising in the sky to the right. Loose ink (turbulence filter), volume
 * via sparse hatching. Self-draws on a loop (WAAPI); static under reduced motion.
 */

const DRAW = 0.55;
const HOLD = 2.0;
const FADE = 1.0;

type DrawAttrs = { "data-delay": number; pathLength: 1 };
const s = (delay: number): DrawAttrs => ({ "data-delay": delay, pathLength: 1 });
const jit = (a: number, b: number) => {
  const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return (v - Math.floor(v) - 0.5) * 2.2;
};

// façade frame
const FX = { l: 70, r: 430, base: 560, eave: 120, ridge: 86 };
const COLS = [96, 162, 228, 294, 358]; // window x (5 bays)
const WW = 38;
const FLOORS = [140, 216, 296, 378, 458]; // window-band tops, top → bottom
const WH = 50;

function Window({ x, top, delay, pediment }: { x: number; top: number; delay: number; pediment?: boolean }) {
  const wb = top + WH;
  const j = (n: number) => jit(x + top, n);
  return (
    <g>
      <path
        d={`M${x + j(1)} ${top + j(2)} L${x + WW + j(3)} ${top + j(4)} L${x + WW + j(5)} ${wb + j(6)} L${x + j(7)} ${wb + j(8)} Z`}
        {...s(delay)}
      />
      <line x1={x + WW / 2} y1={top + 6} x2={x + WW / 2} y2={wb - 3} strokeWidth={0.6} className="text-ink/70" {...s(delay + 0.06)} />
      <line x1={x + 3} y1={top + 16} x2={x + WW - 3} y2={top + 16} strokeWidth={0.6} className="text-ink/70" {...s(delay + 0.1)} />
      {/* sill / appui moulding */}
      <line x1={x - 4} y1={wb + 4} x2={x + WW + 4} y2={wb + 4} strokeWidth={1} {...s(delay + 0.14)} />
      {pediment && (
        <path d={`M${x - 3} ${top - 3} q${WW / 2 + 3} -13 ${WW + 6} 0`} strokeWidth={1} className="text-gold" {...s(delay + 0.18)} />
      )}
    </g>
  );
}

function Balcony({ y, delay }: { y: number; delay: number }) {
  const n = Math.round((FX.r - FX.l) / 13);
  return (
    <g className="text-gold">
      <line x1={FX.l + 6} y1={y} x2={FX.r - 6} y2={y} strokeWidth={1.2} {...s(delay)} />
      <line x1={FX.l + 6} y1={y + 12} x2={FX.r - 6} y2={y + 12} strokeWidth={1.2} {...s(delay + 0.05)} />
      {Array.from({ length: n + 1 }).map((_, i) => {
        const bx = FX.l + 6 + (i * (FX.r - FX.l - 12)) / n;
        return <line key={i} x1={bx} y1={y} x2={bx} y2={y + 12} strokeWidth={0.6} {...s(delay + 0.06 + i * 0.008)} />;
      })}
    </g>
  );
}

function Facade() {
  return (
    <g className="text-ink" stroke="currentColor" strokeWidth={1}>
      {/* outline */}
      <path d={`M${FX.l} ${FX.base} V${FX.eave} M${FX.r} ${FX.base} V${FX.eave}`} strokeWidth={1.4} {...s(0.2)} />
      <line x1={FX.l} y1={FX.base} x2={FX.r} y2={FX.base} strokeWidth={1.4} {...s(0.26)} />

      {/* mansard roof: ridge, slopes, dormers, chimneys (against sky) */}
      <line x1={FX.l - 8} y1={FX.eave} x2={FX.r + 8} y2={FX.eave} strokeWidth={1.5} {...s(0.3)} />
      {/* modillions under cornice */}
      {Array.from({ length: 16 }).map((_, i) => {
        const mx = FX.l + 6 + i * ((FX.r - FX.l - 12) / 15);
        return <line key={i} x1={mx} y1={FX.eave} x2={mx} y2={FX.eave + 5} strokeWidth={0.6} className="text-ink/70" {...s(0.34 + i * 0.01)} />;
      })}
      <path d={`M${FX.l} ${FX.eave} L${FX.l + 34} ${FX.ridge} L${FX.r - 34} ${FX.ridge} L${FX.r} ${FX.eave}`} strokeWidth={1.1} {...s(0.42)} />
      <line x1={FX.l + 20} y1={FX.ridge - 4} x2={FX.r - 20} y2={FX.ridge - 4} strokeWidth={0.7} className="text-ink/60" {...s(0.48)} />
      {/* zinc seams */}
      {Array.from({ length: 9 }).map((_, i) => {
        const t = (i + 1) / 10;
        const xb = FX.l + t * (FX.r - FX.l);
        const xt = FX.l + 34 + t * (FX.r - FX.l - 68);
        return <line key={i} x1={xb} y1={FX.eave} x2={xt} y2={FX.ridge} strokeWidth={0.4} className="text-ink/45" {...s(0.5 + i * 0.02)} />;
      })}
      {/* dormers */}
      {[FX.l + 70, FX.l + 150, FX.l + 230, FX.l + 290].map((dx, i) => (
        <path key={i} d={`M${dx} ${FX.eave - 6} v-15 q0 -7 7 -7 h12 q7 0 7 7 v15`} strokeWidth={0.8} {...s(0.6 + i * 0.04)} />
      ))}
      {/* chimneys */}
      <path d={`M${FX.l + 50} ${FX.ridge} v-16 h14 v16 M${FX.r - 70} ${FX.ridge} v-20 h13 v20`} strokeWidth={0.8} {...s(0.76)} />

      {/* floors: string courses + windows */}
      {FLOORS.map((fy, fi) => {
        const base = 1.0 + fi * 0.3;
        const noble = fi === 1;
        return (
          <g key={fi}>
            <line x1={FX.l} y1={fy + WH + 8} x2={FX.r} y2={fy + WH + 8} strokeWidth={fi === 4 ? 1.2 : 0.6} className={fi === 4 ? "text-ink" : "text-ink/70"} {...s(base)} />
            {COLS.map((x, ci) => (
              <Window key={ci} x={x} top={fy} delay={base + 0.1 + ci * 0.08} pediment={noble} />
            ))}
          </g>
        );
      })}

      {/* wrought-iron balconies on 2nd (étage noble) & 5th floors */}
      <Balcony y={FLOORS[1] + WH + 6} delay={2.0} />
      <Balcony y={FLOORS[4] + WH + 6} delay={2.3} />

      {/* rusticated ground floor + portal + shopfront */}
      <g>
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={FX.l} y1={FX.base - 10 - i * 12} x2={FX.r} y2={FX.base - 10 - i * 12} strokeWidth={0.4} className="text-ink/40" {...s(2.5 + i * 0.03)} />
        ))}
        <path className="text-gold" d={`M${FX.l + 150} ${FX.base} V${FX.base - 66} q0 -16 16 -16 h22 q16 0 16 16 V${FX.base}`} strokeWidth={1.2} {...s(2.7)} />
        <line className="text-gold" x1={FX.l + 187} y1={FX.base - 80} x2={FX.l + 187} y2={FX.base} strokeWidth={0.7} {...s(2.78)} />
        <rect x={FX.l + 16} y={FX.base - 60} width={96} height={60} rx={2} {...s(2.82)} />
        <rect x={FX.r - 96} y={FX.base - 60} width={80} height={60} rx={2} {...s(2.86)} />
      </g>

      {/* sparse hatching for volume (right reveal of the façade) */}
      <g className="text-ink/25" strokeWidth={0.4}>
        {FLOORS.map((fy, fi) =>
          [0, 1, 2].map((k) => (
            <line key={`${fi}-${k}`} x1={FX.r - 2} y1={fy + 10 + k * 14} x2={FX.r - 14} y2={fy + 16 + k * 14} {...s(2.0 + fi * 0.05)} />
          ))
        )}
      </g>
    </g>
  );
}

function Tower() {
  const cx = 622;
  const d = 3.2;
  return (
    <g className="text-ink" stroke="currentColor" strokeWidth={0.8}>
      {/* concave silhouette */}
      <path d={`M${cx + 30} 326 C ${cx + 26} 300, ${cx + 20} 276, ${cx + 17} 262 C ${cx + 13} 236, ${cx + 9} 196, ${cx + 6} 168 C ${cx + 4} 130, ${cx + 2} 100, ${cx} 78`} {...s(d)} />
      <path d={`M${cx - 30} 326 C ${cx - 26} 300, ${cx - 20} 276, ${cx - 17} 262 C ${cx - 13} 236, ${cx - 9} 196, ${cx - 6} 168 C ${cx - 4} 130, ${cx - 2} 100, ${cx} 78`} {...s(d + 0.03)} />
      {/* platforms */}
      <line x1={cx - 18} y1={262} x2={cx + 18} y2={262} strokeWidth={1} {...s(d + 0.2)} />
      <line x1={cx - 10} y1={168} x2={cx + 10} y2={168} strokeWidth={0.8} {...s(d + 0.26)} />
      {/* arch */}
      <path d={`M${cx - 26} 326 C ${cx - 16} 296, ${cx + 16} 296, ${cx + 26} 326`} className="text-gold" strokeWidth={0.9} {...s(d + 0.32)} />
      {/* legs to ground + base line */}
      <line x1={cx - 30} y1={326} x2={cx - 34} y2={352} {...s(d + 0.36)} />
      <line x1={cx + 30} y1={326} x2={cx + 34} y2={352} {...s(d + 0.38)} />
      {/* lattice */}
      <g className="text-ink/40" strokeWidth={0.35}>
        <line x1={cx - 28} y1={322} x2={cx + 16} y2={264} {...s(d + 0.42)} />
        <line x1={cx + 28} y1={322} x2={cx - 16} y2={264} {...s(d + 0.44)} />
        <line x1={cx - 16} y1={258} x2={cx + 9} y2={172} {...s(d + 0.46)} />
        <line x1={cx + 16} y1={258} x2={cx - 9} y2={172} {...s(d + 0.48)} />
      </g>
      {/* antenna */}
      <line x1={cx} y1={78} x2={cx} y2={58} className="text-gold" strokeWidth={0.8} {...s(d + 0.54)} />
      <circle cx={cx} cy={55} r={2} fill="currentColor" stroke="none" className="text-gold" {...s(d + 0.6)} />
    </g>
  );
}

function Foreground() {
  return (
    <g stroke="currentColor">
      {/* clouds (loose) */}
      <g className="text-ink/35" strokeWidth={0.7}>
        <path d="M470 120 q14 -10 30 -2 q12 -8 26 2" {...s(0.1)} />
        <path d="M540 168 q12 -8 26 -2 q10 -6 22 2" {...s(0.16)} />
      </g>
      {/* tree, bottom-left in front of the façade */}
      <g strokeWidth={1}>
        <line x1={46} y1={560} x2={42} y2={452} className="text-ink/70" {...s(4.0)} />
        <path d="M42 452 q-34 -8 -28 -40 q12 -28 44 -20 q22 -22 44 6 q20 20 -4 40 q-8 24 -56 14 Z" className="text-success" strokeWidth={0.8} {...s(4.06)} />
      </g>
      {/* lamppost */}
      <g className="text-ink" strokeWidth={1.1}>
        <line x1={690} y1={560} x2={694} y2={392} {...s(4.2)} />
        <path d="M694 392 q-2 -12 -15 -14 M694 392 q2 -12 15 -14" strokeWidth={0.8} {...s(4.26)} />
        <path d="M676 376 q16 -15 34 0 q2 15 -13 18 q-16 -3 -21 -18 Z" className="text-gold" strokeWidth={0.9} {...s(4.32)} />
      </g>
    </g>
  );
}

export function ParisVignette({ className = "" }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(svg.querySelectorAll<SVGElement>("[data-delay]"));
    if (!els.length) return;
    const delays = els.map((el) => parseFloat(el.dataset.delay || "0"));
    const lastEnd = Math.max(...delays) + DRAW;
    const cycle = lastEnd + HOLD + FADE;
    const fadeStart = (lastEnd + HOLD) / cycle;
    const anims: Animation[] = [];
    els.forEach((el, i) => {
      el.style.strokeDasharray = "1";
      const dd = delays[i];
      anims.push(
        el.animate(
          [
            { strokeDashoffset: 1, opacity: 1, offset: 0 },
            { strokeDashoffset: 1, opacity: 1, offset: dd / cycle },
            { strokeDashoffset: 0, opacity: 1, offset: Math.min((dd + DRAW) / cycle, fadeStart) },
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
            { transform: "translate(250px, 540px)", opacity: 0, offset: 0 },
            { opacity: 1, offset: 0.04 },
            { transform: "translate(250px, 110px)", opacity: 1, offset: at(0.8) },
            { transform: "translate(420px, 470px)", opacity: 1, offset: at(2.8) },
            { transform: "translate(622px, 326px)", opacity: 1, offset: at(3.4) },
            { transform: "translate(622px, 56px)", opacity: 1, offset: at(lastEnd) },
            { transform: "translate(250px, 540px)", opacity: 0, offset: 1 },
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
      viewBox="0 0 760 600"
      role="img"
      aria-label="Croquis à l'encre d'un immeuble haussmannien et de la Tour Eiffel, qui se dessine"
      className={`h-full w-full overflow-visible text-ink [stroke-linecap:round] [stroke-linejoin:round] ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
    >
      <defs>
        <filter id="rs-ink2" x="-3%" y="-3%" width="106%" height="106%">
          <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves={2} seed={9} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter="url(#rs-ink2)" vectorEffect="non-scaling-stroke">
        <Foreground />
        <Tower />
        <Facade />
        <g className="nib text-gold" stroke="none">
          <path d="M0 0 L7 -24 L15 -20 L5 4 Z" fill="currentColor" />
          <path d="M7 -24 L30 -64 Q36 -72 43 -66 L18 -20 Z" fill="currentColor" opacity={0.85} />
        </g>
      </g>
    </svg>
  );
}
