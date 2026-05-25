import { ToastProvider } from '@/components/ui/ToastProvider';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastProvider />
    </>
  );
}
