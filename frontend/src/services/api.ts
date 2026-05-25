import type { Assignment, Group, JobStatus, QuestionPaper, TeacherSettings } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    cache: 'no-store',
    ...options,
  });
  const json = await res.json();
  if (!res.ok) {
    const msg = json.message || json.errors?.[0]?.message || 'Request failed';
    throw new Error(msg);
  }
  return json;
}

export async function fetchAssignments(): Promise<Assignment[]> {
  const res = await request<{ data: Assignment[] }>('/api/assignments');
  return res.data;
}

export async function fetchAssignment(id: string): Promise<{
  assignment: Assignment;
  paper: QuestionPaper | null;
  jobStatus: JobStatus | null;
}> {
  const res = await request<{
    data: {
      assignment: Assignment;
      paper: QuestionPaper | null;
      jobStatus: JobStatus | null;
    };
  }>(`/api/assignments/${id}`);
  return res.data;
}

export async function createAssignment(formData: FormData): Promise<{ assignment: Assignment }> {
  const res = await request<{ data: { assignment: Assignment } }>('/api/assignments', {
    method: 'POST',
    body: formData,
  });
  return res.data;
}

export async function regenerateAssignment(
  id: string,
  scope: 'full' | 'section',
  sectionTitle?: string
): Promise<void> {
  await request(`/api/assignments/${id}/regenerate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scope, sectionTitle }),
  });
}

export function getPdfUrl(assignmentId: string): string {
  return `${API_URL}/api/assignments/${assignmentId}/pdf`;
}

export async function fetchGroups(): Promise<Group[]> {
  const res = await request<{ data: Group[] }>('/api/groups');
  return res.data;
}

export async function createGroup(data: {
  name: string;
  grade: string;
  section: string;
  description?: string;
  studentCount?: number;
}): Promise<Group> {
  const res = await request<{ data: Group }>('/api/groups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteGroup(id: string): Promise<void> {
  await request(`/api/groups/${id}`, { method: 'DELETE' });
}

export async function fetchSettings(): Promise<TeacherSettings> {
  const res = await request<{
    data: TeacherSettings & { _id?: string; key?: string };
  }>('/api/settings');
  const { schoolName, schoolLocation, defaultGrade, defaultMarksPerQuestion, defaultDifficulty } =
    res.data;
  return { schoolName, schoolLocation, defaultGrade, defaultMarksPerQuestion, defaultDifficulty };
}

export async function updateSettings(data: Partial<TeacherSettings>): Promise<TeacherSettings> {
  const res = await request<{ data: TeacherSettings }>('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const d = res.data;
  return {
    schoolName: d.schoolName,
    schoolLocation: d.schoolLocation,
    defaultGrade: d.defaultGrade,
    defaultMarksPerQuestion: d.defaultMarksPerQuestion,
    defaultDifficulty: d.defaultDifficulty,
  };
}
