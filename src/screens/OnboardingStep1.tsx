import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { COLORS, FONTS, FONT_WEIGHTS } from '../utils/constants';
import { Button } from '../components/Button';
import { useApp } from '../context/AppContext';

export const OnboardingStep1: React.FC = () => {
  const navigation = useNavigation<any>();
  const { updateProgress } = useApp();
  const [selectedOption, setSelectedOption] = useState<'starting' | 'continuing' | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);

  const handleContinue = async () => {
    const day = selectedOption === 'starting' ? 1 : selectedDay;
    const completedDays = selectedOption === 'continuing' && day > 1
      ? Array.from({ length: day - 1 }, (_, i) => i + 1)
      : [];

    // Calculate start date: if on day 4, start date should be 3 days ago
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (day - 1));
    const startDateString = startDate.toISOString().split('T')[0];

    await updateProgress({
      currentDay: day,
      completedDays,
      startDate: startDateString,
    });
    navigation.navigate('OnboardingStep2');
  };

  const days = Array.from({ length: 40 }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/project-mantra-logo-turquoise.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Where are you at the{'\n'}Project Mantra journey?</Text>

        <TouchableOpacity
          style={[styles.card, selectedOption === 'starting' && styles.selectedCard]}
          onPress={() => setSelectedOption('starting')}
        >
          <View style={styles.cardGraphic}>
            <Image
              source={require('../../assets/images/icon-starting-today.png')}
              style={{ width: 72, height: 72 }}
              resizeMode="contain"
            />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>I'm starting today</Text>
            <Text style={styles.cardSubtitle}>Begin your 40-day journey</Text>
          </View>
          <View style={[styles.radio, selectedOption === 'starting' && styles.radioSelected]}>
            {selectedOption === 'starting' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, selectedOption === 'continuing' && styles.selectedCard]}
          onPress={() => setSelectedOption('continuing')}
        >
          <View style={styles.cardGraphic}>
            <Image
              source={require('../../assets/images/icon-doing-it.png')}
              style={{ width: 72, height: 72 }}
              resizeMode="contain"
            />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>I'm already doing it</Text>
            <Text style={styles.cardSubtitle}>Continue your practice</Text>
          </View>
          <View style={[styles.radio, selectedOption === 'continuing' && styles.radioSelected]}>
            {selectedOption === 'continuing' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        {selectedOption === 'continuing' && (
          <View style={styles.daySelector}>
            <Text style={styles.daySelectorLabel}>At which day are you today?</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedDay}
                onValueChange={(itemValue) => setSelectedDay(itemValue)}
                style={styles.picker}
                dropdownIconColor={COLORS.white}
                itemStyle={styles.pickerItem}
              >
                {days.map((day) => (
                  <Picker.Item
                    key={day}
                    label={`Day ${day}`}
                    value={day}
                    color={COLORS.white}
                  />
                ))}
              </Picker>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedOption}
            variant="solid"
            size="lg"
            color="yellow"
            style={{ marginBottom: 16, width: '100%' }}
          />
          <Text style={styles.stepIndicator}>Step 1 of 3</Text>
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
    padding: 16,
    paddingTop: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
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
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: 140,
    position: 'relative',
  },
  selectedCard: {
    backgroundColor: 'rgba(0, 217, 217, 0.2)',
    borderColor: COLORS.accent,
  },
  cardGraphic: {
    width: 80,
    height: 80,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTextContainer: {
    alignItems: 'center',
  },
  cardTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontFamily: FONTS.semiBold,
    fontWeight: FONT_WEIGHTS.semiBold,
    marginBottom: 6,
    textAlign: 'center',
  },
  cardSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 1000,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.66)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 16,
    right: 16,
  },
  radioSelected: {
    borderColor: COLORS.white,
    backgroundColor: COLORS.white,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 1000,
    backgroundColor: COLORS.primary,
  },
  daySelector: {
    marginVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  daySelectorLabel: {
    color: COLORS.accent,
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    fontWeight: FONT_WEIGHTS.semiBold,
    marginBottom: 12,
  },
  pickerContainer: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.66)',
    overflow: 'hidden',
    paddingHorizontal: 12,
    // @ts-ignore - Web-only property
    outline: 'none',
  },
  picker: {
    color: COLORS.white,
    fontSize: 16,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    height: 40,
    // @ts-ignore - Web-only property
    outline: 'none',
  },
  pickerItem: {
    color: COLORS.white,
    backgroundColor: 'rgba(62, 44, 82, 0.8)',
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    fontWeight: FONT_WEIGHTS.semiBold,
    padding: 12,
  },
  footer: {
    paddingTop: 20,
  },
  stepIndicator: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
});
