// app/fonts.js
import { Poppins, PT_Sans } from 'next/font/google';

export const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins', // Use CSS variable for the main body font
});

export const pt_sans = PT_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700'],
  variable: '--font-pt-sans', // Optional: for headings or specific elements
});
