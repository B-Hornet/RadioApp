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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, radius, elevation } from '../theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PRESS_SPRING = { damping: 15, stiffness: 200 };

export default function Glass({
  children,
  style,
  accent = false,
  glow = false,
  onPress,
  disabled = false,
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, PRESS_SPRING);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, PRESS_SPRING);
  };

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.base,
          accent ? styles.accent : styles.default,
          glow && styles.glow,
          disabled && styles.disabled,
          style,
          animatedStyle,
        ]}
      >
        {glow && <View style={styles.glowOrb} />}
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View
      style={[
        styles.base,
        accent ? styles.accent : styles.default,
        glow && styles.glow,
        disabled && styles.disabled,
        style,
      ]}
    >
      {glow && <View style={styles.glowOrb} />}
      {children}
    </View>
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
