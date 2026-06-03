"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { site, whatsappUrl } from "@/lib/site";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-surface/90 backdrop-blur-md border-b border-line"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-5 lg:px-10"
        aria-label="Navigation principale"
      >
        <a href="#top" className="mr-auto text-lg" aria-label={`${site.name} — accueil`}>
          <Logo />
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {site.nav.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="text-[11px] uppercase tracking-[0.12em] text-muted transition-colors hover:text-ink"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <ThemeToggle className="hidden md:inline-flex" />

        <a
          href={whatsappUrl("Bonjour, je souhaite échanger avec Adam au sujet de mon projet immobilier.")}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden rounded-xs bg-gold px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.1em] text-obsidian transition-colors hover:bg-gold-light md:inline-flex"
        >
          Échanger avec Adam
        </a>

        <ThemeToggle className="md:hidden" />

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center text-ink md:hidden"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
        >
          <span className="relative block h-3.5 w-5">
            <span
              className={`absolute left-0 block h-px w-5 bg-current transition-transform ${
                open ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-1.5 block h-px w-5 bg-current transition-opacity ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 block h-px w-5 bg-current transition-transform ${
                open ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-line bg-surface md:hidden">
          <ul className="flex flex-col px-6 py-4">
            {site.nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-sm uppercase tracking-[0.12em] text-muted transition-colors hover:text-gold"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="pt-3">
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="inline-flex w-full items-center justify-center rounded-xs bg-gold px-5 py-3 text-[11px] font-medium uppercase tracking-[0.1em] text-obsidian"
              >
                Échanger avec Adam
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
