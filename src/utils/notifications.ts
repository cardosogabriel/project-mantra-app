import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
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
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time for your daily mantra practice! 🧘',
        body: 'Continue your 40-day journey',
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
  if (day % 10 !== 0) return;

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
  await Notifications.cancelAllScheduledNotificationsAsync();
};
