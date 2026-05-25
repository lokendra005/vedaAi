import { ToastProvider } from '@/components/ui/ToastProvider';

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastProvider />
    </>
  );
}
