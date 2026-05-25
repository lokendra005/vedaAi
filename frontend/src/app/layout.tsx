import type { Metadata, Viewport } from 'next';
import { AppShell } from '@/components/layout/AppShell';
import { displayFont, bodyFont } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'VedaAI — AI Assessment Creator',
  description: 'Create AI-powered question papers for teachers',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f6f6f6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="antialiased bg-bg-off-white text-text-primary font-body">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
