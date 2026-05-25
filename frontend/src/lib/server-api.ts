import type { Assignment, Group, TeacherSettings } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function serverFetch<T>(path: string, timeoutMs = 5000): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_URL}${path}`, {
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const json = await res.json();
    return json;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchAssignmentsServer(): Promise<Assignment[]> {
  try {
    const res = await serverFetch<{ data: Assignment[] }>('/api/assignments', 5000);
    return res.data;
  } catch {
    return [];
  }
}

export async function fetchGroupsServer(): Promise<Group[]> {
  try {
    const res = await serverFetch<{ data: Group[] }>('/api/groups', 5000);
    return res.data;
  } catch {
    return [];
  }
}

export async function fetchSettingsServer(): Promise<TeacherSettings | null> {
  try {
    const res = await serverFetch<{
      data: TeacherSettings & { _id?: string };
    }>('/api/settings', 5000);
    const { schoolName, schoolLocation, defaultGrade, defaultMarksPerQuestion, defaultDifficulty } =
      res.data;
    return { schoolName, schoolLocation, defaultGrade, defaultMarksPerQuestion, defaultDifficulty };
  } catch {
    return null;
  }
}
