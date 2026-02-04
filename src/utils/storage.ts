import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress } from '../types';
import { STORAGE_KEYS } from './constants';

export const saveUserProgress = async (progress: UserProgress): Promise<void> => {
  try {
    console.log('Storage: Saving user progress, reminderTime:', progress.reminderTime);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving user progress:', error);
  }
};

export const loadUserProgress = async (): Promise<UserProgress | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
    const parsed = data ? JSON.parse(data) : null;
    console.log('Storage: Loaded user progress, reminderTime:', parsed?.reminderTime);
    return parsed;
  } catch (error) {
    console.error('Error loading user progress:', error);
    return null;
  }
};

export const clearUserProgress = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROGRESS);
    await AsyncStorage.removeItem(STORAGE_KEYS.TIMER_STATE);
  } catch (error) {
    console.error('Error clearing user progress:', error);
  }
};
