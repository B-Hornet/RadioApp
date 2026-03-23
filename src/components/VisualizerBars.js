/**
 * VisualizerBars — Animated audio frequency visualizer
 * ════════════════════════════════════════════════════════
 * Renders animated bars that bounce when playing.
 * Uses Reanimated for smooth UI-thread animation.
 *
 * Usage:
 *   <VisualizerBars playing={isLive} />
 *   <VisualizerBars count={24} height={28} playing />
 */

import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { colors } from '../theme/tokens';

const Bar = ({ index, containerHeight, isPlayingShared }) => {
  const progress = useSharedValue(0.08);

  // Each bar gets a slightly different timing for organic feel
  const duration = useMemo(() => 300 + Math.random() * 500, []);
  const delay = useMemo(() => index * 25, [index]);
  const maxPct = useMemo(() => 0.4 + Math.random() * 0.55, []);
  const minPct = useMemo(() => 0.1 + Math.random() * 0.15, []);

  useEffect(() => {
    if (isPlayingShared.value) {
      progress.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(maxPct, { duration, easing: Easing.inOut(Easing.ease) }),
            withTiming(minPct, { duration: duration * 0.8, easing: Easing.inOut(Easing.ease) }),
          ),
          -1,
          true,
        ),
      );
    } else {
      progress.value = withTiming(0.08, { duration: 400, easing: Easing.out(Easing.ease) });
    }
  }, [isPlayingShared.value]);

  const animatedStyle = useAnimatedStyle(() => {
    const h = progress.value * containerHeight;
    return {
      height: Math.max(h, 2), // minimum 2px so bars are always visible
      opacity: isPlayingShared.value
        ? interpolate(progress.value, [0, 1], [0.6, 1])
        : 0.15,
    };
  });

  return (
    <Animated.View
      style={[
        styles.bar,
        { flex: 1 },
        animatedStyle,
      ]}
    />
  );
};

export default function VisualizerBars({
  count = 32,
  height = 60,
  playing = true,
}) {
  const bars = useMemo(() => Array.from({ length: count }), [count]);

  // Shared value so Bar worklets can read playing state without stale closure
  const isPlayingShared = useSharedValue(playing ? 1 : 0);

  useEffect(() => {
    isPlayingShared.value = playing ? 1 : 0;
  }, [playing]);

  return (
    <View style={[styles.container, { height }]}>
      {bars.map((_, i) => (
        <Bar
          key={i}
          index={i}
          containerHeight={height}
          isPlayingShared={isPlayingShared}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    paddingHorizontal: 4,
  },
  bar: {
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});
