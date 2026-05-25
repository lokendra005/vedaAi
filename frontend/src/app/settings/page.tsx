'use client';

import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '@/store/useAppStore';
import { fetchSettings, updateSettings } from '@/services/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DifficultySlider } from '@/features/assignment/DifficultySlider';
import { Skeleton } from '@/components/ui/Skeleton';

export default function SettingsPage() {
  const { settings, setSettings } = useAppStore();
  const [local, setLocal] = useState(settings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings()
      .then((s) => {
        setSettings(s);
        setLocal(s);
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, [setSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateSettings(local);
      setSettings(updated);
      setLocal(updated);
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <SettingsIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-display">
            Settings
          </h1>
          <p className="text-text-secondary">
            School profile and defaults for new assignments
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="glass-card rounded-[32px] p-6 md:p-8 space-y-6">
        <div>
          <h2 className="font-bold mb-1">School Profile</h2>
          <p className="text-sm text-text-secondary">Shown on question papers and PDFs</p>
        </div>
        <Input
          label="School Name"
          value={local.schoolName}
          onChange={(e) => setLocal({ ...local, schoolName: e.target.value })}
        />
        <Input
          label="Location"
          value={local.schoolLocation}
          onChange={(e) => setLocal({ ...local, schoolLocation: e.target.value })}
        />

        <hr className="border-border" />

        <div>
          <h2 className="font-bold mb-1">Assignment Defaults</h2>
          <p className="text-sm text-text-secondary">Pre-filled when creating new assignments</p>
        </div>
        <Input
          label="Default Grade"
          value={local.defaultGrade}
          onChange={(e) => setLocal({ ...local, defaultGrade: e.target.value })}
        />
        <Input
          label="Default Marks per Question"
          type="number"
          min={1}
          value={String(local.defaultMarksPerQuestion)}
          onChange={(e) =>
            setLocal({
              ...local,
              defaultMarksPerQuestion: Math.max(1, Number(e.target.value) || 1),
            })
          }
        />
        <DifficultySlider
          value={local.defaultDifficulty}
          onChange={(defaultDifficulty) => setLocal({ ...local, defaultDifficulty })}
        />

        <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />}>
          Save Settings
        </Button>
      </form>
    </div>
  );
}
