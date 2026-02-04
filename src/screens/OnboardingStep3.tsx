import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { COLORS, FONTS, FONT_WEIGHTS } from '../utils/constants';
import { Button } from '../components/Button';
import { useApp } from '../context/AppContext';
import { requestNotificationPermissions, scheduleDailyReminder } from '../utils/notifications';
import { commonStyles } from '../styles/commonStyles';

export const OnboardingStep3: React.FC = () => {
  const navigation = useNavigation<any>();
  const { setReminderTime } = useApp();
  const [selectedTime, setSelectedTime] = useState<string>('21:00');

  const handleSetReminder = async () => {
    console.log('OnboardingStep3: Saving reminder time:', selectedTime);
    const granted = await requestNotificationPermissions();
    if (granted) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      await scheduleDailyReminder(hours, minutes);
    }
    // Save the reminder preference even on web (where notifications aren't supported)
    await setReminderTime(selectedTime, true);
    console.log('OnboardingStep3: Reminder time saved');
    navigation.navigate('Preparing');
  };

  const handleSkip = async () => {
    await setReminderTime(null, false);
    navigation.navigate('Preparing');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const times = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/project-mantra-logo-turquoise.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        <Text style={styles.title}>We recommend a daily{'\n'}reminder to check-in</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>At what time should we send it?</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedTime}
              onValueChange={(itemValue) => setSelectedTime(itemValue)}
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

        <View style={styles.footer}>
          <Button
            title="Set Reminder"
            onPress={handleSetReminder}
            variant="solid"
            size="lg"
            color="yellow"
            style={{ marginBottom: 16, width: '100%' }}
          />
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>Step 3 of 3</Text>
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
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1,
  },
  backButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 80,
  },
  title: {
    color: COLORS.white,
    fontSize: 24,
    fontFamily: FONTS.medium,
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 32,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardLabel: {
    color: COLORS.accent,
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    fontWeight: FONT_WEIGHTS.semiBold,
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
  footer: {
    paddingTop: 20,
  },
  skipButton: {
    marginBottom: 16,
    alignItems: 'center',
    padding: 12,
  },
  skipText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  stepIndicator: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
});
