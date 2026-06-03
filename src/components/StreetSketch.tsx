"use client";

import { useEffect, useRef } from "react";

/**
 * StreetSketch — a one-point-perspective ink sketch of a Parisian street that
 * opens onto the Eiffel Tower rising in the sky at the end of the avenue,
 * framed by asymmetric Haussmann façades with mansard roofs, dormers and
 * chimneys, a lamppost, a café and a tree. Loose double-pass strokes + a
 * subtle roughen filter give an inked feel. Draws itself on a loop (WAAPI);
 * static under prefers-reduced-motion.
 */

const VP = { x: 300, y: 430 };
const DRAW = 0.6;
const HOLD = 2.2;
const FADE = 1.0;

type DrawAttrs = { "data-delay": number; pathLength: 1 };
const s = (delay: number): DrawAttrs => ({ "data-delay": delay, pathLength: 1 });

const lineY = (x: number, ax: number, ay: number) =>
  VP.y + (ay - VP.y) * ((x - VP.x) / (ax - VP.x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// deterministic tiny jitter for a hand-drawn wobble
const jit = (a: number, b: number) => {
  const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return (v - Math.floor(v) - 0.5) * 2.6;
};

type FacadeProps = {
  nearX: number;
  eaveY: number; // roof eave at the near edge
  ridgeY: number; // mansard ridge at the near edge
  baseY: number; // building base at the near edge
  bays: number[]; // vertical bay x-positions, near → far
  floors: number[]; // floor anchors on the near vertical (top → bottom)
  d0: number; // base delay
  balcony: number[]; // floor-band indices that carry a balcony
};

function Facade({ nearX, eaveY, ridgeY, baseY, bays, floors, d0, balcony }: FacadeProps) {
  const xFirst = bays[0];
  const xLast = bays[bays.length - 1];

  const cell = (xk: number, xk1: number, yt: number, yb: number, delay: number, key: string) => {
    const TL = [xk, lineY(xk, nearX, yt)];
    const TR = [xk1, lineY(xk1, nearX, yt)];
    const BR = [xk1, lineY(xk1, nearX, yb)];
    const BL = [xk, lineY(xk, nearX, yb)];
    const cx = (TL[0] + TR[0] + BR[0] + BL[0]) / 4;
    const cy = (TL[1] + TR[1] + BR[1] + BL[1]) / 4;
    const k = 0.2;
    const P = (p: number[], i: number) => [
      lerp(p[0], cx, k) + jit(p[0], i),
      lerp(p[1], cy, k) + jit(p[1], i + 9),
    ];
    const a = P(TL, 1), b = P(TR, 2), c = P(BR, 3), e = P(BL, 4);
    return (
      <g key={key}>
        <path
          d={`M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)} L${c[0].toFixed(1)} ${c[1].toFixed(1)} L${e[0].toFixed(1)} ${e[1].toFixed(1)} Z`}
          {...s(delay)}
        />
        <line x1={(a[0] + b[0]) / 2} y1={(a[1] + b[1]) / 2} x2={(e[0] + c[0]) / 2} y2={(e[1] + c[1]) / 2} strokeWidth={0.45} className="text-ink/55" {...s(delay + 0.04)} />
      </g>
    );
  };

  return (
    <g>
      {/* eave + base (double pass) */}
      <g className="text-ink" strokeWidth={1.5}>
        <line x1={xFirst} y1={lineY(xFirst, nearX, eaveY)} x2={VP.x} y2={VP.y} {...s(d0)} />
        <line x1={xFirst} y1={lineY(xFirst, nearX, eaveY) + 2.5} x2={VP.x} y2={VP.y} strokeWidth={0.6} className="text-ink/50" {...s(d0 + 0.05)} />
        <line x1={xFirst} y1={lineY(xFirst, nearX, baseY)} x2={VP.x} y2={VP.y} {...s(d0 + 0.1)} />
      </g>

      {/* mansard ridge + roof slope + dormers + chimneys (against the sky) */}
      <g className="text-ink" strokeWidth={1}>
        <line x1={xFirst} y1={lineY(xFirst, nearX, ridgeY)} x2={VP.x} y2={VP.y} strokeWidth={0.9} {...s(d0 + 0.15)} />
        {/* near gable connecting ridge to eave */}
        <line x1={xFirst} y1={lineY(xFirst, nearX, ridgeY)} x2={xFirst} y2={lineY(xFirst, nearX, eaveY)} {...s(d0 + 0.18)} />
        {/* dormers sitting on the eave, first few bays */}
        {bays.slice(0, 3).map((xk, i) => {
          const xm = (xk + bays[i + 1]) / 2;
          const ey = lineY(xm, nearX, eaveY);
          const w = lerp(13, 5, i / 3);
          return (
            <path key={`dm${i}`} d={`M${xm - w} ${ey} v${-w} q0 ${-w * 0.5} ${w} ${-w * 0.5} q${w} 0 ${w} ${w * 0.5} v${w}`} strokeWidth={0.7} {...s(d0 + 0.22 + i * 0.04)} />
          );
        })}
        {/* chimneys above the ridge */}
        {[0, 1].map((i) => {
          const xm = lerp(xFirst, bays[1], 0.3 + i * 0.5);
          const ry = lineY(xm, nearX, ridgeY);
          return <path key={`ch${i}`} d={`M${xm} ${ry} v-13 h9 v13`} strokeWidth={0.8} {...s(d0 + 0.3 + i * 0.05)} />;
        })}
      </g>

      {/* vertical bay lines */}
      <g className="text-ink">
        {bays.map((x, i) => (
          <line key={i} x1={x} y1={lineY(x, nearX, eaveY)} x2={x} y2={Math.min(lineY(x, nearX, baseY), 772)} strokeWidth={i === 0 ? 1.5 : 0.7} {...s(d0 + 0.35 + i * 0.07)} />
        ))}
      </g>

      {/* floor / string-course lines */}
      <g className="text-ink/70" strokeWidth={0.6}>
        {floors.map((yf, i) => (
          <line key={i} x1={xFirst} y1={lineY(xFirst, nearX, yf)} x2={xLast} y2={lineY(xLast, nearX, yf)} strokeWidth={i === floors.length - 1 ? 1.1 : 0.55} {...s(d0 + 0.9 + i * 0.07)} />
        ))}
      </g>

      {/* windows */}
      <g className="text-ink" strokeWidth={0.8}>
        {bays.slice(0, -1).map((xk, bi) =>
          floors.slice(0, -1).map((yt, fi) =>
            cell(xk, bays[bi + 1], yt + 5, floors[fi + 1] - 4, d0 + 1.5 + bi * 0.16 + fi * 0.05, `${bi}-${fi}`)
          )
        )}
      </g>

      {/* wrought-iron balconies (gold) on selected floors, near bays only */}
      <g className="text-gold" strokeWidth={0.9}>
        {balcony.map((fi) =>
          bays.slice(0, 3).map((xk, bi) => {
            const xk1 = bays[bi + 1];
            const y = floors[fi + 1] - 3;
            return <line key={`${fi}-${bi}`} x1={xk + 2} y1={lineY(xk + 2, nearX, y)} x2={xk1 - 2} y2={lineY(xk1 - 2, nearX, y)} {...s(d0 + 2.3 + bi * 0.08)} />;
          })
        )}
      </g>
    </g>
  );
}

function Tower() {
  const d = 3.6; // drawn late, on top, as the focal landmark
  return (
    <g className="text-ink" stroke="currentColor" strokeWidth={1.1}>
      {/* concave silhouette */}
      <path d="M348 414 C 342 376, 334 344, 330 326 C 325 300, 320 262, 317 232 C 313 188, 306 130, 300 70" {...s(d)} />
      <path d="M252 414 C 258 376, 266 344, 270 326 C 275 300, 280 262, 283 232 C 287 188, 294 130, 300 70" {...s(d + 0.03)} />
      {/* platforms */}
      <line x1={270} y1={326} x2={330} y2={326} strokeWidth={1.4} {...s(d + 0.2)} />
      <line x1={276} y1={332} x2={324} y2={332} strokeWidth={0.5} className="text-ink/60" {...s(d + 0.24)} />
      <line x1={283} y1={232} x2={317} y2={232} strokeWidth={1.1} {...s(d + 0.28)} />
      <line x1={294} y1={126} x2={306} y2={126} strokeWidth={0.9} {...s(d + 0.32)} />
      {/* great arch */}
      <path d="M256 414 C 270 372, 330 372, 344 414" className="text-gold" strokeWidth={1.2} {...s(d + 0.4)} />
      <path d="M276 414 C 286 388, 314 388, 324 414" strokeWidth={0.6} className="text-ink/50" {...s(d + 0.46)} />
      {/* lattice */}
      <g className="text-ink/45" strokeWidth={0.45}>
        <line x1={254} y1={408} x2={328} y2={330} {...s(d + 0.5)} />
        <line x1={346} y1={408} x2={272} y2={330} {...s(d + 0.52)} />
        <line x1={272} y1={322} x2={314} y2={238} {...s(d + 0.54)} />
        <line x1={328} y1={322} x2={286} y2={238} {...s(d + 0.56)} />
      </g>
      {/* summit + antenna */}
      <line x1={300} y1={70} x2={300} y2={48} className="text-gold" strokeWidth={0.9} {...s(d + 0.6)} />
      <circle cx={300} cy={44} r={2.4} fill="currentColor" stroke="none" className="text-gold" {...s(d + 0.66)} />
    </g>
  );
}

function Street() {
  return (
    <g className="text-ink" stroke="currentColor">
      <line x1={150} y1={772} x2={VP.x} y2={VP.y} strokeWidth={1.3} {...s(0.05)} />
      <line x1={450} y1={772} x2={VP.x} y2={VP.y} strokeWidth={1.3} {...s(0.08)} />
      <g className="text-ink/45" strokeWidth={0.7}>
        {[0.12, 0.32, 0.5, 0.65, 0.77].map((t, i) => {
          const y = lerp(760, VP.y + 10, t);
          const w = lerp(34, 3, t);
          return <line key={i} x1={VP.x - w / 2} y1={y} x2={VP.x + w / 2} y2={y} {...s(1.0 + i * 0.06)} />;
        })}
      </g>
    </g>
  );
}

function Foreground() {
  return (
    <g stroke="currentColor">
      {/* ornate lamppost, left */}
      <g className="text-ink" strokeWidth={1.2}>
        <line x1={132} y1={700} x2={138} y2={486} {...s(4.4)} />
        <path d="M138 486 q-2 -12 -16 -14 M138 486 q2 -12 16 -14" strokeWidth={0.8} {...s(4.48)} />
        <path d="M120 470 q16 -16 34 0 q2 16 -13 19 q-16 -3 -21 -19 Z" className="text-gold" strokeWidth={1} {...s(4.54)} />
        <line x1={132} y1={700} x2={120} y2={714} strokeWidth={1.1} {...s(4.6)} />
        <line x1={132} y1={700} x2={150} y2={714} strokeWidth={1.1} {...s(4.62)} />
      </g>

      {/* café terrace, right */}
      <g className="text-ink" strokeWidth={0.9}>
        <path d="M402 678 h168 l-12 -28 h-144 Z" {...s(4.7)} />
        <line x1={420} y1={678} x2={420} y2={706} {...s(4.76)} />
        <line x1={552} y1={678} x2={552} y2={706} {...s(4.77)} />
        <path d="M454 736 a18 6 0 1 0 36 0 a18 6 0 1 0 -36 0" strokeWidth={0.7} {...s(4.82)} />
        <line x1={472} y1={736} x2={472} y2={758} {...s(4.85)} />
        <path d="M442 750 v-13 M502 750 v-13" strokeWidth={0.7} {...s(4.88)} />
      </g>

      {/* tree, left */}
      <g strokeWidth={0.9}>
        <line x1={96} y1={744} x2={92} y2={648} className="text-ink/70" {...s(4.95)} />
        <path d="M92 648 q-30 -6 -24 -36 q10 -26 38 -18 q20 -20 40 6 q18 18 -4 36 q-6 22 -50 12 Z" className="text-success" strokeWidth={0.8} {...s(5.0)} />
      </g>

      {/* two elegant silhouettes (no stick limbs) */}
      <g className="text-ink/80" fill="currentColor" stroke="none">
        <g {...s(5.1)}>
          <ellipse cx={250} cy={606} rx={4} ry={4.4} />
          <path d="M245 612 q5 -4 10 0 l3 30 q-8 4 -16 0 Z" />
        </g>
        <g {...s(5.16)}>
          <ellipse cx={272} cy={612} rx={3.4} ry={3.8} />
          <path d="M268 617 q4 -3 8 0 l2 26 q-6 3 -12 0 Z" />
        </g>
      </g>
    </g>
  );
}

export function StreetSketch({ className = "" }: { className?: string }) {
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
            { transform: "translate(300px, 560px)", opacity: 0, offset: 0 },
            { opacity: 1, offset: 0.04 },
            { transform: "translate(24px, 300px)", opacity: 1, offset: at(1.6) },
            { transform: "translate(576px, 320px)", opacity: 1, offset: at(3.2) },
            { transform: "translate(300px, 410px)", opacity: 1, offset: at(3.8) },
            { transform: "translate(300px, 52px)", opacity: 1, offset: at(lastEnd) },
            { transform: "translate(300px, 50px)", opacity: 0, offset: 1 },
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
      viewBox="0 0 600 760"
      role="img"
      aria-label="Croquis à l'encre d'une rue parisienne ouvrant sur la Tour Eiffel, qui se dessine"
      className={`h-full w-full overflow-visible text-ink [stroke-linecap:round] [stroke-linejoin:round] ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
    >
      <defs>
        <filter id="rs-ink" x="-3%" y="-3%" width="106%" height="106%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={2} seed={5} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      <g filter="url(#rs-ink)" vectorEffect="non-scaling-stroke">
        <Street />
        {/* left façade */}
        <Facade
          nearX={8}
          eaveY={250}
          ridgeY={222}
          baseY={880}
          bays={[8, 84, 150, 202, 242, 272]}
          floors={[280, 372, 484, 620, 786]}
          d0={1.4}
          balcony={[0, 3]}
        />
        {/* right façade (asymmetric: lower, different rhythm) */}
        <Facade
          nearX={592}
          eaveY={286}
          ridgeY={260}
          baseY={860}
          bays={[592, 520, 452, 398, 356, 328]}
          floors={[312, 404, 520, 660, 800]}
          d0={1.6}
          balcony={[1]}
        />
        <Tower />
        <Foreground />

        {/* fine nib */}
        <g className="nib text-gold" stroke="none">
          <path d="M0 0 L18 -6 L20 2 L3 9 Z" fill="currentColor" opacity={0.2} />
          <path d="M18 -6 L26 -7 L27 0 L20 2 Z" fill="currentColor" />
          <circle cx={1.5} cy={5} r={1.6} fill="currentColor" />
        </g>
      </g>
    </svg>
  );
}
