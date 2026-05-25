'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  FileText,
  BookOpen,
  BarChart3,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: LayoutGrid },
  { href: '/groups', label: 'My Groups', icon: BookOpen },
  { href: '/assignments', label: 'Assignments', icon: FileText },
  { href: '/library', label: 'My Library', icon: BarChart3 },
  { href: '/create', label: 'Create New', icon: Sparkles },
] as const;

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1.5 flex-1" aria-label="Main navigation">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <Link
            key={label}
            href={href}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 ${
              isActive
                ? 'bg-white/15 text-white font-bold shadow-sm'
                : 'text-white/80 hover:bg-white/5 hover:text-white font-medium'
            }`}
          >
            <Icon className={`h-5 w-5 shrink-0 transition-transform ${isActive ? 'scale-105 text-primary' : 'text-white/60'}`} aria-hidden />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
