import { CTA } from "@/components/landing/cta";
import { Features } from "@/components/landing/features";
import { LandingFooter } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingNavbar } from "@/components/landing/navbar";
import { Pricing } from "@/components/landing/pricing";
import { ScrollToTop } from "@/components/landing/scroll-to-top";
import { Testimonials } from "@/components/landing/testimonials";
import { UseCases } from "@/components/landing/use-cases";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <UseCases />
        <Pricing />
        <Testimonials />
        <CTA />
      </main>
      <LandingFooter />
      <ScrollToTop />
    </div>
  );
}
