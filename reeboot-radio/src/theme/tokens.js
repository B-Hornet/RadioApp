/**
 * REEBOOT RADIO — Midnight Broadcast Booth Design System
 * ═══════════════════════════════════════════════════════
 * Mood: "Premium late-night broadcast studio"
 *
 * Every token lives here. No hardcoded values in components.
 * Import: import { colors, typography, spacing, radius, elevation, motion } from '@/theme/tokens';
 */

// ─── COLORS ────────────────────────────────────────────────

export const colors = {
  // Brand — warm amber broadcast orange
  primary: '#FF6B00',
  primaryLight: '#FF8C3A',
  primaryDark: '#CC5500',
  primaryGlow: 'rgba(255, 107, 0, 0.35)',
  primarySubtle: 'rgba(255, 107, 0, 0.08)',
  primaryBorder: 'rgba(255, 107, 0, 0.15)',

  // Layered dark studio backgrounds (darkest → lightest)
  bgDeep: '#08080C',
  bgBase: '#0D0D14',
  bgSurface: '#13131E',
  bgElevated: '#1A1A2A',
  bgHighlight: '#242438',

  // Glass
  glass: 'rgba(255, 255, 255, 0.04)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassHover: 'rgba(255, 255, 255, 0.07)',
  glassAccent: 'rgba(255, 107, 0, 0.06)',
  glassAccentBorder: 'rgba(255, 107, 0, 0.15)',

  // Text
  textPrimary: '#F0EDE8',
  textSecondary: '#9B97A0',
  textMuted: '#5E5B66',

  // Status
  live: '#FF3B30',
  liveGlow: 'rgba(255, 59, 48, 0.4)',
  liveBg: 'rgba(255, 59, 48, 0.15)',
  liveBorder: 'rgba(255, 59, 48, 0.3)',

  online: '#34D058',
  onlineGlow: 'rgba(52, 208, 88, 0.3)',
  onlineBg: 'rgba(52, 208, 88, 0.1)',
  onlineBorder: 'rgba(52, 208, 88, 0.2)',

  warning: '#FFD60A',
  error: '#FF453A',

  // Semantic
  white: '#FFFFFF',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

// ─── TYPOGRAPHY ────────────────────────────────────────────

export const typography = {
  // Font families — Oswald for display, DM Sans for body, JetBrains Mono for data
  display: {
    fontFamily: 'Oswald-Bold',     // install via react-native-asset or expo-font
    fontWeight: '700',
  },
  displayMedium: {
    fontFamily: 'Oswald-Medium',
    fontWeight: '500',
  },
  body: {
    fontFamily: 'DMSans-Regular',
    fontWeight: '400',
  },
  bodySemiBold: {
    fontFamily: 'DMSans-SemiBold',
    fontWeight: '600',
  },
  bodyBold: {
    fontFamily: 'DMSans-Bold',
    fontWeight: '700',
  },
  mono: {
    fontFamily: 'JetBrainsMono-Regular',
    fontWeight: '400',
  },
  monoMedium: {
    fontFamily: 'JetBrainsMono-Medium',
    fontWeight: '500',
  },

  // Size scale
  size: {
    xs: 10,
    sm: 12,
    md: 13,
    lg: 15,
    xl: 18,
    xxl: 26,
    hero: 40,
    mega: 56,
  },

  // Line heights
  lineHeight: {
    tight: 1.15,
    normal: 1.4,
    relaxed: 1.55,
  },

  // Letter spacing
  tracking: {
    tight: -0.3,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
    label: 1.5,
  },
};

// ─── SPACING ───────────────────────────────────────────────

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  section: 48,
  screen: 20, // horizontal screen padding
};

// ─── BORDER RADIUS ─────────────────────────────────────────

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 999,
};

// ─── ELEVATION / SHADOWS ───────────────────────────────────

export const elevation = {
  none: {},
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  prominent: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: (color = colors.primaryGlow) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6,
  }),
};

// ─── MOTION ────────────────────────────────────────────────

export const motion = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
    ambient: 3000,
  },
  easing: {
    // Use with react-native-reanimated Easing
    enter: 'ease-out',
    exit: 'ease-in',
    bounce: 'spring',
  },
};

// ─── COMPONENT PRESETS ─────────────────────────────────────

export const presets = {
  // Glass panel base style
  glass: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
  },
  glassAccent: {
    backgroundColor: colors.glassAccent,
    borderWidth: 1,
    borderColor: colors.glassAccentBorder,
    borderRadius: radius.lg,
  },

  // Section label — "SCHEDULE", "STATION", "COMING UP"
  sectionLabel: {
    ...typography.display,
    fontSize: typography.size.sm,
    color: colors.textMuted,
    letterSpacing: typography.tracking.widest,
    textTransform: 'uppercase',
  },

  // Overline — small mono status text
  overline: {
    ...typography.mono,
    fontSize: typography.size.xs,
    color: colors.textMuted,
    letterSpacing: typography.tracking.wide,
  },
};

// ─── LAYOUT CONSTANTS ──────────────────────────────────────

export const layout = {
  navDockHeight: 68,
  miniPlayerHeight: 56,
  miniPlayerBottom: 72, // navDockHeight + spacing.xs
  screenBottomPadding: 140, // navDockHeight + miniPlayerHeight + spacing.lg
  inputBottomMargin: 72, // clears NavDock
};

// ─── ANTI-PATTERNS (for code review) ──────────────────────
// NEVER: hardcode '#000000' — use colors.bgDeep
// NEVER: hardcode colors not in this file
// NEVER: use marginTop: 2 — use spacing.xs (4)
// NEVER: mix spacing tokens with magic numbers (spacing.md + 4)
// NEVER: use borderRadius > radius.xl unless radius.full
// NEVER: use opacity < 0.5 for disabled states — standard is 0.4
// NEVER: use padding > spacing.xl (24) on cards — max is spacing.lg (16)
