import { site, whatsappUrl } from "@/lib/site";
import { EiffelLine } from "./EiffelLine";

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-canvas pt-36 pb-20 lg:pt-44 lg:pb-28"
    >
      {/* Ambient gold glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/4 right-0 h-[50rem] w-[50rem] translate-x-1/4 rounded-full opacity-[0.06] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--color-gold) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <div>
          <p className="eyebrow mb-6 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-gold" />
            {site.tagline} · Paris · depuis {site.foundedYear}
          </p>

          <h1 className="font-display text-5xl font-light leading-[1.05] text-ink sm:text-6xl lg:text-7xl">
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

        {/* Restrained line study of the Eiffel Tower */}
        <div className="relative mx-auto h-[28rem] w-full max-w-[22rem] sm:h-[34rem] lg:h-[38rem]">
          <EiffelLine />
        </div>
      </div>
    </section>
  );
}
