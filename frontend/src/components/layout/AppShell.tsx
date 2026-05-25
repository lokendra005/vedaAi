import Link from 'next/link';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:left-4 focus:top-4 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <div className="relative min-h-screen lg:h-screen lg:overflow-hidden">
        <Sidebar />
        <main
          id="main-content"
          className="relative z-10 min-h-screen lg:min-h-0 lg:h-screen lg:overflow-y-auto lg:overflow-x-hidden lg:ml-[17rem] pb-24 lg:pb-4 lg:pr-4"
          tabIndex={-1}
        >
          {children}
        </main>
        <MobileNav />
      </div>
    </>
  );
}
