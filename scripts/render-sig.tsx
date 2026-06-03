import { renderToStaticMarkup } from "react-dom/server";
import { Resvg } from "@resvg/resvg-js";
import { writeFileSync } from "node:fs";
import React from "react";
import { SignatureFlourish } from "../src/components/SignatureFlourish";

function build(ink: string) {
  let svg = renderToStaticMarkup(React.createElement(SignatureFlourish));
  svg = svg.replace(/<g class="nib[\s\S]*?<\/g>\s*<\/g>/, ""); // strip pen (offset-path unsupported)
  svg = svg.replace(/class="([^"]*)"/g, (_m, c: string) => {
    const col = c.includes("gold") ? "#C9A96E" : c.includes("line") ? "#2c2c2e" : ink;
    return `color="${col}"`;
  });
  return svg.replace("<svg ", `<svg xmlns="http://www.w3.org/2000/svg" `);
}

function png(svg: string, bg: string, file: string) {
  const r = new Resvg(svg, { fitTo: { mode: "width", value: 760 }, background: bg });
  writeFileSync(file, r.render().asPng());
  console.log("wrote", file);
}

png(build("#e8e4dc"), "#0d0d0d", "sig-night.png");
