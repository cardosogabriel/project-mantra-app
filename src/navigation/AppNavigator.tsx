import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet } from 'react-native';
import { LoadingScreen } from '../screens/LoadingScreen';
import { OnboardingStep1 } from '../screens/OnboardingStep1';
import { OnboardingStep2 } from '../screens/OnboardingStep2';
import { OnboardingStep3 } from '../screens/OnboardingStep3';
import { PreparingScreen } from '../screens/PreparingScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Stack = createStackNavigator();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Loading"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#3D2B5C', flex: 1 },
        }}
      >
        <Stack.Screen name="Loading" component={LoadingScreen} />
        <Stack.Screen name="OnboardingStep1" component={OnboardingStep1} />
        <Stack.Screen name="OnboardingStep2" component={OnboardingStep2} />
        <Stack.Screen name="OnboardingStep3" component={OnboardingStep3} />
        <Stack.Screen name="Preparing" component={PreparingScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
