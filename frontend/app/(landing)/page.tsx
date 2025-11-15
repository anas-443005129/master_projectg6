import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { UseCases } from "@/components/landing/use-cases";
import { Testimonials } from "@/components/landing/testimonials";
import { CTA } from "@/components/landing/cta";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { ScrollToTop } from "@/components/landing/scroll-to-top";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <UseCases />
        <Testimonials />
        <CTA />
      </main>
      <LandingFooter />
      <ScrollToTop />
    </div>
  );
}
