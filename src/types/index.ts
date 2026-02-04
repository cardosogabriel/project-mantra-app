export interface Mantra {
  id: string;
  name: string;
  description: string;
  youtubeUrl: string;
}

export interface UserProgress {
  currentDay: number;
  completedDays: number[];
  selectedMantra: Mantra | null;
  reminderTime: string | null;
  reminderEnabled: boolean;
  startDate: string;
  lastActiveDate: string;
  hasCompletedOnboarding: boolean;
  dayRemainingTime?: { [day: number]: number };
}

export interface DayCompletion {
  day: number;
  completedAt: string;
  duration: number;
}

export type TimerState = 'idle' | 'running' | 'paused' | 'completed';
