import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS, FONTS, FONT_WEIGHTS } from '../utils/constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'solid';
  size?: 'md' | 'lg';
  color?: 'accent' | 'yellow' | 'red';
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  color = 'accent',
  disabled = false,
  style,
}) => {
  const getButtonStyle = () => {
    if (variant === 'solid') {
      if (color === 'yellow') return styles.yellowButton;
      if (color === 'red') return styles.dangerButton;
      return styles.primaryButton;
    }
    if (variant === 'secondary') return styles.secondaryButton;
    if (variant === 'danger') return styles.dangerButton;
    return styles.primaryButton;
  };

  const getTextStyle = () => {
    const textStyles: TextStyle[] = [styles.text];

    if (size === 'lg') {
      textStyles.push(styles.textLg);
    }

    if (variant === 'solid' && color === 'yellow') {
      textStyles.push(styles.yellowText);
    } else if (variant === 'secondary') {
      textStyles.push(styles.secondaryText);
    }

    return textStyles;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
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
    paddingHorizontal: 40,
  },
  primaryButton: {
    backgroundColor: COLORS.accent,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.accent,
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
  secondaryText: {
    color: COLORS.accent,
  },
  yellowText: {
    color: '#2D1B4E',
  },
});
