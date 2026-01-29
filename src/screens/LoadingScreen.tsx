import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';

export const LoadingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userProgress, isLoading } = useApp();

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        if (userProgress.hasCompletedOnboarding) {
          navigation.replace('Dashboard');
        } else {
          navigation.replace('OnboardingStep1');
        }
      }, 2000);
    }
  }, [isLoading, userProgress]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/project-mantra-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE100',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 280,
    height: 140,
  },
});
