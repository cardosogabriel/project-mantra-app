import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, FONT_WEIGHTS } from '../utils/constants';
import { BreathingCircle } from '../components/BreathingCircle';
import { useApp } from '../context/AppContext';

export const PreparingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { updateProgress } = useApp();

  useEffect(() => {
    const prepareApp = async () => {
      await updateProgress({ hasCompletedOnboarding: true });

      setTimeout(() => {
        navigation.replace('Dashboard');
      }, 5000);
    };

    prepareApp();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/project-mantra-logo-turquoise.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.centerContent}>
        <View style={styles.breathingCircle}>
          <BreathingCircle />
        </View>
        <Text style={styles.text}>Preparing your space</Text>
        <Text style={styles.subtext}>Happy chanting!</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 24,
  },
  logo: {
    width: 160,
    height: 80,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingCircle: {
    marginBottom: 32,
  },
  text: {
    color: COLORS.white,
    fontSize: 24,
    fontFamily: FONTS.medium,
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: 8,
  },
  subtext: {
    color: COLORS.yellow,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
});
