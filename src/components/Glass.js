/**
 * Glass — Shared glass-panel surface component
 * ════════════════════════════════════════════════
 * Replaces all flat `colors.surface` cards across the app.
 * Supports accent glow, press states, and consistent blur treatment.
 *
 * Usage:
 *   <Glass>...</Glass>
 *   <Glass accent glow>...</Glass>            // orange-tinted with ambient glow
 *   <Glass onPress={() => nav('player')}>...  // tappable
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { colors, radius, elevation } from '../theme/tokens';

export default function Glass({
  children,
  style,
  accent = false,
  glow = false,
  onPress,
  disabled = false,
}) {
  const Wrapper = onPress ? Pressable : View;
  const wrapperProps = onPress
    ? {
        onPress,
        disabled,
        style: ({ pressed }) => [
          styles.base,
          accent ? styles.accent : styles.default,
          glow && styles.glow,
          pressed && styles.pressed,
          disabled && styles.disabled,
          style,
        ],
      }
    : {
        style: [
          styles.base,
          accent ? styles.accent : styles.default,
          glow && styles.glow,
          disabled && styles.disabled,
          style,
        ],
      };

  return (
    <Wrapper {...wrapperProps}>
      {glow && <View style={styles.glowOrb} />}
      {children}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  default: {
    backgroundColor: colors.glass,
    borderColor: colors.glassBorder,
  },
  accent: {
    backgroundColor: colors.glassAccent,
    borderColor: colors.glassAccentBorder,
  },
  glow: {
    ...elevation.glow(colors.primaryGlow),
  },
  pressed: {
    backgroundColor: colors.glassHover,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.4,
  },
  glowOrb: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryGlow,
    opacity: 0.3,
  },
});
