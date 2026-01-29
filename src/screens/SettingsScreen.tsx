import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../utils/constants';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { TimePicker } from '../components/TimePicker';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  scheduleDailyReminder,
  cancelAllNotifications,
  requestNotificationPermissions,
} from '../utils/notifications';
import { clearUserProgress } from '../utils/storage';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userProgress, setReminderTime, resetProgress } = useApp();

  const [reminderEnabled, setReminderEnabled] = useState(userProgress.reminderEnabled);
  const [reminderTime, setReminderTimeState] = useState(() => {
    if (userProgress.reminderTime) {
      const [hours, minutes] = userProgress.reminderTime.split(':').map(Number);
      return new Date(2024, 0, 1, hours, minutes);
    }
    return new Date(2024, 0, 1, 21, 0);
  });
  const [showRestartModal, setShowRestartModal] = useState(false);

  const handleToggleReminder = async (enabled: boolean) => {
    setReminderEnabled(enabled);

    if (enabled) {
      const granted = await requestNotificationPermissions();
      if (granted) {
        const hours = reminderTime.getHours();
        const minutes = reminderTime.getMinutes();
        await scheduleDailyReminder(hours, minutes);
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        await setReminderTime(timeString, true);
      } else {
        setReminderEnabled(false);
      }
    } else {
      await cancelAllNotifications();
      await setReminderTime(null, false);
    }
  };

  const handleTimeChange = async (newTime: Date) => {
    setReminderTimeState(newTime);

    if (reminderEnabled) {
      const hours = newTime.getHours();
      const minutes = newTime.getMinutes();
      await scheduleDailyReminder(hours, minutes);
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      await setReminderTime(timeString, true);
    }
  };

  const handleRestartPractice = async () => {
    await cancelAllNotifications();
    await clearUserProgress();
    await resetProgress();
    setShowRestartModal(false);
    navigation.replace('OnboardingStep1');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Reminder</Text>

          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Enable Reminder</Text>
            <Switch
              value={reminderEnabled}
              onValueChange={handleToggleReminder}
              trackColor={{ false: COLORS.darkGray, true: COLORS.accent }}
              thumbColor={COLORS.white}
            />
          </View>

          {reminderEnabled && (
            <View style={styles.timePickerContainer}>
              <Text style={styles.label}>Reminder Time</Text>
              <TimePicker value={reminderTime} onChange={handleTimeChange} />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Practice Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current Day:</Text>
              <Text style={styles.infoValue}>Day {userProgress.currentDay}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Days Completed:</Text>
              <Text style={styles.infoValue}>{userProgress.completedDays.length}/40</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Selected Mantra:</Text>
              <Text style={styles.infoValue} numberOfLines={2}>
                {userProgress.selectedMantra?.name}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <Button
            title="Restart Practice"
            onPress={() => setShowRestartModal(true)}
            variant="danger"
          />
          <Text style={styles.warningText}>
            This will clear all your progress and start from Day 1
          </Text>
        </View>
      </ScrollView>

      <ConfirmationModal
        visible={showRestartModal}
        title="Restart Practice?"
        message="Are you sure you want to restart your practice? This will delete all your progress and cannot be undone."
        confirmText="Yes, Restart"
        cancelText="Cancel"
        onConfirm={handleRestartPractice}
        onCancel={() => setShowRestartModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    color: COLORS.white,
    fontSize: 32,
    width: 40,
  },
  title: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  settingLabel: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  timePickerContainer: {
    marginTop: 8,
  },
  label: {
    color: COLORS.gray,
    fontSize: 14,
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  infoLabel: {
    color: COLORS.gray,
    fontSize: 14,
  },
  infoValue: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  warningText: {
    color: COLORS.red,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});
