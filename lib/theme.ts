// lib/theme.ts
export const colors = {
  brand: '#2563EB',
  brandLight: '#DCE7FF',
  text: '#0F172A',
  subtext: '#64748B',
  border: '#E5E7EB',
  bg: '#FFFFFF',
  bubbleMe: '#E0F2FE',
  bubbleOther: '#F1F5F9',
};

export function formatDate(d?: Date | null) {
  if (!d) return '';
  return d.toLocaleString();
}
