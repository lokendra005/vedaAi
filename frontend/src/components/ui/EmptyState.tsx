import Link from 'next/link';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; href: string };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="glass-card rounded-[32px] p-12 max-w-lg space-y-6">
        <div className="mx-auto h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <h1 className="text-2xl font-bold font-display">{title}</h1>
        <p className="text-text-secondary">{description}</p>
        {action && (
          <Link href={action.href}>
            <Button size="lg">{action.label}</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
