import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { COLORS, FONTS, FONT_WEIGHTS } from '../utils/constants';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { BellIcon } from '../components/icons/BellIcon';
import { RestartIcon } from '../components/icons/RestartIcon';
import { commonStyles } from '../styles/commonStyles';
import {
  scheduleDailyReminder,
  cancelAllNotifications,
  requestNotificationPermissions,
} from '../utils/notifications';
import { clearUserProgress } from '../utils/storage';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userProgress, setReminderTime, resetProgress, isLoading } = useApp();

  console.log('SettingsScreen: Initial userProgress.reminderTime:', userProgress.reminderTime);
  const [reminderEnabled, setReminderEnabled] = useState(userProgress.reminderEnabled);
  const [selectedTime, setSelectedTime] = useState(userProgress.reminderTime || '21:00');
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  // Sync local state with userProgress when it changes
  useEffect(() => {
    console.log('SettingsScreen: Syncing reminder time from userProgress:', userProgress.reminderTime);
    setReminderEnabled(userProgress.reminderEnabled);
    setSelectedTime(userProgress.reminderTime || '21:00');
  }, [userProgress.reminderEnabled, userProgress.reminderTime]);

  // Generate time options (00:00 to 23:00)
  const times = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  const handleToggleReminder = async (enabled: boolean) => {
    setReminderEnabled(enabled);

    if (enabled) {
      const granted = await requestNotificationPermissions();
      if (granted) {
        const [hours, minutes] = selectedTime.split(':').map(Number);
        await scheduleDailyReminder(hours, minutes);
      }
      // Save the reminder preference even on web (where notifications aren't supported)
      await setReminderTime(selectedTime, true);
    } else {
      await cancelAllNotifications();
      await setReminderTime(null, false);
    }
  };

  const handleTimeChange = async (newTime: string) => {
    setSelectedTime(newTime);
    if (reminderEnabled) {
      const [hours, minutes] = newTime.split(':').map(Number);
      await scheduleDailyReminder(hours, minutes);
      await setReminderTime(newTime, true);
    }
  };

  const handleRestartPractice = async () => {
    console.log('handleRestartPractice called');
    try {
      await cancelAllNotifications();
      console.log('Notifications cancelled');
      await clearUserProgress();
      console.log('User progress cleared');
      await resetProgress();
      console.log('Progress reset');
      setShowRestartConfirm(false);
      console.log('Navigating to OnboardingStep1');
      navigation.replace('OnboardingStep1');
    } catch (error) {
      console.error('Error during restart:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonContainer}>
          <Text style={styles.backButtonArrow}>←</Text>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Settings Card */}
        <View style={styles.mainCard}>
          {/* Daily Reminder Section */}
          <View style={styles.reminderHeader}>
            <BellIcon size={32} color={COLORS.accent} />
            <View style={styles.reminderHeaderText}>
              <Text style={styles.reminderTitle}>Daily Reminder</Text>
              <Text style={styles.reminderSubtitle}>Set for {selectedTime}</Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={handleToggleReminder}
              trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: COLORS.accent }}
              thumbColor={COLORS.white}
              ios_backgroundColor="rgba(255, 255, 255, 0.2)"
            />
          </View>

          {reminderEnabled && (
            <View style={styles.timePickerSection}>
              <Text style={styles.timePickerLabel}>Reminder time</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedTime}
                  onValueChange={(itemValue) => handleTimeChange(itemValue)}
                  style={styles.picker}
                  dropdownIconColor={COLORS.white}
                  itemStyle={styles.pickerItem}
                >
                  {times.map((time) => (
                    <Picker.Item
                      key={time}
                      label={time}
                      value={time}
                      color={COLORS.white}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          )}
        </View>

        {/* Restart Practice Card */}
        <View style={styles.restartCard}>
          <View style={styles.restartSection}>
            <RestartIcon size={32} color="#FF6B6B" />
            <View style={styles.restartContent}>
              <Text style={styles.restartTitle}>Restart Practice</Text>
              <Text style={styles.restartDescription}>
                This will reset all your progress and start the 40-day journey from the beginning.
              </Text>
            </View>
          </View>
          {!showRestartConfirm ? (
            <Button
              title="Restart Practice"
              onPress={() => setShowRestartConfirm(true)}
              variant="outlined"
              size="md"
              color="danger"
              style={styles.restartButton}
            />
          ) : (
            <View style={styles.confirmButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowRestartConfirm(false)}
                variant="outlined"
                size="md"
                color="accent"
                style={styles.confirmButton}
              />
              <Button
                title="Yes, restart"
                onPress={handleRestartPractice}
                variant="outlined"
                size="md"
                color="danger"
                style={styles.confirmButton}
              />
            </View>
          )}
        </View>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  backButtonArrow: {
    color: COLORS.textSecondary,
    fontSize: 24,
    marginRight: 8,
  },
  backButtonText: {
    color: COLORS.textSecondary,
    fontSize: 18,
    fontFamily: FONTS.medium,
    fontWeight: FONT_WEIGHTS.medium,
  },
  title: {
    color: COLORS.white,
    fontSize: 24,
    fontFamily: FONTS.medium,
    fontWeight: FONT_WEIGHTS.medium,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  mainCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderHeaderText: {
    flex: 1,
    marginLeft: 16,
  },
  reminderTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    fontWeight: FONT_WEIGHTS.semiBold,
    marginBottom: 4,
  },
  reminderSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  timePickerSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 20,
    marginTop: 16,
  },
  timePickerLabel: {
    color: COLORS.accent,
    fontSize: 18,
    fontFamily: FONTS.medium,
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: 12,
  },
  pickerContainer: {
    ...commonStyles.pickerContainer,
  },
  picker: {
    ...commonStyles.picker,
  },
  pickerItem: {
    ...commonStyles.pickerItem,
  },
  restartCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  restartSection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  restartContent: {
    flex: 1,
    marginLeft: 16,
  },
  restartTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    fontWeight: FONT_WEIGHTS.semiBold,
    marginBottom: 8,
  },
  restartDescription: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  restartButton: {
    width: '100%',
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
  },
});
