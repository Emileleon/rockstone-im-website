"use client";

import { useEffect, useRef } from "react";

/**
 * SignatureFlourish — a gold fountain pen that signs an elegant flourish in
 * one continuous stroke, loops (draw → hold → fade → redraw). The nib rides
 * the exact signature path via CSS motion path. Theme-aware; static under
 * prefers-reduced-motion.
 */

// one continuous, elegant paraphe
const SIG =
  "M36 172 C 72 92, 120 86, 128 150 C 134 200, 152 200, 170 156 C 186 116, 168 80, 146 90 C 126 99, 136 152, 172 164 C 220 180, 256 116, 308 140 C 356 162, 380 110, 430 132 C 474 151, 512 118, 560 100 C 508 192, 300 220, 128 196 C 276 212, 452 200, 590 168";

const DRAW = 3.6;
const HOLD = 1.8;
const FADE = 1.0;

export function SignatureFlourish({ className = "" }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const path = svg.querySelector<SVGPathElement>(".sig-path");
    const pen = svg.querySelector<SVGGElement>(".nib");
    if (!path) return;
    const cycle = DRAW + HOLD + FADE;
    const drawEnd = DRAW / cycle;
    const fadeStart = (DRAW + HOLD) / cycle;
    const anims: Animation[] = [];

    path.style.strokeDasharray = "1";
    anims.push(
      path.animate(
        [
          { strokeDashoffset: 1, opacity: 1, offset: 0 },
          { strokeDashoffset: 0, opacity: 1, offset: drawEnd },
          { strokeDashoffset: 0, opacity: 1, offset: fadeStart },
          { strokeDashoffset: 0, opacity: 0, offset: 1 },
        ],
        { duration: cycle * 1000, iterations: Infinity, easing: "ease-in-out" }
      )
    );

    if (pen) {
      anims.push(
        pen.animate(
          [
            { offsetDistance: "0%", opacity: 0, offset: 0 },
            { offsetDistance: "0%", opacity: 1, offset: 0.03 },
            { offsetDistance: "100%", opacity: 1, offset: drawEnd },
            { offsetDistance: "100%", opacity: 0, offset: Math.min(drawEnd + 0.05, 1) },
            { offsetDistance: "100%", opacity: 0, offset: 1 },
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
      viewBox="0 0 640 260"
      role="img"
      aria-label="Signature à la plume qui se trace"
      className={`h-full w-full overflow-visible ${className}`}
      fill="none"
    >
      {/* subtle baseline */}
      <line x1={36} y1={210} x2={604} y2={210} className="text-line" stroke="currentColor" strokeWidth={1} {...{ opacity: 0.6 }} />

      {/* the signature */}
      <path
        className="sig-path text-gold"
        d={SIG}
        pathLength={1}
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* fountain pen, nib tip at the path point (origin) */}
      <g
        className="nib"
        style={{ offsetPath: `path('${SIG}')`, offsetRotate: "-34deg", offsetAnchor: "0 0" } as React.CSSProperties}
      >
        <g transform="rotate(34)">
          {/* nib */}
          <path d="M0 0 L7 -26 L15 -22 L5 4 Z" className="text-gold-light" fill="currentColor" />
          <path d="M3 -10 L9 -13" className="text-gold-dark" stroke="currentColor" strokeWidth={0.8} />
          {/* barrel */}
          <path d="M7 -26 L34 -78 Q40 -88 48 -82 L20 -22 Z" className="text-ink" fill="currentColor" />
          <path d="M34 -78 L48 -82" className="text-gold" stroke="currentColor" strokeWidth={3} />
        </g>
      </g>
    </svg>
  );
}
