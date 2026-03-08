// Centralized theme for ReebootRadio App
// Dark mode inspired theme with radio/DJ brand colors

export const colors = {
  // Primary brand colors
  primary: '#FF6B00',        // Reeboot Orange — main accent
  primaryLight: '#FF8C3A',
  primaryDark: '#CC5500',

  // Secondary accent
  secondary: '#1DB954',      // Live/Active green (from original play button)
  secondaryLight: '#1ED760',
  secondaryDark: '#17A348',

  // Background hierarchy (dark theme)
  background: '#0D0D0D',     // Deepest background
  surface: '#1A1A2E',        // Cards, panels
  surfaceLight: '#242442',   // Elevated surfaces
  surfaceHighlight: '#2D2D4A', // Hover/active states

  // Text hierarchy
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0C0',
  textMuted: '#6B6B80',
  textAccent: '#FF6B00',

  // Chat specific
  chatBubbleOwn: '#FF6B00',
  chatBubbleOther: '#242442',
  chatInput: '#1A1A2E',
  chatBorder: '#2D2D4A',

  // Status colors
  live: '#FF3B30',           // Live indicator red
  online: '#1DB954',         // Online/active green
  offline: '#6B6B80',
  warning: '#FFD60A',

  // Reactions
  reactionFire: '#FF6B00',
  reactionHeart: '#FF3B5C',
  reactionClap: '#FFD60A',
  reactionHundred: '#1DB954',

  // Navigation
  tabActive: '#FF6B00',
  tabInactive: '#6B6B80',
  headerBackground: '#0D0D0D',
  headerBorder: '#1A1A2E',

  // Borders & dividers
  border: '#2D2D4A',
  divider: '#1A1A2E',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fonts = {
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 28,
    hero: 36,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },
};

export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 20,
  xl: 30,
  full: 999,
};
