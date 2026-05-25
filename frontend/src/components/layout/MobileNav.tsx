'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, FileText, Plus, BookOpen } from 'lucide-react';

const items: {
  href: string;
  icon: typeof LayoutGrid;
  label: string;
  shortLabel: string;
  accent?: boolean;
}[] = [
  { href: '/', icon: LayoutGrid, label: 'Home', shortLabel: 'Home' },
  { href: '/library', icon: BookOpen, label: 'Library', shortLabel: 'Library' },
  { href: '/create', icon: Plus, label: 'Create assignment', shortLabel: 'Create', accent: true },
  { href: '/assignments', icon: FileText, label: 'Assignments', shortLabel: 'Assignments' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="no-print lg:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/70 border-t border-border/40 px-4 py-2 shadow-2xl"
      aria-label="Mobile navigation"
    >
      <div className="flex justify-between items-center max-w-lg mx-auto">
        {items.map(({ href, icon: Icon, label, shortLabel, accent }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`flex flex-col items-center gap-1 p-2 text-[10px] min-w-[44px] min-h-[44px] justify-center transition-all ${
                isActive ? 'text-primary font-bold' : 'text-text-secondary'
              }`}
            >
              <span
                className={
                  accent
                    ? 'flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 -mt-6 hover:scale-105 active:scale-95 transition-transform'
                    : `flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                        isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary/70'
                      }`
                }
                aria-hidden
              >
                <Icon className={accent ? 'h-5 w-5' : 'h-4 w-4'} />
              </span>
              {!accent && <span>{shortLabel}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
