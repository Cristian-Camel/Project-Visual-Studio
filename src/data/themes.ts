import { ThemeDefinition } from '../types/presentation';

export const THEMES: ThemeDefinition[] = [
  {
    id: 'aurora',
    name: 'Aurora',
    fontFamily: 'Inter, sans-serif',
    palette: {
      primary: '#2563EB',
      secondary: '#7C3AED',
      accent: '#06B6D4',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      text: '#0F172A',
    },
  },
  {
    id: 'corporate',
    name: 'Corporate',
    fontFamily: 'Manrope, sans-serif',
    palette: {
      primary: '#0F766E',
      secondary: '#1D4ED8',
      accent: '#F59E0B',
      background: '#F5F7FA',
      surface: '#FFFFFF',
      text: '#111827',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    fontFamily: 'Sora, sans-serif',
    palette: {
      primary: '#8B5CF6',
      secondary: '#EC4899',
      accent: '#22D3EE',
      background: '#0B1120',
      surface: '#111827',
      text: '#F3F4F6',
    },
  },
];
