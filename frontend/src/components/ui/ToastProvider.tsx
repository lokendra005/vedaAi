'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          borderRadius: '16px',
          fontFamily: 'var(--font-body)',
        },
      }}
    />
  );
}
