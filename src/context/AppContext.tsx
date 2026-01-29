import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProgress, Mantra } from '../types';
import { loadUserProgress, saveUserProgress } from '../utils/storage';
import { getCurrentDate } from '../utils/helpers';

interface AppContextType {
  userProgress: UserProgress;
  updateProgress: (updates: Partial<UserProgress>) => Promise<void>;
  completeDay: (day: number) => Promise<void>;
  uncompleteDay: (day: number) => Promise<void>;
  setSelectedMantra: (mantra: Mantra) => Promise<void>;
  setReminderTime: (time: string | null, enabled: boolean) => Promise<void>;
  resetProgress: () => Promise<void>;
  isLoading: boolean;
}

const defaultProgress: UserProgress = {
  currentDay: 1,
  completedDays: [],
  selectedMantra: null,
  reminderTime: null,
  reminderEnabled: false,
  startDate: getCurrentDate(),
  lastActiveDate: getCurrentDate(),
  hasCompletedOnboarding: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [userProgress, setUserProgress] = useState<UserProgress>(defaultProgress);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const loaded = await loadUserProgress();
      if (loaded) {
        setUserProgress(loaded);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgress = async (updates: Partial<UserProgress>) => {
    const newProgress = { ...userProgress, ...updates };
    setUserProgress(newProgress);
    await saveUserProgress(newProgress);
  };

  const completeDay = async (day: number) => {
    if (!userProgress.completedDays.includes(day)) {
      const newCompletedDays = [...userProgress.completedDays, day].sort((a, b) => a - b);
      await updateProgress({ completedDays: newCompletedDays });
    }
  };

  const uncompleteDay = async (day: number) => {
    const newCompletedDays = userProgress.completedDays.filter(d => d !== day);
    await updateProgress({ completedDays: newCompletedDays });
  };

  const setSelectedMantra = async (mantra: Mantra) => {
    await updateProgress({ selectedMantra: mantra });
  };

  const setReminderTime = async (time: string | null, enabled: boolean) => {
    await updateProgress({ reminderTime: time, reminderEnabled: enabled });
  };

  const resetProgress = async () => {
    const newProgress = {
      ...defaultProgress,
      startDate: getCurrentDate(),
      lastActiveDate: getCurrentDate(),
    };
    setUserProgress(newProgress);
    await saveUserProgress(newProgress);
  };

  return (
    <AppContext.Provider
      value={{
        userProgress,
        updateProgress,
        completeDay,
        uncompleteDay,
        setSelectedMantra,
        setReminderTime,
        resetProgress,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
