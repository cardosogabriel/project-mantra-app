import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { COLORS } from '../utils/constants';

interface CompletionAnimationProps {
  onComplete?: () => void;
}

export const CompletionAnimation: React.FC<CompletionAnimationProps> = ({ onComplete }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.2, { damping: 8 }),
      withSpring(1, { damping: 10 })
    );
    opacity.value = withSpring(1);

    setTimeout(() => {
      onComplete?.();
    }, 2000);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.circle, animatedStyle]}>
        <Text style={styles.checkmark}>✓</Text>
      </Animated.View>
      <Text style={styles.text}>Completed!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 60,
    fontWeight: 'bold',
  },
  text: {
    color: COLORS.accent,
    fontSize: 24,
    fontWeight: 'bold',
  },
});
