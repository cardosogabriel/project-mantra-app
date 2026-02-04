import { StyleSheet } from 'react-native';
import { COLORS, FONTS, FONT_WEIGHTS } from '../utils/constants';

// Web-specific style overrides to remove focus states
export const webOnlyStyles = {
  // @ts-ignore - Web-only properties
  outlineStyle: 'none',
  // @ts-ignore
  outlineWidth: 0,
  // @ts-ignore
  boxShadow: 'none',
  // @ts-ignore
  WebkitAppearance: 'none',
  // @ts-ignore
  MozAppearance: 'none',
};

// Common picker styles used across the app
export const commonStyles = StyleSheet.create({
  pickerContainer: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    overflow: 'hidden',
    paddingHorizontal: 12,
    ...webOnlyStyles,
  },
  picker: {
    color: COLORS.white,
    fontSize: 16,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    height: 40,
    ...webOnlyStyles,
  },
  pickerItem: {
    color: COLORS.white,
    backgroundColor: 'rgba(62, 44, 82, 0.8)',
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    fontWeight: FONT_WEIGHTS.semiBold,
    padding: 12,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardNarrow: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});
