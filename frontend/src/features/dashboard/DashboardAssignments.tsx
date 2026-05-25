import Link from 'next/link';
import { fetchAssignmentsServer } from '@/lib/server-api';
import { formatDate } from '@/utils/formatDate';

export async function DashboardAssignments() {
  const assignments = await fetchAssignmentsServer();

  if (assignments.length === 0) {
    return (
      <section className="mt-8 text-center max-w-xl mx-auto glass-card rounded-[32px] p-8 md:p-12 space-y-6" aria-labelledby="empty-heading">
        <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto drop-shadow-lg">
          <rect x="35" y="35" width="80" height="100" rx="16" fill="#181818" />
          <rect x="45" y="25" width="80" height="100" rx="16" fill="#ff5623" />
          <rect x="55" y="15" width="80" height="100" rx="16" fill="#FFFFFF" stroke="#181818" strokeWidth="4" />
          <path d="M75 45H115" stroke="#181818" strokeWidth="4" strokeLinecap="round" />
          <path d="M75 60H115" stroke="#181818" strokeWidth="4" strokeLinecap="round" />
          <path d="M75 75H105" stroke="#181818" strokeWidth="4" strokeLinecap="round" />
          <circle cx="75" cy="115" r="16" fill="#4bc26d" />
          <path d="M69 115L73 119L81 111" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M130 15L133 22L140 20L135 26L141 31L134 32L131 39L127 32L120 31L126 26L121 20L126 22L130 15Z" fill="#ff5623" />
          <path d="M22 85L24 90L29 88L26 93L30 96L25 97L23 103L20 97L15 96L19 93L16 88L20 90L22 85Z" fill="#DADADA" />
        </svg>

        <div className="space-y-3">
          <h2 id="empty-heading" className="text-xl md:text-2xl font-bold font-display text-text-primary">
            No assignments yet
          </h2>
          <p className="text-sm md:text-base text-text-secondary leading-relaxed max-w-md mx-auto">
            Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
          </p>
        </div>

        <Link
          href="/create"
          className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold bg-[#181818] text-white hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-md shadow-black/15"
        >
          <span className="text-base font-bold">+</span>
          <span>Create Your First Assignment</span>
        </Link>
      </section>
    );
  }

  return (
    <>
      <div className="flex items-center justify-end mb-4">
        <Link
          href="/create"
          className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold bg-[#181818] text-white hover:bg-black hover:scale-[1.02] active:scale-95 transition-all shadow-sm"
        >
          + New Assignment
        </Link>
      </div>
      <ul className="grid gap-2 list-none p-0 m-0" role="list">
        {assignments.slice(0, 8).map((a) => (
          <li key={a._id}>
            <Link
              href={`/assignments/${a._id}`}
              className="surface-card rounded-xl px-4 py-3 flex items-center justify-between gap-3 hover:shadow-md transition-shadow group block"
            >
              <div className="min-w-0">
                <h2 className="text-sm font-semibold truncate group-hover:text-primary-dark transition-colors">
                  {a.title}
                </h2>
                <p className="text-xs text-text-secondary truncate">
                  {a.subject} · Due {formatDate(a.dueDate)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                  a.status === 'completed'
                    ? 'bg-green-100 text-green-900'
                    : a.status === 'failed'
                      ? 'bg-red-100 text-red-900'
                      : 'bg-amber-100 text-amber-900'
                }`}
              >
                {a.status}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {assignments.length > 8 && (
        <p className="mt-4 text-sm text-center">
          <Link href="/assignments" className="text-primary-dark font-medium underline">
            View all {assignments.length} assignments
          </Link>
        </p>
      )}
    </>
  );
}
