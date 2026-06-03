import { site, whatsappUrl } from "@/lib/site";
import { ParisSketch } from "./ParisSketch";

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-canvas pt-36 pb-0 lg:pt-44"
    >
      {/* Ambient gold glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/3 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full opacity-[0.07] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--color-gold) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <p className="eyebrow mb-6 flex items-center gap-3">
          <span className="inline-block h-px w-8 bg-gold" />
          {site.tagline} · Paris · depuis {site.foundedYear}
        </p>

        <h1 className="max-w-4xl font-display text-5xl font-light leading-[1.05] text-ink sm:text-6xl lg:text-7xl">
          Votre patrimoine immobilier,
          <span className="block text-gold">géré avec exigence.</span>
        </h1>

        <p className="mt-8 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          Family office indépendant, nous accompagnons les investisseurs privés,
          français et internationaux, dans l&apos;optimisation de leur stratégie
          immobilière — avec la transparence et la rigueur d&apos;experts dédiés.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <a
            href={whatsappUrl(
              "Bonjour Adam, je souhaite être accompagné sur ma stratégie immobilière."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xs bg-gold px-7 py-3.5 text-xs font-medium uppercase tracking-[0.1em] text-obsidian transition-colors hover:bg-gold-light"
          >
            Parler à Adam, notre conseiller IA
          </a>
          <a
            href="#expertise"
            className="inline-flex items-center justify-center gap-2 rounded-xs border border-line px-7 py-3.5 text-xs font-medium uppercase tracking-[0.1em] text-ink transition-colors hover:border-gold hover:text-gold"
          >
            Découvrir nos expertises
          </a>
        </div>
      </div>

      {/* Animated panoramic pencil fresco: Haussmann · Champ de Mars · Eiffel */}
      <div
        className="relative mt-10 h-[42vw] max-h-[30rem] min-h-[16rem] w-full"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent, black 8%, black 92%, transparent), linear-gradient(black, black)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <ParisSketch />
      </div>
    </section>
  );
}
