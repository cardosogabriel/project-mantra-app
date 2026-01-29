import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../utils/constants';
import { formatTime } from '../utils/helpers';

interface DurationPickerProps {
  maxMinutes: number;
  selectedDuration: number;
  onSelect: (duration: number) => void;
}

export const DurationPicker: React.FC<DurationPickerProps> = ({
  maxMinutes,
  selectedDuration,
  onSelect,
}) => {
  const durations: number[] = [];
  for (let i = maxMinutes; i >= 1; i--) {
    durations.push(i * 60);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Duration</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {durations.map((duration) => (
          <TouchableOpacity
            key={duration}
            style={[
              styles.option,
              selectedDuration === duration && styles.selectedOption,
            ]}
            onPress={() => onSelect(duration)}
          >
            <Text
              style={[
                styles.optionText,
                selectedDuration === duration && styles.selectedText,
              ]}
            >
              {formatTime(duration)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 4,
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 4,
  },
  selectedOption: {
    backgroundColor: COLORS.yellow,
  },
  optionText: {
    color: COLORS.gray,
    fontSize: 16,
    fontWeight: '600',
  },
  selectedText: {
    color: COLORS.primary,
  },
});
