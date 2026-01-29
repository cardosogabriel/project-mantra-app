import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';
import { formatTime } from '../utils/helpers';

interface TimerProps {
  remainingTime: number;
  totalTime: number;
}

export const Timer: React.FC<TimerProps> = ({ remainingTime, totalTime }) => {
  const progress = remainingTime / totalTime;

  return (
    <View style={styles.container}>
      <View style={styles.timerCircle}>
        <Text style={styles.timeText}>{formatTime(remainingTime)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: COLORS.yellow,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 225, 0, 0.1)',
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.yellow,
  },
});
