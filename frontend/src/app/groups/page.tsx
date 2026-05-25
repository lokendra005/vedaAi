'use client';

import { useEffect, useState } from 'react';
import { Users, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchGroups, createGroup, deleteGroup } from '@/services/api';
import type { Group } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function MyGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    grade: '8',
    section: 'A',
    description: '',
    studentCount: 30,
  });

  const load = () => {
    setLoading(true);
    fetchGroups()
      .then(setGroups)
      .catch(() => toast.error('Failed to load groups'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Group name is required');
      return;
    }
    setSaving(true);
    try {
      await createGroup({
        name: form.name.trim(),
        grade: form.grade,
        section: form.section,
        description: form.description || undefined,
        studentCount: form.studentCount,
      });
      toast.success('Group created');
      setShowForm(false);
      setForm({ name: '', grade: '8', section: 'A', description: '', studentCount: 30 });
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create group');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete group "${name}"?`)) return;
    try {
      await deleteGroup(id);
      toast.success('Group deleted');
      load();
    } catch {
      toast.error('Failed to delete group');
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-display">
            My Groups
          </h1>
          <p className="text-text-secondary">
            Create and manage class sections for your students
          </p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Create Group'}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="glass-card rounded-[32px] p-6 md:p-8 mb-8 space-y-4"
        >
          <h2 className="font-bold font-display">New Group</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Group / Class Name"
              placeholder="e.g. Class 8-A Science"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Grade"
              value={form.grade}
              onChange={(e) => setForm({ ...form, grade: e.target.value })}
            />
            <Input
              label="Section"
              placeholder="e.g. A"
              value={form.section}
              onChange={(e) => setForm({ ...form, section: e.target.value })}
            />
            <Input
              label="Student Count"
              type="number"
              min={0}
              value={String(form.studentCount)}
              onChange={(e) =>
                setForm({ ...form, studentCount: Math.max(0, Number(e.target.value) || 0) })
              }
            />
          </div>
          <Input
            label="Description (optional)"
            placeholder="e.g. Morning batch, CBSE curriculum"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Button type="submit" loading={saving}>
            Save Group
          </Button>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12 text-primary" />}
          title="No groups yet"
          description="Create your first student group to organize classes by grade and section."
        />
      ) : (
        <div className="grid gap-4">
          {groups.map((g) => (
            <div
              key={g._id}
              className="glass-card rounded-2xl p-5 flex items-start justify-between gap-4"
            >
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{g.name}</h3>
                  <p className="text-sm text-text-secondary">
                    Grade {g.grade} · Section {g.section} · {g.studentCount} students
                  </p>
                  {g.description && (
                    <p className="text-sm text-text-muted mt-1">{g.description}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(g._id, g.name)}
                className="text-text-muted hover:text-red-500 p-2"
                aria-label="Delete group"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
