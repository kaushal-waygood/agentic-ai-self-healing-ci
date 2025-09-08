'use client';
import { Button } from '@/components/ui/button';
import { Menu, X, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

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
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Success Stories', href: '#testimonials' },
  ];

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      setSearchQuery('');
      router.push(`/search-jobs?query=${encodedQuery}`);
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-cyan-500/5"></div>
      <div className="relative container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="relative">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent drop-shadow-sm">
                ZobsAI
              </h1>
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-lg blur opacity-30"></div>
            </div>
          </div>

          {/* Desktop Search Box */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <div
                className={`absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-xl blur transition-all duration-300 ${
                  isSearchFocused
                    ? 'opacity-100 scale-105'
                    : 'opacity-0 scale-100'
                }`}
              ></div>
              <div className="relative flex items-center">
                <button
                  onClick={handleSearchSubmit}
                  aria-label="Search"
                  className="absolute left-3 w-4 h-4 text-gray-400 transition-colors duration-200 group-hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
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
                  className="w-full pl-10 pr-12 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                />
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="relative text-gray-700 hover:text-purple-600 transition-all duration-300 font-medium group"
              >
                <span className="relative z-10">{item.name}</span>
                <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-purple-600 to-cyan-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </a>
            ))}
          </div>

          {/* Desktop CTA - Conditional Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {token ? (
              <>
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm">
                    Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={'/login'}
                  className="px-4 py-2 rounded-lg text-gray-700 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                >
                  Sign In
                </Link>
                <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm">
                  Start Free Trial
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="hover:bg-white/20 backdrop-blur-sm transition-all duration-300 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              {isOpen ? (
                <X className="w-6 h-6 relative z-10" />
              ) : (
                <Menu className="w-6 h-6 relative z-10" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 rounded-2xl"></div>
            <div className="relative p-6 space-y-6">
              {/* Mobile Search */}
              <div className="relative group">
                {/* ... (Mobile search input remains the same) ... */}
              </div>
              <div className="space-y-4">
                {navItems.map((item, index) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block text-gray-700 hover:text-purple-600 transition-all duration-300 font-medium py-2 px-4 rounded-lg hover:bg-white/20 backdrop-blur-sm group"
                    onClick={() => setIsOpen(false)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span className="relative">
                      {item.name}
                      <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-purple-600 to-cyan-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </span>
                  </a>
                ))}
              </div>
              {/* Mobile CTA - Conditional Buttons */}
              <div className="pt-4 border-t border-white/20 space-y-3">
                {token ? (
                  <>
                    <Link href="/dashboard" className="w-full">
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full px-4 py-2 rounded-lg text-gray-700 bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href={'/login'}
                      className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg text-gray-700 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                    >
                      Sign In
                    </Link>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      Start Free Trial
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
