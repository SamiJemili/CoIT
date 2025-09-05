// lib/theme.ts
import React, { createContext, useContext } from 'react';

export const colors = {
   brand: '#2563EB',
  brandLight: '#DCE7FF',
   accent: '#0F172A',
  text: '#0F172A',
  subtext: '#64748B',
  border: '#E5E7EB',
  bg: '#FFFFFF',
  bubbleMe: '#E0F2FE',
  bubbleOther: '#F1F5F9',
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#FDE68A',
  dangerLight: '#F87171',
  info: '#93C5FD',
};

type Theme = {
  colors: typeof colors;
};

const ThemeContext = createContext<Theme>({ colors });

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <ThemeContext.Provider value={{ colors }}>{children}</ThemeContext.Provider>
);

export const useTheme = () => useContext(ThemeContext);

export function formatDate(d?: Date | null) {
  if (!d) return '';
  return d.toLocaleString();
}