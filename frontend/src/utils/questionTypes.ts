export function isMcqSection(sectionTitle: string): boolean {
  const t = sectionTitle.toLowerCase();
  return t.includes('mcq') || t.includes('multiple choice');
}
