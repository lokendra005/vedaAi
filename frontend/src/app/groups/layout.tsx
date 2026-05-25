import { ToastProvider } from '@/components/ui/ToastProvider';

export default function GroupsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastProvider />
    </>
  );
}
