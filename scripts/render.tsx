import { renderToStaticMarkup } from "react-dom/server";
import { Resvg } from "@resvg/resvg-js";
import { writeFileSync } from "node:fs";
import React from "react";
import { StreetSketch } from "../src/components/StreetSketch";

// resvg ignores Tailwind classes + unsupported filters. We map color tokens to
// an explicit `color` attribute (so currentColor resolves) and strip the filter.
function build(ink: string) {
  let svg = renderToStaticMarkup(React.createElement(StreetSketch));
  svg = svg.replace(/filter="url\(#rs-ink\)"/g, "");
  svg = svg.replace(/<g class="nib[\s\S]*?<\/g>/, "");
  svg = svg.replace(/class="([^"]*)"/g, (_m, c: string) => {
    const col = c.includes("gold") ? "#C9A96E" : c.includes("success") ? "#3f7d5f" : ink;
    return `color="${col}"`;
  });
  return svg.replace("<svg ", `<svg xmlns="http://www.w3.org/2000/svg" `);
}

function png(svg: string, bg: string, file: string) {
  const r = new Resvg(svg, { fitTo: { mode: "width", value: 760 }, background: bg });
  writeFileSync(file, r.render().asPng());
  console.log("wrote", file);
}

png(build("#1a1a1a"), "#f5f0e8", "scene-day.png");
png(build("#e8e4dc"), "#0d0d0d", "scene-night.png");
