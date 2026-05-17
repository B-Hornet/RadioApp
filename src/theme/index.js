/**
 * Theme compatibility shim
 * ════════════════════════
 * Maps the old theme API (fonts, borderRadius, colors.background, etc.)
 * to the new Midnight Broadcast Booth tokens so legacy screens keep working.
 *
 * New screens should import directly from './tokens'.
 */

import {
  colors as tokenColors,
  typography,
  spacing as tokenSpacing,
  radius,
  elevation,
  motion,
  presets,
  layout,
} from './tokens';

// Re-export new tokens as-is
export { typography, elevation, motion, presets, layout };

// Spacing — same object, re-exported
export const spacing = tokenSpacing;

// Border radius — old screens imported `borderRadius`
export const borderRadius = {
  sm: radius.sm,
  md: radius.md,
  lg: radius.lg,
  xl: radius.xl,
  full: radius.full,
};

// Fonts — old screens used `fonts.sizes.*` and `fonts.weights.*`
export const fonts = {
  sizes: {
    xs: typography.size.xs,
    sm: typography.size.sm,
    md: typography.size.md,
    lg: typography.size.lg,
    xl: typography.size.xl,
    xxl: typography.size.xxl,
    hero: typography.size.hero,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },
};

// Colors — extends new tokens with old aliases used by legacy screens
export const colors = {
  ...tokenColors,
  // Legacy aliases
  background: tokenColors.bgDeep,
  surface: tokenColors.bgSurface,
  surfaceLight: tokenColors.bgElevated,
  border: tokenColors.glassBorder,
  secondary: tokenColors.online,
  primaryLight: tokenColors.primaryLight,
};
