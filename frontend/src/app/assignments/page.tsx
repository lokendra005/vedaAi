import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { fetchAssignmentsServer } from '@/lib/server-api';
import { formatDate } from '@/utils/formatDate';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

async function AssignmentsList() {
  const assignments = await fetchAssignmentsServer();

  if (assignments.length === 0) {
    return (
      <p className="text-text-secondary text-center py-12">
        No assignments yet.{' '}
        <Link href="/create" className="text-primary font-medium underline">
          Create one
        </Link>
      </p>
    );
  }

  return (
    <ul className="grid gap-3 list-none p-0 m-0">
      {assignments.map((a) => (
        <li key={a._id}>
          <Link
            href={`/assignments/${a._id}`}
            className="surface-card rounded-2xl p-5 hover:shadow-md transition-shadow block"
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <h2 className="font-semibold">{a.title}</h2>
                <p className="text-sm text-text-secondary">
                  {a.subject} · {a.totalQuestions} questions · {formatDate(a.dueDate)}
                </p>
              </div>
              <span className="text-xs font-medium capitalize px-2 py-1 rounded-full bg-bg-off-white">
                {a.status}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function AssignmentsPage() {
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <header>
          <h1 className="text-2xl font-bold font-display text-text-primary">Assignments</h1>
          <p className="text-text-secondary mt-1">All your assignments</p>
        </header>
        <Link href="/create" className="shrink-0 self-start sm:self-center">
          <Button icon={<Plus className="h-4 w-4" aria-hidden />}>Create New</Button>
        </Link>
      </div>
      <Suspense fallback={<div className="space-y-3" aria-busy="true">{[1,2,3].map(i => <div key={i} className="surface-card h-20 rounded-2xl" />)}</div>}>
        <AssignmentsList />
      </Suspense>
    </div>
  );
}
