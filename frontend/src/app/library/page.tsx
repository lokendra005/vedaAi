import { Suspense } from 'react';
import Link from 'next/link';
import { BookOpen, FileText } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { fetchAssignmentsServer } from '@/lib/server-api';
import { formatDate } from '@/utils/formatDate';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

async function LibraryList() {
  const papers = (await fetchAssignmentsServer()).filter((a) => a.status === 'completed');

  if (papers.length === 0) {
    return (
      <section
        className="surface-card rounded-[32px] p-10 md:p-12 max-w-lg mx-auto text-center"
        aria-labelledby="library-empty"
      >
        <div
          className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6"
          aria-hidden
        >
          <BookOpen className="h-10 w-10 text-primary" />
        </div>
        <h2 id="library-empty" className="text-xl font-bold font-display mb-2">
          Your library is empty
        </h2>
        <p className="text-text-secondary mb-6">
          Completed question papers will be saved here automatically.
        </p>
        <Link href="/create">
          <Button size="lg">Create Assignment</Button>
        </Link>
      </section>
    );
  }

  return (
    <ul className="grid gap-3 list-none p-0 m-0">
      {papers.map((a) => (
        <li key={a._id}>
          <Link
            href={`/assignments/${a._id}`}
            className="surface-card rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow group block"
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10"
              aria-hidden
            >
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold group-hover:text-primary transition-colors truncate">
                {a.title}
              </h2>
              <p className="text-sm text-text-secondary">
                {a.subject} · {a.totalQuestions} questions · {formatDate(a.createdAt)}
              </p>
            </div>
            <span className="text-xs font-medium text-success shrink-0">Ready</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function MyLibraryPage() {
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto w-full">
      <PageHeader
        title="My Library"
        description="Saved question papers and generated assessments"
      />
      <Suspense
        fallback={
          <div className="space-y-3" aria-busy="true" aria-label="Loading library">
            {[1, 2, 3].map((i) => (
              <div key={i} className="surface-card rounded-2xl h-20 bg-bg-off-white" />
            ))}
          </div>
        }
      >
        <LibraryList />
      </Suspense>
    </div>
  );
}
