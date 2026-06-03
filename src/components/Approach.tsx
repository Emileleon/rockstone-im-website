const values = [
  {
    title: "Transparence",
    text: "Un reporting clair et régulier. Vous gardez à tout moment la pleine visibilité sur vos actifs.",
  },
  {
    title: "Rigueur",
    text: "Une analyse méthodique et data-driven de chaque opportunité, sans concession sur la qualité.",
  },
  {
    title: "Indépendance",
    text: "Family office indépendant : nos recommandations servent uniquement vos intérêts.",
  },
  {
    title: "Confiance durable",
    text: "Une relation de long terme fondée sur la performance et l'alignement des intérêts.",
  },
];

export function Approach() {
  return (
    <section id="approche" className="border-t border-line bg-surface py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2 lg:px-10">
        <div>
          <p className="eyebrow mb-4">Notre approche</p>
          <h2 className="font-display text-4xl font-light leading-tight text-ink sm:text-5xl">
            L&apos;exigence d&apos;un expert,
            <span className="block text-gold">la proximité d&apos;un partenaire.</span>
          </h2>
          <p className="mt-6 max-w-md text-muted">
            Depuis 2015, nous offrons aux investisseurs privés la qualité et les
            outils dignes des plus grands experts immobiliers — augmentés,
            aujourd&apos;hui, par l&apos;intelligence artificielle.
          </p>

          {/* AI innovation highlight */}
          <div className="mt-10 rounded-md border border-gold/30 bg-canvas p-6">
            <p className="eyebrow mb-3">Innovation · 2026 → 2027</p>
            <h3 className="font-display text-xl text-ink">
              Une intelligence augmentée au service de vos décisions
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Analyse de marché assistée par IA, veille d&apos;opportunités en
              continu et <span className="text-ink">Adam</span>, notre
              conseiller IA disponible 24/7 pour accompagner chaque investisseur.
            </p>
          </div>
        </div>

        <div className="grid gap-px self-center overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2">
          {values.map((v) => (
            <div key={v.title} className="bg-card p-7">
              <h3 className="font-display text-xl text-gold">{v.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{v.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
