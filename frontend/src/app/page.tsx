import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/layout/site-header';
import Link from 'next/link';
import { CheckCircle, Rocket, Brain, Award, Zap } from 'lucide-react';
import { Footer } from '@/components/layout/footer';
import { Hero } from '@/components/home/Hero';
import BeforeAfter from '@/components/home/BeforeAfter';
import { CTA } from '@/components/home/CTA';
import { HowItWorks } from '@/components/home/HowItWorks';
import { PainPoints } from '@/components/home/PainPoints';
import { Pricing } from '@/components/home/Pricing';
import { Testimonials } from '@/components/home/Testimonials';
import { Platforms } from '@/components/home/Platforms';
import { Solutions } from '@/components/home/Solutions';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1">
        {/* Hero Section Redesigned */}
        <Hero />
        <PainPoints />
        <Solutions />
        <BeforeAfter />
        <HowItWorks />
        <Platforms />
        <Pricing />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
