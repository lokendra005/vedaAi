import { Bricolage_Grotesque, Inter } from 'next/font/google';

export const displayFont = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'optional',
  preload: true,
  adjustFontFallback: true,
  weight: ['700'],
});

export const bodyFont = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'optional',
  preload: true,
  adjustFontFallback: true,
  weight: ['400', '500', '600'],
});
