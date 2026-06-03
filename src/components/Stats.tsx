const stats = [
  { value: "50", suffix: " M€", label: "Actifs sous gestion" },
  { value: "2015", suffix: "", label: "Family office depuis" },
  { value: "100", suffix: " %", label: "Indépendant & sur-mesure" },
  { value: "FR / INT", suffix: "", label: "Investisseurs accompagnés" },
];

export function Stats() {
  return (
    <section id="chiffres" className="border-y border-line bg-surface py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="relative bg-card px-6 py-10 text-center"
            >
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-0.5"
                style={{
                  background:
                    "linear-gradient(90deg, var(--color-gold-dark), var(--color-gold))",
                }}
              />
              <div className="font-numbers tnum text-4xl tracking-[0.04em] text-ink sm:text-5xl">
                {s.value}
                <span className="text-gold">{s.suffix}</span>
              </div>
              <div className="mt-3 text-[10px] uppercase tracking-[0.15em] text-muted">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
