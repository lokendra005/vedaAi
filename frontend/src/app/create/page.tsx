'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AssignmentForm } from '@/features/assignment/AssignmentForm';
import { useAppStore } from '@/store/useAppStore';
import { fetchSettings } from '@/services/api';

export default function CreateAssignmentPage() {
  const { setSettings, applySettingsToForm } = useAppStore();

  useEffect(() => {
    fetchSettings()
      .then((s) => {
        setSettings(s);
        applySettingsToForm();
      })
      .catch(() => {});
  }, [setSettings, applySettingsToForm]);
  return (
    <div className="p-4 md:p-10 max-w-3xl mx-auto w-full">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow hover:bg-white transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full border-4 border-white shadow bg-gradient-to-br from-primary/30 to-primary flex items-center justify-center text-white font-bold">
            ✓
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-display">
              Create Assignment
            </h1>
            <p className="text-sm text-text-secondary">
              Set up a new assignment for your students
            </p>
          </div>
        </div>
      </div>
      <AssignmentForm />
    </div>
  );
}
