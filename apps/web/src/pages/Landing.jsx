import { useState } from 'react';
import { Navbar } from '../components/landing/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { ComparisonSection } from '../components/landing/ComparisonSection';
import { ROICalculator } from '../components/landing/ROICalculator';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { DemoSection } from '../components/landing/DemoSection';
import { TestimonialsSection } from '../components/landing/TestimonialsSection';
import { PricingSection } from '../components/landing/PricingSection';
import { Footer } from '../components/landing/Footer';
import { MobileStickyCTA } from '../components/landing/MobileStickyCTA';

export default function Landing() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar onOpenContact={() => setIsContactModalOpen(true)} />
      <main>
        <HeroSection onOpenContact={() => setIsContactModalOpen(true)} />
        <FeaturesSection />
        <ComparisonSection />
        <ROICalculator />
        <HowItWorksSection onOpenContact={() => setIsContactModalOpen(true)} />
        <TestimonialsSection />
        <PricingSection />
        <DemoSection />
      </main>
      <Footer onOpenContact={() => setIsContactModalOpen(true)} />
      <MobileStickyCTA onOpenContact={() => setIsContactModalOpen(true)} />
    </div>
  );
}
