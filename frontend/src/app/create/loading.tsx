import { PageHeader } from '@/components/layout/PageHeader';

export default function CreateLoading() {
  return (
    <div className="p-4 md:p-10 max-w-3xl mx-auto w-full">
      <PageHeader title="Create Assignment" description="Set up a new assignment for your students" />
      <div className="surface-card rounded-[32px] h-96" aria-hidden />
    </div>
  );
}
