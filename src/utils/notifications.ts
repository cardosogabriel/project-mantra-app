import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00D9D9',
    });
  }

  return finalStatus === 'granted';
};

export const scheduleDailyReminder = async (
  hour: number,
  minute: number
): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Have you spent time with your mantra today? 🧘',
        body: 'You can log your practice anytime.',
        sound: true,
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });

    return id;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

export const scheduleMilestoneNotification = async (day: number): Promise<void> => {
  if (day % 10 !== 0 || Platform.OS === 'web') return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Congratulations! 🎉`,
        body: `You've completed ${day} days! Keep going!`,
        sound: true,
      },
      trigger: {
        seconds: 2,
      },
    });
  } catch (error) {
    console.error('Error scheduling milestone notification:', error);
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    return;
  }
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const cancelTodaysReminderAndReschedule = async (
  hour: number,
  minute: number
): Promise<void> => {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hour, minute, 0, 0);

    // Only reschedule if the reminder time hasn't passed today yet
    // If it already passed, the daily repeating notification will handle tomorrow
    if (now < reminderTime) {
      // Cancel all notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Reschedule starting from tomorrow
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Have you spent time with your mantra today? 🧘',
          body: 'You can log your practice anytime.',
          sound: true,
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });

      console.log('Cancelled today\'s reminder and rescheduled for tomorrow');
    } else {
      console.log('Reminder time already passed today, keeping schedule as is');
    }
  } catch (error) {
    console.error('Error cancelling today\'s reminder:', error);
  }
};
