"use client";

import { useEffect, useRef } from "react";

/**
 * ParisSketch — a wide, architect-style pencil fresco drawn on an infinite loop:
 * a Haussmann building (¾ perspective, full ornament, balconies on the 2nd
 * "étage noble" and 5th floor) → the Champ de Mars gardens in one-point
 * perspective → the Eiffel Tower. Construction guides first, then the scene is
 * drawn stroke by stroke while a pencil glides along; pause, soft fade, redraw.
 *
 * Pseudo-3D via a shared vanishing point. Hand-drawn feel via an SVG
 * turbulence/displacement filter. Orchestrated with the Web Animations API;
 * fully static (pencil hidden) under prefers-reduced-motion.
 */

// ── timing (seconds) ──────────────────────────────
const DRAW = 0.55; // per-stroke draw time
const HOLD = 1.8; // pause on the finished drawing
const FADE = 1.0; // fade-out before redraw

// scene vanishing point (Eiffel tower base on the horizon)
const VP = { x: 600, y: 300 };

type DrawAttrs = { "data-delay": number; pathLength: 1 };
const s = (delay: number): DrawAttrs => ({ "data-delay": delay, pathLength: 1 });

/** point a fraction `t` of the way from P toward the vanishing point */
function toVP(x: number, y: number, t: number): [number, number] {
  return [x + (VP.x - x) * t, y + (VP.y - y) * t];
}

// ─────────────────────────────────────────────────
// Haussmann building (left), ¾ perspective
// ─────────────────────────────────────────────────
const B = {
  left: 70,
  right: 280,
  top: 120, // top of mansard
  corniche: 132,
  bandTop: 140, // first floor band top
  base: 440,
};
const FLOOR_H = 52;
const FLOORS = [0, 1, 2, 3, 4].map((i) => B.bandTop + i * FLOOR_H); // 5 floor tops
const FRONT_COLS = [100, 160, 220];
const FW = 34; // window width

function Baluster({ x1, x2, y, delay }: { x1: number; x2: number; y: number; delay: number }) {
  const n = Math.max(3, Math.round((x2 - x1) / 9));
  return (
    <g className="text-gold">
      <line x1={x1 - 4} y1={y} x2={x2 + 4} y2={y} strokeWidth={1.1} {...s(delay)} />
      <line x1={x1 - 4} y1={y + 11} x2={x2 + 4} y2={y + 11} strokeWidth={1.1} {...s(delay + 0.05)} />
      {Array.from({ length: n + 1 }).map((_, i) => {
        const bx = x1 + (i * (x2 - x1)) / n;
        return <line key={i} x1={bx} y1={y} x2={bx} y2={y + 11} strokeWidth={0.7} {...s(delay + 0.06 + i * 0.01)} />;
      })}
    </g>
  );
}

function FrontWindow({ x, top, delay, pediment }: { x: number; top: number; delay: number; pediment?: boolean }) {
  const wt = top + 8;
  const h = 34;
  const wb = wt + h;
  return (
    <g>
      <rect x={x} y={wt} width={FW} height={h} rx={FW / 2} ry={5} {...s(delay)} />
      <line x1={x + FW / 2} y1={wt + 5} x2={x + FW / 2} y2={wb - 2} {...s(delay + 0.06)} />
      <line x1={x + 2} y1={wt + 13} x2={x + FW - 2} y2={wt + 13} {...s(delay + 0.1)} />
      {/* appui / sill moulding */}
      <line x1={x - 3} y1={wb + 3} x2={x + FW + 3} y2={wb + 3} strokeWidth={1} {...s(delay + 0.13)} />
      {pediment && (
        <path d={`M${x - 2} ${wt - 2} q${FW / 2 + 2} -12 ${FW + 4} 0`} strokeWidth={1} className="text-gold" {...s(delay + 0.16)} />
      )}
    </g>
  );
}

function Building() {
  return (
    <g>
      {/* ── right side face (receding to VP) ── */}
      {(() => {
        const ftTop: [number, number] = [B.right, B.top];
        const fbBot: [number, number] = [B.right, B.base];
        const btTop = toVP(B.right, B.top, 0.34);
        const bbBot = toVP(B.right, B.base, 0.34);
        return (
          <g className="text-ink/80">
            <path
              d={`M${ftTop[0]} ${ftTop[1]} L${btTop[0]} ${btTop[1]} L${bbBot[0]} ${bbBot[1]} L${fbBot[0]} ${fbBot[1]}`}
              {...s(0.25)}
            />
            {/* receding floor lines on the side */}
            {FLOORS.map((fy, i) => {
              const a = toVP(B.right, fy + FLOOR_H - 6, 0);
              const b = toVP(B.right, fy + FLOOR_H - 6, 0.34);
              return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} strokeWidth={0.6} {...s(0.3 + i * 0.05)} />;
            })}
            {/* two side windows */}
            {[0, 1].map((k) => {
              const wx = toVP(B.right + 14, B.bandTop + 10 + k * 0, 0.1);
              const wTop = FLOORS[1 + k] + 6;
              const p1 = toVP(B.right + 6, wTop, 0.08);
              const p2 = toVP(B.right + 6, wTop, 0.22);
              const p3 = toVP(B.right + 6, wTop + 26, 0.22);
              const p4 = toVP(B.right + 6, wTop + 26, 0.08);
              void wx;
              return (
                <path key={k} d={`M${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]} L${p3[0]} ${p3[1]} L${p4[0]} ${p4[1]} Z`} strokeWidth={0.7} {...s(0.55 + k * 0.12)} />
              );
            })}
          </g>
        );
      })()}

      {/* ── mansard roof (toiture à la parisienne) ── */}
      <g>
        <line x1={B.left - 6} y1={B.corniche} x2={B.right + 6} y2={B.corniche} strokeWidth={1.5} {...s(0.2)} />
        {/* modillions under cornice */}
        {Array.from({ length: 12 }).map((_, i) => {
          const mx = B.left + 4 + i * ((B.right - B.left - 8) / 11);
          return <line key={i} x1={mx} y1={B.corniche} x2={mx} y2={B.corniche + 4} strokeWidth={0.6} {...s(0.22 + i * 0.01)} />;
        })}
        {/* mansard slopes */}
        <path d={`M${B.left} ${B.corniche} L${B.left + 26} ${B.top - 26} L${B.right - 26} ${B.top - 26} L${B.right} ${B.corniche}`} {...s(0.32)} />
        {/* zinc roof vertical seams */}
        {Array.from({ length: 9 }).map((_, i) => {
          const t = (i + 1) / 10;
          const xb = B.left + t * (B.right - B.left);
          const xt = B.left + 26 + t * (B.right - B.left - 52);
          return <line key={i} x1={xb} y1={B.corniche} x2={xt} y2={B.top - 26} strokeWidth={0.5} className="text-ink/50" {...s(0.4 + i * 0.02)} />;
        })}
        {/* dormers (lucarnes) */}
        {[B.left + 55, B.left + 105, B.left + 155].map((dx, i) => (
          <path key={i} d={`M${dx} ${B.top - 10} v-14 q0 -6 6 -6 h10 q6 0 6 6 v14`} strokeWidth={0.8} {...s(0.5 + i * 0.05)} />
        ))}
        {/* chimneys */}
        <path d={`M${B.left + 30} ${B.top - 26} v-14 h12 v14 M${B.right - 50} ${B.top - 26} v-18 h12 v18`} strokeWidth={0.8} {...s(0.66)} />
      </g>

      {/* ── front face outline ── */}
      <path d={`M${B.left} ${B.base} V${B.corniche} M${B.right} ${B.base} V${B.corniche}`} className="text-ink/85" {...s(0.7)} />
      <line x1={B.left} y1={B.base} x2={B.right} y2={B.base} {...s(0.74)} />

      {/* ── floors with windows + string-course mouldings ── */}
      {FLOORS.map((fy, fi) => {
        const base = 0.85 + fi * 0.28;
        const noble = fi === 1; // 2e étage
        const fifth = fi === 4; // 5e étage
        return (
          <g key={fi}>
            {/* string course / moulure */}
            <line x1={B.left} y1={fy + FLOOR_H - 6} x2={B.right} y2={fy + FLOOR_H - 6} strokeWidth={fi === 0 ? 1.2 : 0.7} className={fi === 0 ? "text-ink" : "text-ink/70"} {...s(base)} />
            {FRONT_COLS.map((x, ci) => (
              <FrontWindow key={ci} x={x} top={fy} delay={base + 0.08 + ci * 0.1} pediment={noble} />
            ))}
            {/* continuous balconies on 2nd & 5th floors */}
            {(noble || fifth) && <Baluster x1={B.left + 8} x2={B.right - 8} y={fy + FLOOR_H - 2} delay={base + 0.5} />}
          </g>
        );
      })}

      {/* ── ground floor: rusticated + portal + shopfronts ── */}
      <g>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={B.left} y1={B.base - 8 - i * 12} x2={B.right} y2={B.base - 8 - i * 12} strokeWidth={0.45} className="text-ink/40" {...s(2.35 + i * 0.04)} />
        ))}
        <path className="text-gold" d={`M${B.left + 88} ${B.base} V${B.base - 54} q0 -12 12 -12 h12 q12 0 12 12 V${B.base}`} strokeWidth={1.2} {...s(2.55)} />
        <line className="text-gold" x1={B.left + 106} y1={B.base - 64} x2={B.left + 106} y2={B.base} strokeWidth={0.7} {...s(2.62)} />
        <rect x={B.left + 8} y={B.base - 52} width={56} height={52} rx={2} {...s(2.66)} />
      </g>
    </g>
  );
}

// ─────────────────────────────────────────────────
// Champ de Mars (one-point perspective gardens)
// ─────────────────────────────────────────────────
function ChampDeMars() {
  const nearY = 448;
  const leftNear = 250;
  const rightNear = 950;
  // lawn edges converge to VP
  const le = toVP(leftNear, nearY, 0.92);
  const re = toVP(rightNear, nearY, 0.92);
  const pathLNear = 540;
  const pathRNear = 660;
  const pl = toVP(pathLNear, nearY, 0.92);
  const pr = toVP(pathRNear, nearY, 0.92);

  return (
    <g className="text-ink/70">
      {/* outer lawn borders */}
      <line x1={leftNear} y1={nearY} x2={le[0]} y2={le[1]} {...s(3.2)} />
      <line x1={rightNear} y1={nearY} x2={re[0]} y2={re[1]} {...s(3.24)} />
      {/* central alley */}
      <line x1={pathLNear} y1={nearY} x2={pl[0]} y2={pl[1]} {...s(3.3)} />
      <line x1={pathRNear} y1={nearY} x2={pr[0]} y2={pr[1]} {...s(3.34)} />
      {/* transversal parterre lines (closer together near horizon) */}
      {[0.18, 0.38, 0.56, 0.7, 0.82].map((t, i) => {
        const a = toVP(leftNear, nearY, t);
        const b = toVP(rightNear, nearY, t);
        return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} strokeWidth={0.6} {...s(3.4 + i * 0.07)} />;
      })}
      {/* rows of trees, diminishing with distance */}
      {[
        { t: 0.0, r: 16 },
        { t: 0.28, r: 12 },
        { t: 0.5, r: 9 },
        { t: 0.66, r: 6.5 },
      ].map((row, ri) =>
        [leftNear - 18, rightNear + 18].map((nx, side) => {
          const [cx, cy] = toVP(nx, nearY - row.r, row.t);
          const delay = 3.8 + ri * 0.12 + side * 0.05;
          return (
            <g key={`${ri}-${side}`} className="text-success">
              <line x1={cx} y1={cy + row.r} x2={cx} y2={cy + row.r + row.r * 0.6} strokeWidth={0.8} className="text-ink/60" {...s(delay)} />
              <path d={`M${cx - row.r} ${cy + row.r} q${row.r} ${-row.r * 2.2} ${row.r * 2} 0 q${row.r * 0.2} ${row.r * 0.6} ${-row.r} ${row.r * 0.5} q${-row.r} ${row.r * 0.1} ${-row.r} ${-row.r * 0.5}`} strokeWidth={0.8} {...s(delay + 0.05)} />
            </g>
          );
        })
      )}
    </g>
  );
}

// ─────────────────────────────────────────────────
// Eiffel Tower (frontal, slight perspective)
// ─────────────────────────────────────────────────
const T = {
  cx: 600,
  baseY: 300,
  baseHalf: 78,
  p1Y: 232,
  p1Half: 52,
  p2Y: 150,
  p2Half: 26,
  topY: 22,
  topHalf: 5,
};

function leg(half1: number, y1: number, half2: number, y2: number, sign: number, delay: number) {
  return <line x1={T.cx + sign * half1} y1={y1} x2={T.cx + sign * half2} y2={y2} {...s(delay)} />;
}

function EiffelTower() {
  const baseDelay = 4.7;
  return (
    <g className="text-ink">
      {/* legs (both sides, 3 tiers) */}
      {leg(T.baseHalf, T.baseY, T.p1Half, T.p1Y, -1, baseDelay)}
      {leg(T.baseHalf, T.baseY, T.p1Half, T.p1Y, 1, baseDelay + 0.05)}
      {/* inner leg lines for thickness */}
      {leg(T.baseHalf - 22, T.baseY, T.p1Half - 14, T.p1Y, -1, baseDelay + 0.1)}
      {leg(T.baseHalf - 22, T.baseY, T.p1Half - 14, T.p1Y, 1, baseDelay + 0.12)}
      {leg(T.p1Half, T.p1Y, T.p2Half, T.p2Y, -1, baseDelay + 0.2)}
      {leg(T.p1Half, T.p1Y, T.p2Half, T.p2Y, 1, baseDelay + 0.22)}
      {leg(T.p2Half, T.p2Y, T.topHalf, T.topY, -1, baseDelay + 0.3)}
      {leg(T.p2Half, T.p2Y, T.topHalf, T.topY, 1, baseDelay + 0.32)}

      {/* iconic base arches */}
      <path d={`M${T.cx - T.baseHalf + 8} ${T.baseY} q${T.baseHalf - 8} -70 ${2 * (T.baseHalf - 8)} 0`} strokeWidth={1} className="text-gold" {...s(baseDelay + 0.4)} />
      <path d={`M${T.cx - T.p1Half + 4} ${T.p1Y} q${T.p1Half - 4} 40 ${2 * (T.p1Half - 4)} 0`} strokeWidth={0.7} {...s(baseDelay + 0.46)} />

      {/* platforms */}
      <line x1={T.cx - T.p1Half - 4} y1={T.p1Y} x2={T.cx + T.p1Half + 4} y2={T.p1Y} strokeWidth={1.2} {...s(baseDelay + 0.5)} />
      <line x1={T.cx - T.p1Half} y1={T.p1Y + 7} x2={T.cx + T.p1Half} y2={T.p1Y + 7} strokeWidth={0.6} {...s(baseDelay + 0.54)} />
      <line x1={T.cx - T.p2Half - 3} y1={T.p2Y} x2={T.cx + T.p2Half + 3} y2={T.p2Y} strokeWidth={1.1} {...s(baseDelay + 0.58)} />
      <line x1={T.cx - T.p2Half} y1={T.p2Y + 6} x2={T.cx + T.p2Half} y2={T.p2Y + 6} strokeWidth={0.5} {...s(baseDelay + 0.62)} />

      {/* lattice cross-hatching, lower tier */}
      {Array.from({ length: 6 }).map((_, i) => {
        const t0 = i / 6;
        const t1 = (i + 1) / 6;
        const xL0 = T.cx - (T.baseHalf - t0 * (T.baseHalf - T.p1Half));
        const xR0 = T.cx + (T.baseHalf - t0 * (T.baseHalf - T.p1Half));
        const y0 = T.baseY - t0 * (T.baseY - T.p1Y);
        const xL1 = T.cx - (T.baseHalf - t1 * (T.baseHalf - T.p1Half));
        const xR1 = T.cx + (T.baseHalf - t1 * (T.baseHalf - T.p1Half));
        const y1 = T.baseY - t1 * (T.baseY - T.p1Y);
        return (
          <g key={i} className="text-ink/55">
            <line x1={xL0} y1={y0} x2={xR1} y2={y1} strokeWidth={0.4} {...s(baseDelay + 0.7 + i * 0.05)} />
            <line x1={xR0} y1={y0} x2={xL1} y2={y1} strokeWidth={0.4} {...s(baseDelay + 0.73 + i * 0.05)} />
          </g>
        );
      })}
      {/* mid tier lattice */}
      {Array.from({ length: 5 }).map((_, i) => {
        const t0 = i / 5;
        const t1 = (i + 1) / 5;
        const xL0 = T.cx - (T.p1Half - t0 * (T.p1Half - T.p2Half));
        const xR0 = T.cx + (T.p1Half - t0 * (T.p1Half - T.p2Half));
        const y0 = T.p1Y - t0 * (T.p1Y - T.p2Y);
        const xL1 = T.cx - (T.p1Half - t1 * (T.p1Half - T.p2Half));
        const xR1 = T.cx + (T.p1Half - t1 * (T.p1Half - T.p2Half));
        const y1v = T.p1Y - t1 * (T.p1Y - T.p2Y);
        return (
          <g key={i} className="text-ink/50">
            <line x1={xL0} y1={y0} x2={xR1} y2={y1v} strokeWidth={0.4} {...s(baseDelay + 1.05 + i * 0.05)} />
            <line x1={xR0} y1={y0} x2={xL1} y2={y1v} strokeWidth={0.4} {...s(baseDelay + 1.08 + i * 0.05)} />
          </g>
        );
      })}
      {/* summit + antenna */}
      <path d={`M${T.cx - T.topHalf} ${T.topY} L${T.cx} ${T.topY - 14} L${T.cx + T.topHalf} ${T.topY}`} strokeWidth={0.8} {...s(baseDelay + 1.35)} />
      <line x1={T.cx} y1={T.topY - 14} x2={T.cx} y2={T.topY - 26} strokeWidth={0.8} className="text-gold" {...s(baseDelay + 1.4)} />
    </g>
  );
}

export function ParisSketch({ className = "" }: { className?: string }) {
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

    const pencil = svg.querySelector<SVGGElement>(".pencil");
    if (pencil) {
      const at = (t: number) => t / cycle;
      anims.push(
        pencil.animate(
          [
            { transform: "translate(110px, 430px)", opacity: 0, offset: 0 },
            { opacity: 1, offset: 0.03 },
            { transform: "translate(210px, 150px)", opacity: 1, offset: at(2.6) },
            { transform: "translate(600px, 430px)", opacity: 1, offset: at(3.9) },
            { transform: "translate(600px, 300px)", opacity: 1, offset: at(4.8) },
            { transform: "translate(600px, 40px)", opacity: 1, offset: at(lastEnd) },
            { transform: "translate(600px, 30px)", opacity: 0, offset: fadeStart },
            { transform: "translate(110px, 430px)", opacity: 0, offset: 1 },
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
      viewBox="0 0 1200 480"
      role="img"
      aria-label="Croquis au crayon en perspective : immeuble haussmannien, jardins du Champ de Mars et Tour Eiffel, qui se dessine en continu"
      className={`sketch h-full w-full overflow-visible text-ink [stroke-linecap:round] [stroke-linejoin:round] ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
    >
      <defs>
        <filter id="rs-pencil-filter" x="-3%" y="-3%" width="106%" height="106%">
          <feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves={2} seed={11} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      <g filter="url(#rs-pencil-filter)" vectorEffect="non-scaling-stroke">
        {/* ── construction guides ── */}
        <g className="text-ink/20" strokeWidth={0.5}>
          <line x1={40} y1={VP.y} x2={1160} y2={VP.y} {...s(0)} />
          <line x1={VP.x} y1={20} x2={VP.x} y2={460} {...s(0.05)} />
          <line x1={120} y1={448} x2={VP.x} y2={VP.y} {...s(0.1)} />
          <line x1={1080} y1={448} x2={VP.x} y2={VP.y} {...s(0.12)} />
        </g>

        <Building />
        <ChampDeMars />
        <EiffelTower />

        {/* ── pencil ── */}
        <g className="pencil text-gold" stroke="none">
          <path d="M0 0 L30 -9 L34 5 L4 14 Z" fill="currentColor" opacity={0.18} />
          <path d="M30 -9 L39 -11 L41 -2 L34 5 Z" fill="currentColor" />
          <path d="M39 -11 L46 -12 L47 -6 L41 -2 Z" fill="var(--color-ink)" opacity={0.5} />
          <circle cx={2} cy={7} r={2} fill="currentColor" />
        </g>
      </g>
    </svg>
  );
}
