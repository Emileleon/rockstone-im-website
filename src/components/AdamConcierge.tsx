"use client";

import { useEffect, useRef, useState } from "react";
import { site, whatsappUrl } from "@/lib/site";

type Msg = { from: "adam" | "user"; text: string };

const QUICK_REPLIES = [
  { label: "Investir dans l'immobilier" },
  { label: "Faire gérer mon bien" },
  { label: "Prendre rendez-vous" },
];

const GREETING: Msg = {
  from: "adam",
  text: "Bonjour, je suis Adam, le conseiller IA de Rockstone IM. Comment puis-je vous accompagner dans votre projet immobilier ?",
};

export function AdamConcierge() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open]);

  function send(text: string) {
    const value = text.trim();
    if (!value) return;
    setMessages((m) => [...m, { from: "user", text: value }]);
    setDraft("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          from: "adam",
          text: `Avec plaisir. Pour « ${value} », je vous mets en relation avec un expert sur WhatsApp afin d'échanger en toute confidentialité.`,
        },
      ]);
    }, 400);
  }

  const conversationText = messages
    .map((m) => (m.from === "user" ? `Vous : ${m.text}` : `Adam : ${m.text}`))
    .join("\n");

  return (
    <>
      {/* Floating trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer la conversation avec Adam" : "Discuter avec Adam, conseiller IA"}
        aria-expanded={open}
        className="group fixed bottom-6 right-6 z-50 inline-flex items-center gap-3 rounded-full bg-gold px-5 py-3.5 text-obsidian shadow-[var(--shadow-lg)] transition-transform hover:scale-[1.03] focus-visible:scale-[1.03]"
      >
        <span className="relative inline-flex h-6 w-6 items-center justify-center">
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-2 w-2 rounded-full bg-success ring-2 ring-gold" />
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-.9-3.8A8.38 8.38 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z" />
          </svg>
        </span>
        <span className="hidden text-[11px] font-medium uppercase tracking-[0.1em] sm:inline">
          {open ? "Fermer" : "Parler à Adam"}
        </span>
      </button>

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Conversation avec Adam"
          className="fixed bottom-24 right-6 z-50 flex w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-lg border border-line bg-card shadow-[var(--shadow-lg)]"
          style={{ height: "min(34rem, calc(100dvh - 8rem))" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-line bg-surface px-5 py-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 font-display text-lg text-gold">
              A
            </span>
            <div className="mr-auto">
              <p className="font-display text-lg leading-none text-ink">Adam</p>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
                Conseiller IA · en ligne
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xs text-muted transition-colors hover:text-gold"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.from === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <p
                  className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm leading-relaxed ${
                    m.from === "user" ? "bg-gold text-obsidian" : "bg-card-alt text-ink"
                  }`}
                >
                  {m.text}
                </p>
              </div>
            ))}

            {/* Quick replies */}
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_REPLIES.map((q) => (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => send(q.label)}
                    className="rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-gold hover:text-gold"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* WhatsApp CTA + input */}
          <div className="border-t border-line px-5 pt-3">
            <a
              href={whatsappUrl(
                `Bonjour Adam,\n\n${conversationText}\n\nJe souhaite poursuivre l'échange.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xs bg-success px-4 py-2.5 text-xs font-medium uppercase tracking-[0.08em] text-canvas transition-opacity hover:opacity-90"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.8 14.16c-.24.68-1.42 1.32-1.95 1.36-.5.05-1.13.21-3.66-.77-3.07-1.21-5.04-4.34-5.19-4.54-.15-.2-1.24-1.65-1.24-3.15s.79-2.24 1.07-2.54c.28-.3.6-.38.8-.38.2 0 .4 0 .57.01.18.01.43-.07.67.51.24.59.83 2.04.9 2.19.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.18-.31.4-.45.53-.15.15-.31.32-.13.61.17.3.77 1.27 1.66 2.06 1.14 1.02 2.1 1.33 2.4 1.48.3.15.47.13.64-.08.17-.2.74-.86.94-1.16.2-.3.4-.25.67-.15.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.13.07.72-.17 1.4z" />
              </svg>
              Continuer sur WhatsApp
            </a>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(draft);
              }}
              className="flex items-center gap-2 py-3"
            >
              <label htmlFor="adam-input" className="sr-only">
                Votre message à Adam
              </label>
              <input
                id="adam-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Écrivez votre message…"
                className="flex-1 rounded-xs border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-gold"
              />
              <button
                type="submit"
                aria-label="Envoyer le message"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xs bg-gold text-obsidian transition-colors hover:bg-gold-light"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </form>
            <p className="pb-3 text-center text-[10px] text-faint">
              Propulsé par l&apos;IA · {site.name}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
