import { Logo } from "./Logo";
import { site } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-surface py-14">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <a href="#top" className="text-lg" aria-label={`${site.name} — accueil`}>
              <Logo />
            </a>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {site.tagline} indépendant à {site.address.city}. {site.description}
            </p>
          </div>

          <nav aria-label="Pied de page" className="flex gap-16">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-faint">
                Navigation
              </h3>
              <ul className="mt-4 space-y-3">
                {site.nav.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="text-sm text-muted transition-colors hover:text-gold"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-faint">
                Suivez-nous
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    href={site.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted transition-colors hover:text-gold"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href={site.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted transition-colors hover:text-gold"
                  >
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {year} {site.legalName}. Tous droits réservés.
          </span>
          <span>Conçu avec exigence — Paris.</span>
        </div>
      </div>
    </footer>
  );
}
