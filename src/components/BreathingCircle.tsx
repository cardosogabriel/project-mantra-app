import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../utils/constants';

export const BreathingCircle: React.FC = () => {
  const scale1 = useSharedValue(1);
  const scale2 = useSharedValue(1);
  const scale3 = useSharedValue(1);

  useEffect(() => {
    const animationConfig = {
      duration: 3000,
      easing: Easing.inOut(Easing.ease),
    };

    // First circle starts immediately
    scale1.value = withRepeat(
      withTiming(1.4, animationConfig),
      -1,
      true
    );

    // Second circle starts with delay
    scale2.value = withDelay(
      200,
      withRepeat(
        withTiming(1.4, animationConfig),
        -1,
        true
      )
    );

    // Third circle starts with more delay
    scale3.value = withDelay(
      400,
      withRepeat(
        withTiming(1.4, animationConfig),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale1.value }],
    };
  });

  const animatedStyle2 = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale2.value }],
    };
  });

  const animatedStyle3 = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale3.value }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.circle, styles.circle3, animatedStyle3]} />
      <Animated.View style={[styles.circle, styles.circle2, animatedStyle2]} />
      <Animated.View style={[styles.circle, styles.circle1, animatedStyle1]} />
      <View style={styles.centerCircle} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 300,
    height: 300,
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
  },
  circle1: {
    width: 140,
    height: 140,
    backgroundColor: 'rgba(90, 130, 120, 0.7)',
  },
  circle2: {
    width: 180,
    height: 180,
    backgroundColor: 'rgba(60, 100, 120, 0.7)',
  },
  circle3: {
    width: 220,
    height: 220,
    backgroundColor: 'rgba(50, 80, 110, 0.7)',
  },
  centerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.yellow,
    position: 'absolute',
  },
});
