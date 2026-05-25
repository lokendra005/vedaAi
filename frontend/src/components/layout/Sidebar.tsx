import { Sparkles } from 'lucide-react';
import { SidebarNav } from './SidebarNav';
import { SidebarSchoolCard } from './SidebarSchoolCard';
import { SettingsLink } from './SettingsLink';

export function Sidebar() {
  return (
    <aside
      className="no-print hidden lg:flex lg:fixed lg:left-4 lg:top-4 lg:bottom-4 lg:z-40 w-64 flex-col rounded-2xl bg-bg-dark text-white p-4 shadow-xl overflow-y-auto"
      aria-label="Application sidebar"
    >
      <div className="flex items-center gap-3 px-2 py-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white font-bold"
          aria-hidden
        >
          V
        </div>
        <span className="font-display text-lg font-bold">VedaAI</span>
      </div>

      <p className="my-4 rounded-full bg-gradient-to-r from-primary/80 to-primary-dark px-4 py-3 flex items-center gap-2 text-sm font-medium text-white">
        <Sparkles className="h-4 w-4" aria-hidden />
        AI Teacher&apos;s Toolkit
      </p>

      <SidebarNav />

      <div className="mt-auto space-y-3 pt-4 border-t border-white/20">
        <SettingsLink />
        <SidebarSchoolCard />
      </div>
    </aside>
  );
}
