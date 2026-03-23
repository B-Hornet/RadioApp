import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import TrackPlayer, { usePlaybackState, State } from 'react-native-track-player';
import { colors, spacing, fonts, borderRadius } from '../theme';

const WAVEFORM_BARS = 5;
const BAR_HEIGHTS = [10, 16, 12, 18, 8];

const MiniWaveform = ({ isActive }) => {
  const anims = useRef(BAR_HEIGHTS.map(() => new Animated.Value(0.4))).current;

  useEffect(() => {
    if (!isActive) {
      anims.forEach((a) => a.setValue(0.4));
      return;
    }

    const loops = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 300 + i * 80,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 400 + i * 60,
            useNativeDriver: true,
          }),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [isActive]);

  return (
    <View style={miniStyles.waveform}>
      {anims.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            miniStyles.waveBar,
            {
              height: BAR_HEIGHTS[i],
              transform: [{ scaleY: anim }],
            },
          ]}
        />
      ))}
    </View>
  );
};

const MiniPlayer = ({ onPress }) => {
  const playbackState = usePlaybackState();
  const isPlaying =
    playbackState === State.Playing || playbackState?.state === State.Playing;

  const togglePlayback = async () => {
    try {
      if (isPlaying) {
        await TrackPlayer.pause();
      } else {
        await TrackPlayer.play();
      }
    } catch (error) {
      console.error('MiniPlayer playback error:', error);
    }
  };

  return (
    <TouchableOpacity
      style={miniStyles.container}
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityLabel="Mini player, tap to expand"
      accessibilityRole="button"
    >
      <View style={miniStyles.left}>
        <TouchableOpacity
          style={miniStyles.playButton}
          onPress={togglePlayback}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
          accessibilityRole="button"
        >
          <Text style={miniStyles.playIcon}>
            {isPlaying ? '\u23F8' : '\u25B6'}
          </Text>
        </TouchableOpacity>
        <MiniWaveform isActive={isPlaying} />
      </View>
      <View style={miniStyles.info}>
        <Text style={miniStyles.title} numberOfLines={1}>
          Reeboot Radio
        </Text>
        <Text style={miniStyles.subtitle} numberOfLines={1}>
          {isPlaying ? 'Live Now' : 'Tap to listen'}
        </Text>
      </View>
      {isPlaying && <View style={miniStyles.liveDot} />}
    </TouchableOpacity>
  );
};

const miniStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 2,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    marginLeft: spacing.sm,
    gap: 2,
  },
  waveBar: {
    width: 3,
    borderRadius: 1.5,
    backgroundColor: colors.primary,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semibold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.live,
    marginLeft: spacing.sm,
  },
});

export default MiniPlayer;
