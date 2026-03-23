/**
 * LiveBadge — Animated LIVE status indicator
 * ════════════════════════════════════════════
 * Pulsing red dot + "LIVE" text in a pill.
 * Uses Reanimated for smooth UI-thread animation.
 *
 * Usage:
 *   <LiveBadge />
 *   <LiveBadge size="sm" />
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, typography, radius } from '../theme/tokens';

const SIZES = {
  sm: { px: 8, py: 3, font: 9, dot: 5, gap: 4 },
  md: { px: 12, py: 5, font: 10, dot: 6, gap: 5 },
};

export default function LiveBadge({ size = 'md' }) {
  const s = SIZES[size] || SIZES.md;
  const dotOpacity = useSharedValue(1);
  const dotScale = useSharedValue(1);

  useEffect(() => {
    dotOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 750, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 750, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
    dotScale.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 750, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 750, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, []);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
    transform: [{ scale: dotScale.value }],
  }));

  return (
    <View style={[styles.pill, { paddingHorizontal: s.px, paddingVertical: s.py, gap: s.gap }]}>
      <Animated.View
        style={[
          styles.dot,
          { width: s.dot, height: s.dot, borderRadius: s.dot / 2 },
          dotStyle,
        ]}
      />
      <Text style={[styles.label, { fontSize: s.font }]}>LIVE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.liveBg,
    borderWidth: 1,
    borderColor: colors.liveBorder,
    borderRadius: radius.full,
  },
  dot: {
    backgroundColor: colors.live,
    shadowColor: colors.live,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontFamily: 'Oswald-SemiBold',
    fontWeight: '600',
    color: colors.live,
    letterSpacing: 1.5,
  },
});
