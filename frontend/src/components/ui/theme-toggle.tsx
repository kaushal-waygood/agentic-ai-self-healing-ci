'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="relative inline-flex h-9 w-16 items-center rounded-full
                 bg-muted border border-border transition-colors
                 focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {/* thumb */}
      <span
        className={`inline-flex h-7 w-7 items-center justify-center rounded-full
                    bg-background shadow-md transform transition-transform
                    ${isDark ? 'translate-x-8' : 'translate-x-1'}`}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-foreground" />
        ) : (
          <Sun className="h-4 w-4 text-foreground" />
        )}
      </span>
    </button>
  );
}

export default ThemeToggle;
