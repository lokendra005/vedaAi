import { ToastProvider } from '@/components/ui/ToastProvider';

export default function AssignmentDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastProvider />
    </>
  );
}
