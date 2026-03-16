// src/app/page.tsx
import dynamic from 'next/dynamic';
import { Navigation } from '@/components/layout/site-header';
import { Footer } from '@/components/layout/footer';
import { Hero } from '@/components/home/Hero';
// import RedirectGuard from '@/hooks/useHome';

// HIGH PERFORMANCE: Lazily load heavy sections below the fold
const PainPoints = dynamic(() =>
  import('@/components/home/PainPoints').then((mod) => mod.PainPoints),
);
const Solutions = dynamic(() =>
  import('@/components/home/Solutions').then((mod) => mod.Solutions),
);
const BeforeAfter = dynamic(() => import('@/components/home/BeforeAfter'));
const HowItWorks = dynamic(() =>
  import('@/components/home/HowItWorks').then((mod) => mod.HowItWorks),
);
const Platforms = dynamic(() =>
  import('@/components/home/Platforms').then((mod) => mod.Platforms),
);
const Pricing = dynamic(() =>
  import('@/components/home/Pricing').then((mod) => mod.Pricing),
);
const Testimonials = dynamic(() =>
  import('@/components/home/Testimonials').then((mod) => mod.Testimonials),
);

export default function HomePage() {
  return (
    <>
      {/* Logic-only client component */}
      {/* <RedirectGuard /> */}
      <Navigation />
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <Hero />
          <PainPoints />
          <Solutions />
          <BeforeAfter />
          <HowItWorks />
          <Platforms />
          <Pricing />
          <Testimonials />
        </main>
      </div>
      <Footer />
    </>
  );
}
