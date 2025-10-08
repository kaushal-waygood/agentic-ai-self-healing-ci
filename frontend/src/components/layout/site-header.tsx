'use client';
import { Button } from '@/components/ui/button';
import { RootState } from '@/redux/rootReducer';
import { Menu, X, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';

// Helper function to get a cookie by name from the browser
const getCookie = (name: string): string | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
};

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const router = useRouter();

  // On component mount, check if the access token cookie exists
  useEffect(() => {
    const accessToken = getCookie('accessToken');
    setToken(accessToken);
  }, []);

  const navItems = [
    { name: 'Features', href: '/#platforms' },
    { name: 'How it Works', href: '/#how-it-works' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'Success Stories', href: '/#testimonials' },
  ];

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      setSearchQuery('');

      if (token) {
        router.push(`/dashboard/search-jobs?query=${encodedQuery}`);
      } else {
        router.push(`/search-jobs?query=${encodedQuery}`);
      }

      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    // To log out, we expire the cookie by setting its date to the past
    document.cookie =
      'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setToken(undefined); // Clear the token from state
    router.push('/login'); // Redirect to the login page
  };

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 bg-white/50 backdrop-blur-3xl border-b border-black/10 border-b-1 py-4">
      {/* Enhanced background gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/8 via-indigo-500/6 to-cyan-400/8"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-transparent"></div>

      {/* Subtle mesh pattern overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      ></div>

      <div className="relative container mx-auto px-6">
        <div className="flex items-center justify-between h-18">
          <div className="flex items-center">
            <div className="relative group">
              <div className="relative flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
                  {/* <Sparkles className="w-4 h-4 text-white" /> */}
                  <img src="/logo.png" alt="abc" />
                </div>
                <Link
                  href={'/'}
                  className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent"
                >
                  ZobsAI
                </Link>
              </div>
            </div>
          </div>

          {/* Enhanced Desktop Search Box */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full group">
              {/* Enhanced glow effect */}
              <div
                className={`absolute -inset-1 bg-gradient-to-r from-violet-500/40 via-indigo-500/40 to-cyan-500/40 rounded-2xl blur-xl transition-all duration-500 ${
                  isSearchFocused
                    ? 'opacity-100 scale-105'
                    : 'opacity-30 scale-100'
                }`}
              ></div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-white/10 rounded-2xl"></div>
                <div className="relative flex items-center">
                  <button
                    onClick={handleSearchSubmit}
                    aria-label="Search"
                    className="absolute left-4 w-5 h-5 text-gray-400 transition-all duration-300 group-hover:text-violet-500 group-hover:scale-110 focus:outline-none"
                  >
                    <Search />
                  </button>
                  <input
                    type="text"
                    placeholder="Search features, docs, help..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchSubmit();
                      }
                    }}
                    className="w-full pl-12 pr-6 py-4 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-white/30 transition-all duration-300 hover:bg-white/15 text-sm font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item, index) => (
              <a
                key={item.name}
                href={item.href}
                className="relative px-4 py-2 text-gray-700 hover:text-violet-600 transition-all duration-300 font-medium group rounded-xl"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Hover background */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100"></div>

                <span className="relative z-10 text-sm">{item.name}</span>

                {/* Enhanced underline animation */}
                <div className="absolute inset-x-2 -bottom-0.5 h-0.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-center rounded-full"></div>
              </a>
            ))}
          </div>

          {/* Enhanced Desktop CTA - Conditional Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {token ? (
              <>
                <Link href="/dashboard">
                  <Button className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-700 hover:via-indigo-700 hover:to-cyan-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm rounded-xl px-6 py-3 font-semibold text-sm border border-white/20">
                    <span className="relative z-10">Dashboard</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={'/login'}
                  className="px-5 py-3 rounded-xl text-gray-700 hover:text-violet-600 hover:bg-white/15 backdrop-blur-sm transition-all duration-300 hover:shadow-lg font-medium text-sm border border-transparent hover:border-white/20"
                >
                  Sign In
                </Link>
                <Button
                  onClick={() => router.push('/signup')}
                  className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-700 hover:via-indigo-700 hover:to-cyan-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm rounded-xl px-6 py-3 font-semibold text-sm border border-white/20"
                >
                  <span className="relative z-10">Start Free Trial</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </>
            )}
          </div>

          {/* Enhanced Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="relative hover:bg-white/15 backdrop-blur-sm transition-all duration-300 rounded-xl p-3 border border-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              <div
                className={`transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : 'rotate-0'
                }`}
              >
                {isOpen ? (
                  <X className="w-5 h-5 relative z-10 text-gray-700" />
                ) : (
                  <Menu className="w-5 h-5 relative z-10 text-gray-700" />
                )}
              </div>
            </Button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden relative mt-4 mb-6">
            {/* Enhanced mobile menu background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/15 to-white/5 backdrop-blur-3xl rounded-3xl border border-white/20 shadow-2xl"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/8 via-indigo-500/5 to-cyan-500/8 rounded-3xl"></div>

            {/* Subtle pattern overlay for mobile */}
            <div
              className="absolute inset-0 opacity-30 rounded-3xl"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)`,
                backgroundSize: '20px 20px',
              }}
            ></div>

            <div className="relative p-8 space-y-8">
              {/* Enhanced Mobile Search */}
              <div className="relative group">
                <div
                  className={`absolute -inset-1 bg-gradient-to-r from-violet-500/30 to-cyan-500/30 rounded-2xl blur transition-all duration-300 ${
                    isSearchFocused
                      ? 'opacity-100 scale-105'
                      : 'opacity-50 scale-100'
                  }`}
                ></div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl"></div>
                  <div className="relative flex items-center">
                    <button
                      onClick={handleSearchSubmit}
                      aria-label="Search"
                      className="absolute left-4 w-5 h-5 text-gray-400 transition-colors duration-200 group-hover:text-violet-500 focus:outline-none"
                    >
                      <Search />
                    </button>
                    <input
                      type="text"
                      placeholder="Search features, docs, help..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearchSubmit();
                        }
                      }}
                      className="w-full pl-12 pr-6 py-4 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-white/30 transition-all duration-300 hover:bg-white/15 text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Enhanced mobile navigation items */}
              <div className="space-y-2">
                {navItems.map((item, index) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block text-gray-700 hover:text-violet-600 transition-all duration-300 font-medium py-4 px-6 rounded-2xl hover:bg-white/15 backdrop-blur-sm group relative overflow-hidden"
                    onClick={() => setIsOpen(false)}
                    style={{
                      animationDelay: `${index * 75}ms`,
                      animation: 'slideInFromRight 0.6s ease-out forwards',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center justify-between">
                      <span className="text-base">{item.name}</span>
                      <div className="w-2 h-2 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"></div>
                    </span>
                  </a>
                ))}
              </div>

              {/* Enhanced Mobile CTA - Conditional Buttons */}
              <div className="pt-6 border-t border-white/20 space-y-4">
                {token ? (
                  <>
                    <Link href="/dashboard" className="w-full block">
                      <Button className="w-full relative overflow-hidden bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-700 hover:via-indigo-700 hover:to-cyan-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] rounded-2xl py-4 font-semibold text-base border border-white/20">
                        <span className="relative z-10">Dashboard</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                      </Button>
                    </Link>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full px-6 py-4 rounded-2xl text-gray-700 bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:shadow-lg border border-white/20 font-medium text-base"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href={'/login'}
                      className="w-full inline-flex items-center justify-center px-6 py-4 rounded-2xl text-gray-700 hover:text-violet-600 hover:bg-white/15 backdrop-blur-sm transition-all duration-300 hover:shadow-lg border border-white/20 font-medium text-base"
                    >
                      Sign In
                    </Link>
                    <Button
                      onClick={() => router.push('/signup')}
                      className="w-full relative overflow-hidden bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-700 hover:via-indigo-700 hover:to-cyan-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] rounded-2xl py-4 font-semibold text-base border border-white/20"
                    >
                      <span className="relative z-10">Start Free Trial</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add keyframe animation for mobile menu items */}
      <style jsx>{`
        @keyframes slideInFromRight {
          0% {
            opacity: 0;
            transform: translateX(20px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </nav>
  );
};
