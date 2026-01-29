import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { COLORS, FONTS, FONT_WEIGHTS, getDayDuration } from '../utils/constants';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { CompletionAnimation } from '../components/CompletionAnimation';
import { CogIcon } from '../components/icons/CogIcon';
import { scheduleMilestoneNotification } from '../utils/notifications';
import { formatTime } from '../utils/helpers';
import { TimerState } from '../types';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userProgress, completeDay, uncompleteDay } = useApp();
  const scrollViewRef = useRef<ScrollView>(null);

  const [selectedDay, setSelectedDay] = useState<number>(userProgress.currentDay || 1);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [remainingTime, setRemainingTime] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);

  // Sync selected day when current day changes
  useEffect(() => {
    console.log('Dashboard: userProgress.currentDay =', userProgress.currentDay, 'selectedDay =', selectedDay);
    setSelectedDay(userProgress.currentDay);
  }, [userProgress.currentDay]);

  const dayDuration = getDayDuration(selectedDay);
  const isDayCompleted = userProgress.completedDays.includes(selectedDay);

  useEffect(() => {
    // Scroll to center current day on mount
    const circleWidth = 48;
    const marginPerSide = 4;
    const dayWidth = circleWidth + (marginPerSide * 2); // 56px total
    const paddingLeft = 12;
    const viewportWidth = Dimensions.get('window').width;

    // Calculate the center position of the current day circle
    const currentDayCenter = paddingLeft + (userProgress.currentDay - 1) * dayWidth + marginPerSide + (circleWidth / 2);

    // Calculate scroll position to center the day in viewport
    const scrollPosition = Math.max(0, currentDayCenter - (viewportWidth / 2));

    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ x: scrollPosition, animated: true });
    }, 300);
  }, []);

  useEffect(() => {
    const duration = dayDuration * 60;
    setSelectedDuration(duration);
    setRemainingTime(duration);
  }, [selectedDay, dayDuration]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerState === 'running' && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState, remainingTime]);


  const handleTimerComplete = async () => {
    setTimerState('completed');
    await handleCompleteDay();
  };

  const handleStartTimer = () => {
    if (timerState === 'idle') {
      setRemainingTime(selectedDuration);
    }
    setTimerState('running');
  };

  const handlePauseTimer = () => {
    setTimerState('paused');
  };

  const handleResetTimer = () => {
    setTimerState('idle');
    setRemainingTime(selectedDuration);
  };

  const handleCompleteDay = async () => {
    if (!isDayCompleted) {
      await completeDay(selectedDay);
      setShowCompletion(true);
      if (selectedDay % 10 === 0) {
        await scheduleMilestoneNotification(selectedDay);
      }
      setTimeout(() => setShowCompletion(false), 2500);
    }
  };

  const handleUncompleteDay = async () => {
    await uncompleteDay(selectedDay);
    setTimerState('idle');
    setRemainingTime(selectedDuration);
    setShowCompletion(false);
  };

  const handleDurationChange = (minutes: number) => {
    const duration = minutes * 60;
    setSelectedDuration(duration);
    if (timerState === 'idle') {
      setRemainingTime(duration);
    }
    setShowDurationPicker(false);
  };

  const handleDayPress = (day: number) => {
    setSelectedDay(day);
    setTimerState('idle');
  };

  const allDays = Array.from({ length: 40 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i + 1);

  // Calculate weekday for each day based on start date
  const getWeekdayForDay = (day: number): string => {
    if (!userProgress.startDate) return '';
    // Append time to force local timezone interpretation
    const startDate = new Date(userProgress.startDate + 'T00:00:00');
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + (day - 1));
    const weekdayIndex = dayDate.getDay(); // 0 = Sunday
    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return weekdays[weekdayIndex];
  };

  const todayDate = new Date();
  const today = todayDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });
  const weekday = todayDate.toLocaleDateString('en-US', {
    weekday: 'long',
  });

  if (showCompletion) {
    return (
      <View style={styles.container}>
        <CompletionAnimation onComplete={() => setShowCompletion(false)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/project-mantra-logo-turquoise.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
            <CogIcon size={24} color="rgba(255, 255, 255, 0.6)" />
          </TouchableOpacity>
        </View>

        {/* Date */}
        <Text style={styles.dateText}>Today, {today}, {weekday}</Text>

        {/* Days Scroll */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysScrollContainer}
          style={styles.daysScroll}
        >
          {allDays.map((day) => {
            const isCompleted = userProgress.completedDays.includes(day);
            const isCurrentDay = day === Number(userProgress.currentDay);
            const isSelected = day === Number(selectedDay);
            const isFuture = day > Number(userProgress.currentDay);

            return (
              <View key={day} style={styles.dayContainer}>
                <View style={styles.currentDayDotContainer}>
                  {isCurrentDay && <View style={styles.currentDayDot} />}
                </View>
                <TouchableOpacity
                  onPress={() => !isFuture && handleDayPress(day)}
                  disabled={isFuture}
                  activeOpacity={isFuture ? 1 : 0.7}
                >
                  <View style={[
                    styles.dayCircle,
                    isCompleted && styles.dayCompleted,
                    isSelected && styles.daySelected,
                  ]}>
                    <Text style={[
                      styles.dayNumber,
                      isSelected && !isCompleted && styles.dayNumberSelected,
                      isCompleted && styles.dayNumberCompleted,
                    ]}>
                      {day}
                    </Text>
                  </View>
                </TouchableOpacity>
                <Text style={styles.weekdayLabel}>
                  {getWeekdayForDay(day)}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Main Card */}
        <View style={styles.mainCard}>
          <Text style={styles.dayNumberLarge}>Day {selectedDay}</Text>
          <Text style={styles.ofTotal}>of 40</Text>

          <View style={styles.practiceCard}>
            <Text style={styles.practiceLabel}>TODAY'S PRACTICE</Text>
            <Text style={styles.minutesText}>{Math.floor(selectedDuration / 60)} minutes of</Text>
            <Text style={styles.mantraName}>{userProgress.selectedMantra?.name}</Text>
          </View>

          {/* Timer Display */}
          <Text style={styles.timerDisplay}>{formatTime(remainingTime)}</Text>

          {/* Duration Selector */}
          <TouchableOpacity onPress={() => setShowDurationPicker(true)}>
            <Text style={styles.durationButton}>{Math.floor(selectedDuration / 60)} minutes</Text>
          </TouchableOpacity>

          {/* Start Timer Button */}
          {timerState === 'idle' && (
            <TouchableOpacity style={styles.startButton} onPress={handleStartTimer}>
              <Text style={styles.startButtonText}>▶  Start Timer</Text>
            </TouchableOpacity>
          )}

          {timerState === 'running' && (
            <TouchableOpacity style={styles.startButton} onPress={handlePauseTimer}>
              <Text style={styles.startButtonText}>⏸  Pause</Text>
            </TouchableOpacity>
          )}

          {timerState === 'paused' && (
            <View style={styles.pausedButtons}>
              <TouchableOpacity style={[styles.startButton, styles.halfButton]} onPress={handleStartTimer}>
                <Text style={styles.startButtonText}>▶  Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.startButton, styles.halfButton]} onPress={handleResetTimer}>
                <Text style={styles.startButtonText}>↻  Reset</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Mark as Completed Button */}
        {!isDayCompleted && (
          <Button
            title="✓  Mark as Completed"
            onPress={handleCompleteDay}
            variant="solid"
            size="lg"
            color="yellow"
            style={styles.completeButton}
          />
        )}

        {isDayCompleted && (
          <Button
            title="Undo Completion"
            onPress={handleUncompleteDay}
            variant="secondary"
            size="lg"
            style={styles.completeButton}
          />
        )}
      </ScrollView>

      {/* Duration Picker Modal */}
      <Modal
        visible={showDurationPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDurationPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDurationPicker(false)}
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>Select Duration</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={Math.floor(selectedDuration / 60)}
                onValueChange={(itemValue) => handleDurationChange(itemValue)}
                style={styles.picker}
                dropdownIconColor={COLORS.white}
                itemStyle={styles.pickerItem}
              >
                {minutes.map((minute) => (
                  <Picker.Item
                    key={minute}
                    label={`${minute} ${minute === 1 ? 'minute' : 'minutes'}`}
                    value={minute}
                    color={COLORS.white}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  headerContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 24,
  },
  logo: {
    width: 160,
    height: 80,
  },
  settingsButton: {
    position: 'absolute',
    top: 24,
    right: 16,
  },
  dateText: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    fontWeight: FONT_WEIGHTS.semiBold,
    textAlign: 'center',
    marginBottom: 12,
  },
  daysScroll: {
    marginBottom: 24,
  },
  daysScrollContainer: {
    paddingHorizontal: 12,
  },
  dayContainer: {
    marginHorizontal: 4,
    alignItems: 'center',
  },
  currentDayDotContainer: {
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  currentDayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.yellow,
  },
  dayCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCompleted: {
    backgroundColor: COLORS.accent,
  },
  daySelected: {
    borderWidth: 1,
    borderColor: COLORS.yellow,
  },
  dayNumber: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontFamily: FONTS.medium,
    fontWeight: FONT_WEIGHTS.medium,
  },
  dayNumberSelected: {
    color: COLORS.white,
  },
  dayNumberCompleted: {
    color: COLORS.primary,
  },
  weekdayLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontFamily: FONTS.medium,
    marginTop: 8,
  },
  mainCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  dayNumberLarge: {
    color: COLORS.white,
    fontSize: 72,
    fontFamily: FONTS.bold,
    fontWeight: FONT_WEIGHTS.bold,
  },
  ofTotal: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 20,
    fontFamily: FONTS.regular,
    marginBottom: 24,
  },
  practiceCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  practiceLabel: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    fontWeight: FONT_WEIGHTS.semiBold,
    letterSpacing: 1,
    marginBottom: 12,
  },
  minutesText: {
    color: COLORS.yellow,
    fontSize: 20,
    fontFamily: FONTS.medium,
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: 4,
  },
  mantraName: {
    color: COLORS.accent,
    fontSize: 24,
    fontFamily: FONTS.medium,
    fontWeight: FONT_WEIGHTS.medium,
    textAlign: 'center',
  },
  timerDisplay: {
    color: COLORS.yellow,
    fontSize: 64,
    fontFamily: FONTS.bold,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: 8,
  },
  durationButton: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: FONTS.regular,
    textDecorationLine: 'underline',
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: 'rgba(0, 217, 217, 0.2)',
    borderRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderWidth: 2,
    borderColor: COLORS.accent,
    width: '100%',
    alignItems: 'center',
  },
  startButtonText: {
    color: COLORS.accent,
    fontSize: 20,
    fontFamily: FONTS.semiBold,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  pausedButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  halfButton: {
    flex: 1,
    paddingHorizontal: 16,
  },
  completeButton: {
    marginBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModal: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  pickerTitle: {
    color: COLORS.accent,
    fontSize: 20,
    fontFamily: FONTS.semiBold,
    fontWeight: FONT_WEIGHTS.semiBold,
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerContainer: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.66)',
    overflow: 'hidden',
    // @ts-ignore - Web-only property
    outline: 'none',
  },
  picker: {
    color: COLORS.white,
    fontSize: 16,
    backgroundColor: 'transparent',
    // @ts-ignore - Web-only property
    outline: 'none',
  },
  pickerItem: {
    color: COLORS.white,
    backgroundColor: 'rgba(62, 44, 82, 0.8)',
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
});
