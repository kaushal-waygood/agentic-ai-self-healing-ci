'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const TRUSTED_AVATARS = [
  '/avatars/avatar-1.jpg',
  '/avatars/avatar-2.png',
  '/avatars/avatar-3.png',
  '/avatars/avatar-4.jpg',
  '/avatars/avatar-5.png',
];

const HERO_VISUAL = '/home/hero-collage-right.jpeg';
const HERO_BACKGROUND =
  'linear-gradient(115deg, #ebedfa 0%, #ebeffa 42%, #e9f2f9 100%)';

export const Hero = () => {
  const router = useRouter();

  const handleHowItWorks = () => {
    const section = document.getElementById('how-it-works');

    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    router.push('/#how-it-works');
  };

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: HERO_BACKGROUND }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[-3%] top-[-5%] h-36 w-36 rounded-full bg-[#e5e7ff]/8 blur-2xl" />
        <div className="absolute bottom-[-8%] right-[-4%] h-48 w-48 rounded-full bg-[#e2eeff]/10 blur-2xl" />
        <div className="absolute right-[13%] top-[20%] hidden h-[200px] w-[200px] rounded-full bg-[#e7f0ff]/12 blur-2xl lg:block" />
      </div>

      <div className="container relative mx-auto px-6 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14 lg:min-h-[calc(100vh-72px)] lg:px-12 lg:pb-20 lg:pt-16 xl:px-16">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-3 xl:grid-cols-[minmax(0,1.01fr)_minmax(0,0.91fr)] xl:gap-4">
          <div className="mx-auto max-w-[560px] text-center lg:mx-0 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-[#e9e5ff] px-3 py-1 text-[11px] font-semibold tracking-[0.01em] text-[#5c63d8] shadow-[0_10px_25px_rgba(92,99,216,0.08)]">
              <span className="h-2 w-2 rounded-full bg-[#6b72ff]" />
              15,000+ Professionals Hired With ZobsAI
            </div>

            <h1 className="mt-6 font-heading text-[3rem] font-extrabold leading-[0.96] tracking-[-0.04em] text-[#111827] sm:text-[4rem] lg:text-[4.4rem] xl:text-[4.7rem]">
              <span className="block">
                Get <span className="text-[#5664f5]">Hired faster</span>
              </span>
              <span className="mt-2 block">Let AI do the</span>
              <span className="mt-2 block">work</span>
            </h1>

            <div className="mt-6 space-y-2 text-[15px] leading-7 text-[#5f667c] sm:text-[17px] sm:leading-8">
              <p>Stop Applying Manually.</p>
              <p>
                ZobsAI{' '}
                <span className="font-semibold text-[#4e63ef]">
                  Tailors Your CV
                </span>
                ,{' '}
                <span className="font-semibold text-[#4e63ef]">
                  Writes Cover Letters
                </span>
                , And{' '}
                <span className="font-semibold text-[#4e63ef]">
                  Applies To Hundreds Of Jobs Daily
                </span>
                .
              </p>
              <p>So You Focus On Interviews, Not Applications.</p>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
              <Button
                onClick={() => router.push('/signup')}
                className="h-12 rounded-[16px] bg-[linear-gradient(90deg,#22a8da_0%,#5664f5_52%,#7356f5_100%)] px-6 text-[15px] font-bold text-white shadow-[0_14px_30px_rgba(86,100,245,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(86,100,245,0.24)]"
              >
                Start A Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleHowItWorks}
                className="h-12 rounded-[16px] border-[1.5px] border-[#67a8f6] bg-transparent px-6 text-[15px] font-bold text-[#5b63f2] shadow-none transition-colors hover:bg-white/60 hover:text-[#5b63f2]"
              >
                See How It Works
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4 lg:justify-start">
              <div className="flex -space-x-2">
                {TRUSTED_AVATARS.map((src, index) => (
                  <Image
                    key={src}
                    src={src}
                    alt={`Trusted professional ${index + 1}`}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full border-2 border-white object-cover shadow-sm"
                  />
                ))}
              </div>

              <div className="text-left leading-tight">
                <p className="text-[11px] font-semibold text-[#656d84]">
                  Trusted by
                </p>
                <p className="text-[10px] text-[#8a90a6] sm:text-[11px]">
                  15,000+ professionals worldwide
                </p>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[340px] lg:mr-0 lg:-ml-14 lg:mt-8 lg:max-w-[590px] xl:-ml-12 xl:mt-10 xl:max-w-[600px]">
            <div
              className="relative mx-auto aspect-[816/738] w-full"
              style={{
                WebkitMaskImage:
                  'radial-gradient(ellipse 88% 86% at 50% 50%, black 76%, transparent 100%)',
                maskImage:
                  'radial-gradient(ellipse 88% 86% at 50% 50%, black 76%, transparent 100%)',
              }}
            >
              <div
                className="absolute inset-0 rounded-[40px]"
                style={{ background: HERO_BACKGROUND }}
              />
              <Image
                src={HERO_VISUAL}
                alt="ZobsAI hero visual"
                fill
                priority
                sizes="(min-width: 1280px) 600px, (min-width: 1024px) 48vw, 340px"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
