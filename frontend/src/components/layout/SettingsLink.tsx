import Link from 'next/link';
import { Settings } from 'lucide-react';

export function SettingsLink() {
  return (
    <Link
      href="/settings"
      className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors text-white/90 hover:bg-white/10 hover:text-white"
    >
      <Settings className="h-5 w-5" aria-hidden />
      Settings
    </Link>
  );
}
