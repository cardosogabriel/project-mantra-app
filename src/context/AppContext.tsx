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
  setDayRemainingTime: (day: number, remainingTime: number) => Promise<void>;
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
  dayRemainingTime: {},
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
        // Check if a new day has started
        const today = getCurrentDate();
        const lastActive = loaded.lastActiveDate;

        // If lastActiveDate is not set or invalid, initialize it to today
        if (!lastActive || lastActive < loaded.startDate) {
          const updatedProgress = { ...loaded, lastActiveDate: today };
          setUserProgress(updatedProgress);
          await saveUserProgress(updatedProgress);
        } else if (lastActive !== today) {
          // Calculate days passed
          const lastActiveDate = new Date(lastActive + 'T00:00:00');
          const todayDate = new Date(today + 'T00:00:00');
          const daysPassed = Math.floor((todayDate.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));

          console.log('Days passed:', daysPassed, 'Current day:', loaded.currentDay);

          if (daysPassed > 0 && daysPassed <= 7 && loaded.currentDay < 40) {
            // Only advance if less than a week has passed (to prevent jumping too far)
            const newCurrentDay = Math.min(40, loaded.currentDay + daysPassed);
            const updatedProgress = {
              ...loaded,
              currentDay: newCurrentDay,
              lastActiveDate: today,
            };
            setUserProgress(updatedProgress);
            await saveUserProgress(updatedProgress);
          } else {
            // Just update last active date
            const updatedProgress = { ...loaded, lastActiveDate: today };
            setUserProgress(updatedProgress);
            await saveUserProgress(updatedProgress);
          }
        } else {
          setUserProgress(loaded);
        }
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
    console.log('completeDay called for day:', day, 'type:', typeof day);
    console.log('Current completedDays:', userProgress.completedDays);
    // Normalize to numbers for comparison
    const normalizedDays = userProgress.completedDays.map(d => Number(d));
    console.log('Normalized completedDays:', normalizedDays);
    if (!normalizedDays.includes(day)) {
      const newCompletedDays = [...normalizedDays, day].sort((a, b) => a - b);
      console.log('New completedDays:', newCompletedDays);
      await updateProgress({ completedDays: newCompletedDays });
      console.log('After updateProgress, completedDays:', userProgress.completedDays);
    } else {
      console.log('Day already completed');
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
    console.log('AppContext: setReminderTime called with:', { time, enabled });
    await updateProgress({ reminderTime: time, reminderEnabled: enabled });
    console.log('AppContext: Reminder time updated in context');
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

  const setDayRemainingTime = async (day: number, remainingTime: number) => {
    const newDayRemainingTime = {
      ...(userProgress.dayRemainingTime || {}),
      [day]: remainingTime,
    };
    await updateProgress({ dayRemainingTime: newDayRemainingTime });
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
        setDayRemainingTime,
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
