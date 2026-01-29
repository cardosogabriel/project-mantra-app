import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, MANTRAS, FONTS, FONT_WEIGHTS } from '../utils/constants';
import { Button } from '../components/Button';
import { MantraCard } from '../components/MantraCard';
import { useApp } from '../context/AppContext';
import { Mantra } from '../types';

export const OnboardingStep2: React.FC = () => {
  const navigation = useNavigation<any>();
  const { setSelectedMantra } = useApp();
  const [selected, setSelected] = useState<Mantra | null>(null);
  const [showingVideo, setShowingVideo] = useState<string | null>(null);

  const handleContinue = async () => {
    if (selected) {
      await setSelectedMantra(selected);
      navigation.navigate('OnboardingStep3');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleListenPress = (mantraId: string) => {
    setShowingVideo(showingVideo === mantraId ? null : mantraId);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/project-mantra-logo-turquoise.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        <Text style={styles.title}>Which mantra would you{'\n'}like to chant?</Text>

        {MANTRAS.map((mantra) => (
          <MantraCard
            key={mantra.id}
            mantra={mantra}
            isSelected={selected?.id === mantra.id}
            onSelect={() => setSelected(mantra)}
            showingVideo={showingVideo === mantra.id}
            onListenPress={() => handleListenPress(mantra.id)}
          />
        ))}

        <View style={styles.footer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={!selected}
            variant="solid"
            size="lg"
            color="yellow"
            style={{ marginBottom: 16, width: '100%' }}
          />
          <Text style={styles.stepIndicator}>Step 2 of 3</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: {
    padding: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1,
  },
  backButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 80,
  },
  title: {
    color: COLORS.white,
    fontSize: 24,
    fontFamily: FONTS.medium,
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 32,
  },
  footer: {
    paddingTop: 20,
  },
  stepIndicator: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
});
