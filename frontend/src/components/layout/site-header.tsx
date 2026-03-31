'use client';

import { Button } from '@/components/ui/button';
import { getToken } from '@/hooks/useToken';
import { ArrowRight, Menu, Search, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Why ZobsAI?', href: '/#platforms' },
  { name: 'Pricing', href: '/#pricing' },
  { name: 'Success Stories', href: '/#testimonials' },
];

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const desktopSearchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isJobSearchPage =
    pathname.includes('/search-jobs') ||
    pathname.includes('/dashboard/search-jobs');
  const searchPath = token ? '/dashboard/search-jobs' : '/search-jobs';

  useEffect(() => {
    const accessToken = getToken();
    setToken(accessToken ?? undefined);
  }, []);

  useEffect(() => {
    if (!isDesktopSearchOpen) return;

    desktopSearchInputRef.current?.focus();
  }, [isDesktopSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(event.target as Node)
      ) {
        setIsDesktopSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = () => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      handleSearchRoute();
      return;
    }

    const encodedQuery = encodeURIComponent(trimmedQuery);
    setSearchQuery('');
    router.push(`${searchPath}?q=${encodedQuery}`);
    setIsOpen(false);
    setIsDesktopSearchOpen(false);
  };

  const handleSearchClick = () => {
    setIsDesktopSearchOpen(true);
  };

  const handleSearchRoute = () => {
    router.push(searchPath);
    setIsOpen(false);
    setIsDesktopSearchOpen(false);
  };

  const handleDesktopSearchClose = () => {
    setIsDesktopSearchOpen(false);
    setIsSearchFocused(false);
    setSearchQuery('');
  };

  const handleHomeClick = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    closeMenu = false,
  ) => {
    if (pathname !== '/') {
      if (closeMenu) setIsOpen(false);
      return;
    }

    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (closeMenu) setIsOpen(false);
  };

  const handleLogout = () => {
    document.cookie =
      'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setToken(undefined);
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 border-b border-[#edf0f6] bg-white">
      <div className="mx-auto flex h-[82px] w-full max-w-[1400px] items-center gap-6 px-5 sm:px-8 lg:px-10">
        <Link
          href="/"
          prefetch={false}
          onClick={(event) => handleHomeClick(event)}
          className="flex shrink-0 items-start gap-1"
        >
          <Image
            src="/logo.png"
            alt="ZobsAI"
            width={56}
            height={56}
            priority
            className="h-11 w-11 sm:h-[50px] sm:w-[50px]"
          />
          <span className="-ml-1 mt-[4px] flex flex-col leading-none sm:-ml-1.5 sm:mt-[8px]">
            <span className="bg-[linear-gradient(90deg,#7359f6_0%,#298be9_100%)] bg-clip-text text-[17px] font-extrabold tracking-[-0.04em] text-transparent sm:text-[19px]">
              ZobsAI
            </span>
            <span className="mt-[1px] pl-[2px] text-[7px] font-medium tracking-[0.03em] text-[#8c92a6] sm:text-[8px]">
              AI Job Assistant
            </span>
          </span>
        </Link>

        <div className="hidden flex-1 items-center justify-between lg:flex">
          <div className="ml-4 flex items-center gap-7 xl:gap-[42px]">
            {navItems.map((item) => {
              const isActive = item.name === 'Home' && pathname === '/';

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={false}
                  scroll
                  onClick={
                    item.name === 'Home'
                      ? (event) => handleHomeClick(event)
                      : undefined
                  }
                  className={`text-[15px] font-semibold transition-colors ${
                    isActive
                      ? 'text-[#5664f5]'
                      : 'text-[#2f374b] hover:text-[#5664f5]'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4 xl:gap-5">
            <div ref={desktopSearchRef} className="flex items-center">
              {isDesktopSearchOpen ? (
                <div
                  className={`flex h-10 w-[300px] items-center rounded-[14px] border bg-[#f7f8fb] pl-3 pr-2 shadow-none transition-colors xl:w-[322px] ${
                    isSearchFocused ? 'border-[#aeb8ff]' : 'border-[#d6dde8]'
                  }`}
                >
                  <button
                    type="button"
                    aria-label="Submit search"
                    onClick={handleSearchSubmit}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#8b91a3] transition-colors hover:text-[#5664f5]"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                  <input
                    ref={desktopSearchInputRef}
                    type="text"
                    value={searchQuery}
                    placeholder="Job title, preferences, keywords, or company"
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') handleSearchSubmit();
                      if (event.key === 'Escape') handleDesktopSearchClose();
                    }}
                    className="h-full flex-1 bg-transparent px-2 text-[11px] font-medium text-[#5c6478] outline-none placeholder:text-[#a7afc0]"
                  />
                  <button
                    type="button"
                    aria-label="Close search"
                    onClick={handleDesktopSearchClose}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#9aa1b5] transition-colors hover:bg-[#eef2f8] hover:text-[#5664f5]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  aria-label="Search jobs"
                  onClick={handleSearchClick}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#777d8e] transition-colors hover:bg-[#f5f7fc] hover:text-[#4c56ea]"
                >
                  <Search className="h-[30px] w-[30px] stroke-[1.8]" />
                </button>
              )}
            </div>

            {token ? (
              <Button
                asChild
                className="h-12 rounded-[16px] bg-[linear-gradient(90deg,#7b4df8_0%,#2793df_100%)] px-7 text-[15px] font-semibold text-white shadow-none transition-transform duration-200 hover:-translate-y-0.5 hover:opacity-95"
              >
                <Link href="/dashboard" prefetch={false}>
                  Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Link
                  href="/login"
                  prefetch={false}
                  className="inline-flex h-12 min-w-[126px] items-center justify-center rounded-[16px] border border-[#2f82f7] px-7 text-[15px] font-semibold text-[#5664f5] transition-colors hover:bg-[#f6f9ff]"
                >
                  Sign In
                </Link>

                <Button
                  asChild
                  className="h-12 min-w-[198px] rounded-[16px] bg-[linear-gradient(90deg,#7b4df8_0%,#2793df_100%)] px-7 text-[15px] font-semibold text-white shadow-none transition-transform duration-200 hover:-translate-y-0.5 hover:opacity-95"
                >
                  <Link href="/signup" prefetch={false}>
                    Start A Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="ml-auto lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen((open) => !open)}
            className="h-11 w-11 rounded-[14px] border border-[#e6eaf3] bg-white text-[#2f374b] hover:bg-[#f5f7fc] hover:text-[#5664f5]"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-[#edf0f6] bg-white lg:hidden">
          <div className="mx-auto w-full max-w-[1400px] px-5 py-4 sm:px-8">
            <div className="rounded-[24px] border border-[#e8ecf5] bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
              {!isJobSearchPage && (
                <div className="relative mb-4">
                  <button
                    type="button"
                    aria-label="Search"
                    onClick={handleSearchSubmit}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8d93a6] transition-colors hover:text-[#5664f5]"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') handleSearchSubmit();
                    }}
                    className={`h-12 w-full rounded-[16px] border bg-[#fbfcff] pl-12 pr-4 text-[15px] text-[#2f374b] outline-none transition-colors placeholder:text-[#9aa1b5] ${
                      isSearchFocused
                        ? 'border-[#91a8ff]'
                        : 'border-[#e5eaf4] focus:border-[#91a8ff]'
                    }`}
                  />
                </div>
              )}

              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={false}
                    scroll
                    onClick={
                      item.name === 'Home'
                        ? (event) => handleHomeClick(event, true)
                        : () => setIsOpen(false)
                    }
                    className={`block rounded-[16px] px-4 py-3 text-[15px] font-semibold transition-colors ${
                      item.name === 'Home' && pathname === '/'
                        ? 'bg-[#f5f7ff] text-[#5664f5]'
                        : 'text-[#2f374b] hover:bg-[#f7f9fc] hover:text-[#5664f5]'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-3 border-t border-[#edf0f6] pt-4">
                <button
                  type="button"
                  onClick={handleSearchRoute}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] border border-[#e5eaf4] bg-[#fbfcff] text-[15px] font-semibold text-[#2f374b] transition-colors hover:bg-[#f5f7fc] hover:text-[#5664f5]"
                >
                  <Search className="h-4 w-4" />
                  Search Jobs
                </button>

                {token ? (
                  <>
                    <Button
                      asChild
                      className="h-12 rounded-[16px] bg-[linear-gradient(90deg,#7b4df8_0%,#2793df_100%)] text-[15px] font-semibold text-white shadow-none"
                    >
                      <Link
                        href="/dashboard"
                        prefetch={false}
                        onClick={() => setIsOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleLogout}
                      className="h-12 rounded-[16px] border-[#d9e1f1] text-[15px] font-semibold text-[#2f374b] hover:bg-[#f7f9fc]"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      prefetch={false}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex h-12 items-center justify-center rounded-[16px] border border-[#2f82f7] text-[15px] font-semibold text-[#5664f5] transition-colors hover:bg-[#f6f9ff]"
                    >
                      Sign In
                    </Link>
                    <Button
                      asChild
                      className="h-12 rounded-[16px] bg-[linear-gradient(90deg,#7b4df8_0%,#2793df_100%)] text-[15px] font-semibold text-white shadow-none"
                    >
                      <Link
                        href="/signup"
                        prefetch={false}
                        onClick={() => setIsOpen(false)}
                      >
                        Start A Free Trial
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
