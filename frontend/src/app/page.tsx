import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DashboardAssignments } from '@/features/dashboard/DashboardAssignments';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto w-full">
      <PageHeader title="Dashboard" description="Your recent assignments" />
      <Suspense fallback={null}>
        <DashboardAssignments />
      </Suspense>
    </div>
  );
}
