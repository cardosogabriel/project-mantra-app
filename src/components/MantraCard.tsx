import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Platform } from 'react-native';
import { COLORS, FONTS, FONT_WEIGHTS } from '../utils/constants';
import { Mantra } from '../types';

interface MantraCardProps {
  mantra: Mantra;
  isSelected: boolean;
  onSelect: () => void;
  showingVideo: boolean;
  onListenPress: () => void;
}

export const MantraCard: React.FC<MantraCardProps> = ({
  mantra,
  isSelected,
  onSelect,
  showingVideo,
  onListenPress,
}) => {
  const handleListenPress = (e: any) => {
    e.stopPropagation();
    onListenPress();
  };

  const getYoutubeVideoId = (url: string): string => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
  };

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.selectedCard]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.name}>{mantra.name}</Text>
        <Text style={styles.description}>{mantra.description}</Text>
        <TouchableOpacity style={styles.listenButton} onPress={handleListenPress}>
          <Text style={styles.listenButtonIcon}>▶</Text>
          <Text style={styles.listenButtonText}>Listen to the mantra</Text>
        </TouchableOpacity>

        {showingVideo && Platform.OS === 'web' && (
          <View style={styles.videoContainer}>
            <iframe
              width="100%"
              height="200"
              src={`https://www.youtube.com/embed/${getYoutubeVideoId(mantra.youtubeUrl)}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ borderRadius: 12 }}
            />
          </View>
        )}
      </View>
      <View style={[styles.radio, isSelected && styles.radioSelected]}>
        {isSelected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: 120,
    position: 'relative',
  },
  selectedCard: {
    backgroundColor: 'rgba(0, 217, 217, 0.2)',
    borderColor: COLORS.accent,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  name: {
    color: COLORS.white,
    fontSize: 20,
    fontFamily: FONTS.semiBold,
    fontWeight: FONT_WEIGHTS.semiBold,
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
    fontFamily: FONTS.regular,
    marginBottom: 16,
    lineHeight: 18,
    textAlign: 'center',
  },
  listenButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listenButtonIcon: {
    color: COLORS.accent,
    fontSize: 14,
    marginRight: 6,
  },
  listenButtonText: {
    color: COLORS.accent,
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    fontWeight: FONT_WEIGHTS.semiBold,
    lineHeight: 21,
  },
  videoContainer: {
    marginTop: 16,
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 1000,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.66)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 16,
    right: 16,
  },
  radioSelected: {
    borderColor: COLORS.white,
    backgroundColor: COLORS.white,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 1000,
    backgroundColor: COLORS.primary,
  },
});
