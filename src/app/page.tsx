import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { Expertise } from "@/components/Expertise";
import { Approach } from "@/components/Approach";
import { ContactCta } from "@/components/ContactCta";
import { SiteFooter } from "@/components/SiteFooter";
import { AdamConcierge } from "@/components/AdamConcierge";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Stats />
        <Expertise />
        <Approach />
        <ContactCta />
      </main>
      <SiteFooter />
      <AdamConcierge />
    </>
  );
}
