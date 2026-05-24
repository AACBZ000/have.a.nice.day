/**
 * Destiny Pillars - Design System
 * Central place for all colors, typography, and spacing constants.
 */

export const COLORS = {
  // Backgrounds
  background: '#0D1B2A',
  backgroundCard: '#0F2236',
  backgroundInput: '#0A1520',
  backgroundAccent: '#112233',

  // Gold accents
  gold: '#C9A84C',
  goldLight: '#E2C572',
  goldDark: '#A07830',
  goldMuted: '#8B6914',

  // Text
  cream: '#FFF8DC',
  creamMuted: '#D4C8A0',
  creamDim: '#A09070',
  white: '#FFFFFF',

  // Element colors
  wood: '#4CAF50',
  fire: '#F44336',
  earth: '#FF9800',
  metal: '#9E9E9E',
  water: '#2196F3',

  // UI
  border: '#C9A84C',
  borderMuted: '#2A3B4C',
  error: '#FF6B6B',
  success: '#4CAF50',
  overlay: 'rgba(0,0,0,0.7)',
};

export const FONTS = {
  heading: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subheading: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  body: {
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  chinese: {
    fontWeight: '400',
    letterSpacing: 2,
  },
};

export const SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
  title: 42,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  round: 50,
};

export const ELEMENT_COLORS = {
  Wood: COLORS.wood,
  Fire: COLORS.fire,
  Earth: COLORS.earth,
  Metal: COLORS.metal,
  Water: COLORS.water,
};

export const SHADOWS = {
  gold: {
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
};
