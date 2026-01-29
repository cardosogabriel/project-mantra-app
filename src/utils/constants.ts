import { Mantra } from '../types';

export const COLORS = {
  primary: '#3D2B5C',
  accent: '#00D9D9',
  yellow: '#FFE100',
  red: '#FF5252',
  white: '#FFFFFF',
  gray: '#9E9E9E',
  darkGray: '#424242',
  inputBorder: 'rgba(255, 255, 255, 0.66)',
  textSecondary: 'rgba(255, 255, 255, 0.66)',
};

import { Platform } from 'react-native';

export const FONTS = {
  regular: Platform.select({
    web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    default: 'Inter-Regular',
  }),
  medium: Platform.select({
    web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    default: 'Inter-Medium',
  }),
  semiBold: Platform.select({
    web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    default: 'Inter-SemiBold',
  }),
  bold: Platform.select({
    web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    default: 'Inter-Bold',
  }),
};

export const FONT_WEIGHTS = {
  regular: '400' as any,
  medium: '500' as any,
  semiBold: '600' as any,
  bold: '700' as any,
};

export const MANTRAS: Mantra[] = [
  {
    id: '1',
    name: 'Om Namo Narayanaya',
    description: 'I give respect to He who is in all things and who has all things inside Him.',
    youtubeUrl: 'https://www.youtube.com/watch?v=LawqEtFGYP8',
  },
  {
    id: '2',
    name: 'Sri Vitthala Giridhari Parabrahmane Namaha',
    description: 'My obeisances to the Supreme Lord, who is the refuge and protection of everyone.',
    youtubeUrl: 'https://www.youtube.com/watch?v=7SDbCv-Iwa0',
  },
];

export const getDayDuration = (day: number): number => {
  if (day <= 10) return 15;
  if (day <= 20) return 30;
  if (day <= 30) return 45;
  return 60;
};

export const STORAGE_KEYS = {
  USER_PROGRESS: '@user_progress',
  TIMER_STATE: '@timer_state',
};
