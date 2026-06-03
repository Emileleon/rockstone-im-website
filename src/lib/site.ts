/**
 * Central site configuration — single source of truth for brand & contact data.
 * Values sourced from public records; replace the WhatsApp number with the
 * dedicated WhatsApp Business line once provisioned.
 */
export const site = {
  name: "Rockstone IM",
  legalName: "Rockstone Investment Management",
  tagline: "Multi-Family Office Immobilier",
  foundedYear: 2015,
  description:
    "Multi-Family Office immobilier indépendant. Investissement, Conseil et Asset Management au service des investisseurs privés.",
  address: {
    street: "6 bis avenue Mac Mahon",
    postalCode: "75017",
    city: "Paris",
    country: "France",
  },
  phone: "+33 1 40 07 87 80",
  phoneHref: "tel:+33140078780",
  email: "contact@rockstone-im.com",
  // Dedicated WhatsApp Business number (digits only, intl format). Placeholder.
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "33000000000",
  social: {
    linkedin: "https://fr.linkedin.com/company/rockstone-im",
    instagram: "https://www.instagram.com/rockstone_familyoffice/",
  },
  nav: [
    { label: "Expertise", href: "#expertise" },
    { label: "Approche", href: "#approche" },
    { label: "Chiffres", href: "#chiffres" },
    { label: "Contact", href: "#contact" },
  ],
} as const;

/** Build a click-to-chat WhatsApp URL with an optional prefilled message. */
export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${site.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
