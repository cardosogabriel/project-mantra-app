import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS, FONTS, FONT_WEIGHTS } from '../utils/constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'outlined' | 'solid';
  size?: 'md' | 'lg';
  color?: 'accent' | 'yellow' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'outlined',
  size = 'md',
  color = 'accent',
  disabled = false,
  style,
}) => {
  const getButtonStyle = () => {
    if (variant === 'solid') {
      if (color === 'yellow') return styles.yellowButton;
      if (color === 'danger') return styles.dangerButton;
      return styles.outlinedButton;
    }
    if (variant === 'outlined') {
      if (color === 'danger') return styles.outlinedDangerButton;
      return styles.outlinedButton;
    }
    return styles.outlinedButton;
  };

  const getTextStyle = () => {
    const textStyles: TextStyle[] = [styles.text];

    if (size === 'lg') {
      textStyles.push(styles.textLg);
    }

    if (variant === 'solid' && color === 'yellow') {
      textStyles.push(styles.yellowText);
    } else if (variant === 'solid' && color === 'danger') {
      textStyles.push(styles.dangerText);
    } else if (variant === 'outlined' && color === 'danger') {
      textStyles.push(styles.outlinedDangerText);
    } else if (variant === 'outlined') {
      textStyles.push(styles.outlinedText);
    }

    return textStyles;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        size === 'md' && styles.buttonMd,
        size === 'lg' && styles.buttonLg,
        getButtonStyle(),
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={getTextStyle()}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  buttonLg: {
    height: 48,
    paddingHorizontal: 24,
  },
  buttonMd: {
    height: 36,
    paddingHorizontal: 24,
  },
  outlinedButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  outlinedDangerButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF6467',
  },
  dangerButton: {
    backgroundColor: COLORS.red,
  },
  yellowButton: {
    backgroundColor: COLORS.yellow,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  textLg: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  outlinedText: {
    color: COLORS.accent,
  },
  outlinedDangerText: {
    color: '#FF6467',
  },
  yellowText: {
    color: '#2D1B4E',
  },
  dangerText: {
    color: COLORS.white,
  },
});
