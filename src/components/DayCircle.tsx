import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS } from '../utils/constants';

interface DayCircleProps {
  day: number;
  isCompleted: boolean;
  isCurrent: boolean;
  onPress: () => void;
}

export const DayCircle: React.FC<DayCircleProps> = ({
  day,
  isCompleted,
  isCurrent,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.circle,
        isCompleted && styles.completed,
        isCurrent && styles.current,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {isCompleted ? (
        <Text style={styles.checkmark}>✓</Text>
      ) : (
        <Text style={[styles.text, isCurrent && styles.currentText]}>{day}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  completed: {
    backgroundColor: COLORS.accent,
  },
  current: {
    borderWidth: 3,
    borderColor: COLORS.yellow,
    backgroundColor: 'transparent',
  },
  text: {
    color: COLORS.gray,
    fontSize: 16,
    fontWeight: '600',
  },
  currentText: {
    color: COLORS.yellow,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
});
