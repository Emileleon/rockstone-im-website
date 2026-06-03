const expertises = [
  {
    n: "01",
    title: "Investissement",
    text: "Acquisition, détention et arbitrage d'actifs immobiliers alignés sur vos objectifs de rendement et de transmission.",
    points: ["Sourcing off-market", "Due diligence", "Structuration"],
  },
  {
    n: "02",
    title: "Conseil",
    text: "Conseil stratégique sur la valorisation, la restructuration et le repositionnement de vos actifs pour en maximiser la valeur.",
    points: ["Audit patrimonial", "Valorisation", "Repositionnement"],
  },
  {
    n: "03",
    title: "Asset Management",
    text: "Gestion active et reporting transparent de vos portefeuilles immobiliers, avec la rigueur d'experts dédiés.",
    points: ["Pilotage locatif", "Reporting", "Optimisation"],
  },
];

export function Expertise() {
  return (
    <section id="expertise" className="bg-canvas py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <header className="max-w-2xl">
          <p className="eyebrow mb-4">Nos métiers</p>
          <h2 className="font-display text-4xl font-light leading-tight text-ink sm:text-5xl">
            Trois expertises, une exigence
          </h2>
          <p className="mt-5 text-muted">
            De l&apos;acquisition à la gestion, nous couvrons l&apos;ensemble du
            cycle de vie de vos actifs immobiliers.
          </p>
        </header>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {expertises.map((e) => (
            <article
              key={e.n}
              className="group relative flex flex-col rounded-md border border-line bg-card p-8 transition-colors duration-300 hover:border-gold/50"
            >
              <span className="font-numbers text-3xl tracking-[0.04em] text-gold/40 transition-colors group-hover:text-gold">
                {e.n}
              </span>
              <h3 className="mt-5 font-display text-2xl font-medium text-ink">
                {e.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                {e.text}
              </p>
              <ul className="mt-6 space-y-2 border-t border-line pt-5">
                {e.points.map((p) => (
                  <li
                    key={p}
                    className="flex items-center gap-3 text-xs uppercase tracking-[0.08em] text-ink"
                  >
                    <span className="inline-block h-1 w-1 rounded-full bg-gold" />
                    {p}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
