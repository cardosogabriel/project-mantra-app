import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { COLORS, FONTS, FONT_WEIGHTS, getDayDuration } from '../utils/constants';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { CompletionAnimation } from '../components/CompletionAnimation';
import { CogIcon } from '../components/icons/CogIcon';
import { scheduleMilestoneNotification, cancelTodaysReminderAndReschedule } from '../utils/notifications';
import { formatTime } from '../utils/helpers';
import { playCompletionSound } from '../utils/sounds';
import { TimerState } from '../types';
import { webOnlyStyles } from '../styles/commonStyles';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userProgress, completeDay, uncompleteDay, setDayRemainingTime, updateProgress } = useApp();
  const scrollViewRef = useRef<ScrollView>(null);
  const hasScrolledRef = useRef(false);
  const prevCompletedDaysRef = useRef<number[]>([]);

  const [selectedDay, setSelectedDay] = useState<number>(userProgress.currentDay || 1);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [remainingTime, setRemainingTime] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(0);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [localCompletedDays, setLocalCompletedDays] = useState<number[]>(
    userProgress.completedDays.map(d => Number(d))
  );

  // Sync selected day when current day changes
  useEffect(() => {
    console.log('Dashboard: userProgress.currentDay =', userProgress.currentDay, 'selectedDay =', selectedDay);
    setSelectedDay(userProgress.currentDay);
  }, [userProgress.currentDay]);

  // Sync local completed days with context, ensuring all values are numbers
  useEffect(() => {
    const normalizedDays = userProgress.completedDays.map(d => Number(d));
    const prevDays = prevCompletedDaysRef.current;

    // Only update if the context value actually changed
    const hasChanged = normalizedDays.length !== prevDays.length ||
      normalizedDays.some((day, index) => day !== prevDays[index]);

    if (hasChanged) {
      console.log('Context completedDays changed, syncing to local:', normalizedDays);
      prevCompletedDaysRef.current = normalizedDays;
      setLocalCompletedDays(normalizedDays);
    }
  }, [userProgress.completedDays]);

  const dayDuration = getDayDuration(selectedDay);
  const isDayCompleted = localCompletedDays.includes(selectedDay);
  const isPastIncompleteDay = selectedDay < userProgress.currentDay && !isDayCompleted;

  // Debug logging
  useEffect(() => {
    console.log('Dashboard render - selectedDay:', selectedDay, 'isDayCompleted:', isDayCompleted, 'localCompletedDays:', localCompletedDays);
  }, [selectedDay, isDayCompleted, localCompletedDays]);

  useEffect(() => {
    // Scroll to center current day only once, after data is loaded
    if (hasScrolledRef.current || !userProgress.currentDay) return;

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
      hasScrolledRef.current = true;
    }, 300);
  }, [userProgress.currentDay]);

  useEffect(() => {
    const duration = dayDuration * 60;
    setSelectedDuration(duration);
    if (!isDayCompleted) {
      // Load saved remaining time for this day, or use default duration
      const savedRemainingTime = userProgress.dayRemainingTime?.[selectedDay];
      setRemainingTime(savedRemainingTime !== undefined ? savedRemainingTime : duration);
    }
  }, [selectedDay, isDayCompleted]);

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

  // Save remaining time whenever it changes
  useEffect(() => {
    if (!isDayCompleted && remainingTime > 0) {
      setDayRemainingTime(selectedDay, remainingTime);
    }
  }, [remainingTime, selectedDay, isDayCompleted]);


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
    console.log('handleCompleteDay called - selectedDay:', selectedDay, 'isDayCompleted:', isDayCompleted, 'localCompletedDays:', localCompletedDays);
    if (!isDayCompleted) {
      console.log('Completing day:', selectedDay);
      const newLocalCompleted = [...localCompletedDays, selectedDay].sort((a, b) => a - b);
      console.log('Setting localCompletedDays to:', newLocalCompleted);
      // Update local state immediately for instant UI feedback
      setLocalCompletedDays(newLocalCompleted);
      setShowCompletionAnimation(true);
      // Play completion sound
      playCompletionSound();
      // Clear the remaining time for this day
      const newDayRemainingTime = { ...(userProgress.dayRemainingTime || {}) };
      delete newDayRemainingTime[selectedDay];
      // Update context with both changes at once (persists to storage)
      const newCompletedDays = [...userProgress.completedDays.map(d => Number(d)), selectedDay].sort((a, b) => a - b);
      await updateProgress({
        completedDays: newCompletedDays,
        dayRemainingTime: newDayRemainingTime
      });
      console.log('Completed days after:', newCompletedDays);

      // If completing current day and reminders are enabled, cancel today's reminder
      if (selectedDay === userProgress.currentDay && userProgress.reminderEnabled && userProgress.reminderTime) {
        const [hours, minutes] = userProgress.reminderTime.split(':').map(Number);
        await cancelTodaysReminderAndReschedule(hours, minutes);
      }

      if (selectedDay % 10 === 0) {
        await scheduleMilestoneNotification(selectedDay);
      }
      setTimeout(() => setShowCompletionAnimation(false), 2500);
    } else {
      console.log('Day already completed, not doing anything');
    }
  };

  const handleUncompleteDay = async () => {
    // Update local state immediately
    setLocalCompletedDays(localCompletedDays.filter(d => d !== selectedDay));
    // Update context (persists to storage)
    await uncompleteDay(selectedDay);
    setTimerState('idle');
    setRemainingTime(selectedDuration);
  };

  const handleDurationChange = (minutes: number) => {
    console.log('handleDurationChange called with minutes:', minutes);
    const duration = minutes * 60;
    console.log('Setting selectedDuration to:', duration, 'seconds');
    setSelectedDuration(duration);
    setRemainingTime(duration);
  };

  const handleDayPress = (day: number) => {
    setSelectedDay(day);
    // Don't reset timer state if the day is already completed
    const isCompleted = localCompletedDays.includes(day);
    if (!isCompleted) {
      setTimerState('idle');
    }
    setShowCompletionAnimation(false);
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
            const isCompleted = localCompletedDays.includes(day);
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
            <Text style={styles.minutesText}>{dayDuration} minutes of</Text>
            <Text style={styles.mantraName}>{userProgress.selectedMantra?.name}</Text>
          </View>

          {/* Completed State or Timer Controls */}
          {isPastIncompleteDay ? (
            // For past incomplete days, don't show timer/controls
            null
          ) : showCompletionAnimation ? (
            <View style={styles.animationContainer}>
              <CompletionAnimation onComplete={() => setShowCompletionAnimation(false)} />
            </View>
          ) : isDayCompleted ? (
            <View style={styles.completedContainer}>
              <TouchableOpacity
                style={styles.completedCheckCircle}
                onPress={handleUncompleteDay}
                activeOpacity={0.7}
              >
                <Text style={styles.completedCheckmark}>✓</Text>
              </TouchableOpacity>
              <Text style={styles.completedText}>Completed!</Text>
            </View>
          ) : (
            <>
              {/* Timer Display */}
              <Text style={styles.timerDisplay}>{formatTime(remainingTime)}</Text>

              {/* Duration Selector */}
              <View style={styles.durationPickerWrapper}>
                <Picker
                  selectedValue={Math.floor(selectedDuration / 60)}
                  onValueChange={(itemValue) => handleDurationChange(Number(itemValue))}
                  style={styles.durationPicker}
                  dropdownIconColor="transparent"
                  itemStyle={styles.durationPickerItem}
                >
                  {minutes.map((minute) => (
                    <Picker.Item
                      key={minute}
                      label={`${minute} ${minute === 1 ? 'minute' : 'minutes'}`}
                      value={minute}
                      color={COLORS.textSecondary}
                    />
                  ))}
                </Picker>
              </View>

              {/* Start Timer Button */}
              {timerState === 'idle' && (
                <Button
                  title="▶  Start Timer"
                  onPress={handleStartTimer}
                  variant="outlined"
                  size="lg"
                  color="accent"
                  style={styles.timerButton}
                />
              )}

              {timerState === 'running' && (
                <Button
                  title="⏸  Pause"
                  onPress={handlePauseTimer}
                  variant="outlined"
                  size="lg"
                  color="accent"
                  style={styles.timerButton}
                />
              )}

              {timerState === 'paused' && (
                <View style={styles.pausedButtons}>
                  <Button
                    title="▶  Continue"
                    onPress={handleStartTimer}
                    variant="outlined"
                    size="lg"
                    color="accent"
                    style={[styles.timerButtonHalf, { backgroundColor: 'rgba(0, 217, 217, 0.2)' }]}
                  />
                  <Button
                    title="↻  Reset"
                    onPress={handleResetTimer}
                    variant="outlined"
                    size="lg"
                    color="accent"
                    style={styles.timerButtonHalf}
                  />
                </View>
              )}
            </>
          )}
        </View>

        {/* Mark as Completed Button */}
        {!isDayCompleted && (
          <View style={styles.bottomButtonContainer}>
            <Button
              title="✓  Mark as Completed"
              onPress={handleCompleteDay}
              variant="solid"
              size="lg"
              color="yellow"
              style={styles.completeButton}
            />
          </View>
        )}
      </ScrollView>
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
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  dayNumberLarge: {
    color: COLORS.white,
    fontSize: 48,
    fontFamily: FONTS.bold,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: 4,
  },
  ofTotal: {
    color: COLORS.textSecondary,
    fontSize: 18,
    fontFamily: FONTS.medium,
    marginBottom: 24,
  },
  practiceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
  practiceLabel: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.medium,
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: 12,
  },
  minutesText: {
    color: COLORS.yellow,
    fontSize: 18,
    fontFamily: FONTS.medium,
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: 4,
    lineHeight: 24,
  },
  mantraName: {
    color: COLORS.accent,
    fontSize: 18,
    fontFamily: FONTS.medium,
    fontWeight: FONT_WEIGHTS.medium,
    textAlign: 'center',
    lineHeight: 24,
  },
  timerDisplay: {
    color: COLORS.yellow,
    fontSize: 48,
    fontFamily: FONTS.bold,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: 8,
    marginTop: 24,
  },
  durationPickerWrapper: {
    alignItems: 'center',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textSecondary,
    alignSelf: 'center',
    ...webOnlyStyles,
  },
  durationPicker: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontFamily: FONTS.medium,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    height: 24,
    paddingVertical: 0,
    paddingHorizontal: 0,
    margin: 0,
    ...webOnlyStyles,
  },
  durationPickerItem: {
    fontSize: 16,
  },
  timerButton: {
    width: '100%',
    marginBottom: 0,
    backgroundColor: 'rgba(0, 217, 217, 0.2)',
  },
  pausedButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  timerButtonHalf: {
    flex: 1,
  },
  animationContainer: {
    paddingVertical: 0,
  },
  completedContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 16,
  },
  completedCheckCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  completedCheckmark: {
    fontSize: 40,
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    fontWeight: FONT_WEIGHTS.medium,
  },
  completedText: {
    fontSize: 20,
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  bottomButtonContainer: {
    paddingHorizontal: 16,
  },
  completeButton: {
    width: '100%',
  },
});
