/**
 * Glass — Shared glass-panel surface component
 * ════════════════════════════════════════════════
 * Replaces all flat `colors.surface` cards across the app.
 * Supports accent glow, press states, and consistent blur treatment.
 *
 * WARNING: Do NOT use Glass inside FlatList renderItem — Reanimated's
 * Animated.View conflicts with VirtualizedList in RN 0.75. Use inline
 * styles with plain View instead.
 *
 * Usage:
 *   <Glass>...</Glass>
 *   <Glass accent glow>...</Glass>
 *   <Glass onPress={() => nav('player')}>...</Glass>
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, radius, elevation } from '../theme/tokens';

const SPRING_CFG = { damping: 15, stiffness: 300 };

export default function Glass({
  children,
  style,
  accent = false,
  glow = false,
  onPress,
  disabled = false,
}) {
  const scale = useSharedValue(1);

  const animatedScale = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const panelStyle = [
    styles.base,
    accent ? styles.accent : styles.default,
    glow && styles.glow,
    disabled && styles.disabled,
    style,
  ];

  const content = (
    <>
      {glow && <View style={styles.glowOrb} />}
      {children}
    </>
  );

  if (!onPress) {
    return <Animated.View style={panelStyle}>{content}</Animated.View>;
  }

  return (
    <Animated.View style={[panelStyle, animatedScale]}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        onPressIn={() => { scale.value = withSpring(0.97, SPRING_CFG); }}
        onPressOut={() => { scale.value = withSpring(1, SPRING_CFG); }}
        style={styles.pressable}
      >
        {content}
      </Pressable>
    </Animated.View>
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
  pressable: {
    flex: 1,
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
    opacity: 0.1,
  },
});
