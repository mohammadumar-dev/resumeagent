import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/landing/hero";
import { ProblemSection } from "@/components/landing/problem";
import { PipelineSection } from "@/components/landing/pipeline";
import { ArchitectureSection } from "@/components/landing/architecture";
import { BenefitsSection } from "@/components/landing/benefits";
import { TemplatesSection } from "@/components/landing/templates";
import { TechStackSection } from "@/components/landing/tech-stack";
import { CTASection } from "@/components/landing/cta";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 md:px-6 lg:px-8">
        <HeroSection />
        <ProblemSection />
        <PipelineSection />
        <ArchitectureSection />
        <BenefitsSection />
        <TemplatesSection />
        <TechStackSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}