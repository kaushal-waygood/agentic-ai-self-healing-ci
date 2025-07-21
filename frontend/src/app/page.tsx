import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/layout/site-header';
import Link from 'next/link';
import { CheckCircle, Rocket, Brain, Award, Zap } from 'lucide-react';
import { Footer } from '@/components/layout/footer';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section Redesigned */}
        <section className="w-full py-20 md:py-28 lg:py-32 bg-gradient-to-b from-sky-100 via-blue-50 to-background dark:from-slate-900 dark:via-slate-950 dark:to-background text-center">
          <div className="container px-4 md:px-6">
            {/* Accolades Section */}
            <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
              <div className="flex flex-col items-center p-3 border border-border rounded-lg shadow-sm bg-card/50 max-w-xs">
                <p className="text-xs text-muted-foreground">
                  Product of the month
                </p>
                <p className="text-sm font-semibold text-foreground">
                  PRODUCT HUNT
                </p>
                <p className="text-lg font-bold text-primary">1st</p>
              </div>
              <div className="flex flex-col items-center p-3 border border-border rounded-lg shadow-sm bg-card/50 max-w-xs">
                <p className="text-xs text-muted-foreground">Featured by</p>
                <p className="text-sm font-semibold text-foreground">OpenAI</p>
                <p className="text-lg font-bold text-primary">TOP PICK</p>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-gray-800 dark:text-gray-100">
              No More Solo Job Hunting
            </h1>
            <p className="mt-3 font-headline text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
              DO IT WITH <span className="text-primary">AI COPILOT</span>
            </p>

            {/* Sub-headline */}
            <p className="mt-6 max-w-2xl mx-auto text-muted-foreground md:text-lg">
              Our AI makes landing job interviews dramatically easier and
              faster! - get matched jobs, tailored resume, and recommended
              insider connections in less than 1 min!
            </p>

            {/* CTA Button */}
            <div className="mt-10">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-10 py-6 text-lg font-semibold rounded-full shadow-lg transform hover:scale-105 transition-transform duration-200"
                asChild
              >
                <Link href="/signup">Try CareerPilot for Free</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-card">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                  Key Features
                </div>
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">
                  Everything You Need to Succeed
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  CareerPilot offers a comprehensive suite of tools to
                  supercharge your job search.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
              <div className="grid gap-1 p-4 rounded-lg border hover:shadow-lg transition-shadow">
                <Rocket className="h-8 w-8 text-primary mb-2" />
                <h3 className="text-lg font-bold font-headline">
                  AI CV & Cover Letter
                </h3>
                <p className="text-sm text-muted-foreground">
                  Generate tailored application documents that highlight your
                  strengths for each specific role.
                </p>
              </div>
              <div className="grid gap-1 p-4 rounded-lg border hover:shadow-lg transition-shadow">
                <Brain className="h-8 w-8 text-primary mb-2" />
                <h3 className="text-lg font-bold font-headline">
                  Smart Job Matching
                </h3>
                <p className="text-sm text-muted-foreground">
                  Discover relevant job opportunities and understand your fit
                  with AI-powered matching scores.
                </p>
              </div>
              <div className="grid gap-1 p-4 rounded-lg border hover:shadow-lg transition-shadow">
                <CheckCircle className="h-8 w-8 text-primary mb-2" />
                <h3 className="text-lg font-bold font-headline">
                  Automated Applications
                </h3>
                <p className="text-sm text-muted-foreground">
                  Save time by letting CareerPilot handle parts of the
                  application process for you (Pro Tier).
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
