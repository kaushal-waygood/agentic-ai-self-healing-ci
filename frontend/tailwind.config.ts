import { table } from 'console';
import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    // extend: {
    //   colors: {
    //     border: '#d3cfcfff',
    //     input: '#d3cfcfff',
    //     ring: 'hsl(var(--ring))',
    //     background: 'hsl(var(--background))',
    //     foreground: 'hsl(var(--foreground))',
    //     primary: {
    //       DEFAULT: 'hsl(var(--primary))',
    //       foreground: '#fff',
    //       glow: 'hsl(var(--primary-glow))',
    //     },
    //     secondary: {
    //       DEFAULT: 'hsl(var(--secondary))',
    //       foreground: 'hsl(var(--secondary-foreground))',
    //     },
    //     muted: {
    //       DEFAULT: 'hsl(var(--muted))',
    //       foreground: 'hsl(var(--muted-foreground))',
    //     },
    //     accent: {
    //       DEFAULT: 'hsl(var(--accent))',
    //       foreground: 'hsl(var(--accent-foreground))',
    //       glow: 'hsl(var(--accent-glow))',
    //     },
    //     success: {
    //       DEFAULT: 'hsl(var(--success))',
    //       foreground: 'hsl(var(--success-foreground))',
    //       glow: 'hsl(var(--success-glow))',
    //     },
    //     card: {
    //       DEFAULT: 'hsl(var(--card))',
    //       foreground: 'hsl(var(--card-foreground))',
    //       border: 'hsl(var(--card-border))',
    //     },
    //     sidebar: {
    //       DEFAULT: 'hsl(var(--sidebar-background))',
    //       foreground: 'hsl(var(--sidebar-foreground))',
    //       primary: 'hsl(var(--sidebar-primary))',
    //       'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    //       accent: 'hsl(var(--sidebar-accent))',
    //       'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    //       border: 'hsl(var(--sidebar-border))',
    //       ring: 'hsl(var(--sidebar-ring))',
    //     },
    //   },
    //   backgroundImage: {
    //     'gradient-hero': 'var(--gradient-hero)',
    //     'gradient-card': 'var(--gradient-card)',
    //     'gradient-accent': 'var(--gradient-accent)',
    //     'gradient-success': 'var(--gradient-success)',
    //   },
    //   boxShadow: {
    //     glow: 'var(--shadow-glow)',
    //     accent: 'var(--shadow-accent)',
    //     card: 'var(--shadow-card)',
    //     elegant: 'var(--shadow-elegant)',
    //   },
    //   transitionTimingFunction: {
    //     smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    //     bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    //   },
    //   borderRadius: {
    //     lg: 'var(--radius)',
    //     md: 'calc(var(--radius) - 2px)',
    //     sm: 'calc(var(--radius) - 4px)',
    //   },
    //   keyframes: {
    //     'accordion-down': {
    //       from: {
    //         height: '0',
    //       },
    //       to: {
    //         height: 'var(--radix-accordion-content-height)',
    //       },
    //     },
    //     'accordion-up': {
    //       from: {
    //         height: 'var(--radix-accordion-content-height)',
    //       },
    //       to: {
    //         height: '0',
    //       },
    //     },
    //     'fade-in': {
    //       '0%': {
    //         opacity: '0',
    //         transform: 'translateY(20px)',
    //       },
    //       '100%': {
    //         opacity: '1',
    //         transform: 'translateY(0)',
    //       },
    //     },
    //     'slide-up': {
    //       '0%': {
    //         opacity: '0',
    //         transform: 'translateY(50px)',
    //       },
    //       '100%': {
    //         opacity: '1',
    //         transform: 'translateY(0)',
    //       },
    //     },
    //     'glow-pulse': {
    //       '0%, 100%': {
    //         boxShadow: '0 0 40px hsl(259 100% 65% / 0.3)',
    //       },
    //       '50%': {
    //         boxShadow:
    //           '0 0 60px hsl(259 100% 65% / 0.5), 0 0 100px hsl(191 100% 55% / 0.3)',
    //       },
    //     },
    //     float: {
    //       '0%, 100%': { transform: 'translateY(0px)' },
    //       '50%': { transform: 'translateY(-10px)' },
    //     },
    //   },
    //   animation: {
    //     'accordion-down': 'accordion-down 0.2s ease-out',
    //     'accordion-up': 'accordion-up 0.2s ease-out',
    //     'fade-in': 'fade-in 0.6s ease-out',
    //     'slide-up': 'slide-up 0.8s ease-out',
    //     'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
    //     float: 'float 6s ease-in-out infinite',
    //   },
    //   fontFamily: {
    //     sans: ['var(--font-poppins)'],
    //     heading: ['var(--font-pt-sans)'],
    //   },
    // },
    // extend: {
    //   colors: {
    //     border: 'hsl(var(--border))',
    //     input: 'hsl(var(--input))',
    //     ring: 'hsl(var(--ring))',

    //     background: 'hsl(var(--background))',
    //     foreground: 'hsl(var(--foreground))',

    //     primary: {
    //       DEFAULT: 'hsl(var(--primary))',
    //       foreground: 'hsl(var(--primary-foreground))',
    //       glow: 'hsl(var(--primary-glow))',
    //     },

    //     secondary: {
    //       DEFAULT: 'hsl(var(--secondary))',
    //       foreground: 'hsl(var(--secondary-foreground))',
    //     },

    //     muted: {
    //       DEFAULT: 'hsl(var(--muted))',
    //       foreground: 'hsl(var(--muted-foreground))',
    //     },

    //     accent: {
    //       DEFAULT: 'hsl(var(--accent))',
    //       foreground: 'hsl(var(--accent-foreground))',
    //     },

    //     card: {
    //       DEFAULT: 'hsl(var(--card))',
    //       foreground: 'hsl(var(--card-foreground))',
    //       border: 'hsl(var(--card-border))',
    //     },
    //     backgroundImage: {
    //       'gradient-primary': 'var(--gradient-primary)',
    //     },
    //   },
    // },

    extend: {
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['var(--font-plus-jakarta)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        buttonPrimary: 'var(--button-primary)',
        headingTextPrimary: 'var(--heading-text-primary)',
        tabPrimary: 'var(--tab-primary)',

        background: 'var(--background)',
        foreground: 'var(--foreground)',

        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
          glow: 'var(--primary-glow)',
        },

        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },

        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },

        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },

        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
          border: 'var(--card-border)',
        },
      },

      backgroundImage: {
        'header-gradient-primary': 'var(--header-gradient-primary)',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
} satisfies Config;
