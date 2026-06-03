import { site, whatsappUrl } from "@/lib/site";

export function ContactCta() {
  return (
    <section id="contact" className="relative overflow-hidden bg-canvas py-24 lg:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 rule-gold"
      />
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
        <p className="eyebrow mb-5">Échangeons</p>
        <h2 className="font-display text-4xl font-light leading-tight text-ink sm:text-5xl">
          Parlons de votre stratégie patrimoniale
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-muted">
          Adam, notre conseiller IA, répond instantanément sur WhatsApp et
          prépare votre échange avec nos experts. Confidentiel et sans engagement.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={whatsappUrl(
              "Bonjour Adam, je souhaite prendre rendez-vous avec un expert Rockstone IM."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xs bg-gold px-8 py-4 text-xs font-medium uppercase tracking-[0.1em] text-obsidian transition-colors hover:bg-gold-light"
          >
            Discuter sur WhatsApp
          </a>
          <a
            href={`mailto:${site.email}`}
            className="inline-flex items-center justify-center gap-2 rounded-xs border border-line px-8 py-4 text-xs font-medium uppercase tracking-[0.1em] text-ink transition-colors hover:border-gold hover:text-gold"
          >
            {site.email}
          </a>
        </div>

        <div className="mt-12 flex flex-col items-center gap-1 text-sm text-muted">
          <span>{site.legalName}</span>
          <span>
            {site.address.street}, {site.address.postalCode} {site.address.city}
          </span>
          <a href={site.phoneHref} className="transition-colors hover:text-gold">
            {site.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
