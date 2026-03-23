import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated, Alert } from 'react-native';
import TrackPlayer, { usePlaybackState, State } from 'react-native-track-player';
import LiveReactions from './LiveReactions';
import { colors, spacing, fonts, borderRadius } from '../theme';

const BreathingGlow = ({ isActive }) => {
  const glow1 = useRef(new Animated.Value(0.8)).current;
  const glow2 = useRef(new Animated.Value(0.6)).current;
  const glow3 = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (!isActive) {
      glow1.setValue(0.8);
      glow2.setValue(0.6);
      glow3.setValue(0.7);
      return;
    }

    const makeLoop = (anim, from, to, duration) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: to, duration, useNativeDriver: true }),
          Animated.timing(anim, { toValue: from, duration, useNativeDriver: true }),
        ])
      );

    const a1 = makeLoop(glow1, 0.8, 1.2, 3000);
    const a2 = makeLoop(glow2, 0.6, 1.1, 3800);
    const a3 = makeLoop(glow3, 0.7, 1.15, 2600);
    a1.start();
    a2.start();
    a3.start();

    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <View style={styles.breathingContainer}>
      <Animated.View style={[styles.breathCircle, styles.breathCircle1, { transform: [{ scale: glow1 }] }]} />
      <Animated.View style={[styles.breathCircle, styles.breathCircle2, { transform: [{ scale: glow2 }] }]} />
      <Animated.View style={[styles.breathCircle, styles.breathCircle3, { transform: [{ scale: glow3 }] }]} />
    </View>
  );
};

const VisualizerBars = React.memo(({ count = 24 }) => (
  <View style={styles.visualizer}>
    {[...Array(count)].map((_, i) => (
      <View
        key={i}
        style={[
          styles.visualizerBar,
          {
            height: 8 + Math.random() * 24,
            backgroundColor: i % 3 === 0 ? colors.primary : colors.primaryLight,
          },
        ]}
      />
    ))}
  </View>
));

const RadioPlayer = () => {
  const playbackState = usePlaybackState();
  const [isPlaying, setIsPlaying] = useState(false);
  const pulseAnim = useState(new Animated.Value(1))[0];

  const isCurrentlyPlaying =
    playbackState === State.Playing || playbackState?.state === State.Playing;

  useEffect(() => {
    setIsPlaying(isCurrentlyPlaying);

    if (isCurrentlyPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isCurrentlyPlaying]);

  const togglePlayback = async () => {
    try {
      if (isCurrentlyPlaying) {
        await TrackPlayer.pause();
      } else {
        await TrackPlayer.play();
      }
    } catch (error) {
      console.error('Playback error:', error);
      Alert.alert('Playback Error', 'Unable to play the stream. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Ambient breathing glow */}
      <BreathingGlow isActive={isPlaying} />

      {/* Station artwork */}
      <View style={styles.artworkContainer}>
        <Animated.View
          style={[
            styles.artworkGlow,
            isPlaying && { transform: [{ scale: pulseAnim }] },
          ]}
        />
        <Image
          source={require('../../assets/Images/reebologo.png')}
          style={styles.artwork}
          resizeMode="contain"
        />
      </View>

      {/* Station info */}
      <Text style={styles.stationName}>Reeboot Radio</Text>
      <View style={styles.liveIndicator}>
        {isPlaying && <View style={styles.liveDot} />}
        <Text style={[styles.liveText, isPlaying && styles.liveTextActive]}>
          {isPlaying ? 'LIVE' : 'OFFLINE'}
        </Text>
      </View>

      {/* Now playing track info */}
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle}>Reeboot Radio Live</Text>
        <Text style={styles.trackArtist}>Live365 Stream</Text>
      </View>

      {/* Playback controls */}
      <TouchableOpacity
        style={[styles.playButton, isPlaying && styles.playButtonActive]}
        onPress={togglePlayback}
        activeOpacity={0.8}
        accessibilityLabel={isPlaying ? 'Pause radio' : 'Play radio'}
        accessibilityRole="button"
      >
        <Text style={styles.playButtonIcon}>
          {isPlaying ? '\u23F8' : '\u25B6'}
        </Text>
      </TouchableOpacity>

      {/* Audio visualizer */}
      {isPlaying && <VisualizerBars count={24} />}

      {/* Live Reactions overlay */}
      <LiveReactions />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  breathingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathCircle: {
    position: 'absolute',
    borderRadius: 999,
  },
  breathCircle1: {
    width: 300,
    height: 300,
    backgroundColor: colors.primary,
    opacity: 0.06,
  },
  breathCircle2: {
    width: 220,
    height: 220,
    backgroundColor: colors.primaryLight,
    opacity: 0.08,
  },
  breathCircle3: {
    width: 160,
    height: 160,
    backgroundColor: colors.secondary,
    opacity: 0.05,
  },
  artworkContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  artworkGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.primary,
    opacity: 0.15,
  },
  artwork: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.surface,
  },
  stationName: {
    fontSize: fonts.sizes.hero,
    fontWeight: fonts.weights.heavy,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.live,
    marginRight: spacing.xs,
  },
  liveText: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
    color: colors.textMuted,
    letterSpacing: 2,
  },
  liveTextActive: {
    color: colors.live,
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  trackTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    color: colors.textPrimary,
  },
  trackArtist: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  playButtonActive: {
    backgroundColor: colors.secondary,
  },
  playButtonIcon: {
    fontSize: 32,
    color: colors.textPrimary,
    marginLeft: 4,
  },
  visualizer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 32,
    marginBottom: spacing.lg,
  },
  visualizerBar: {
    width: 4,
    marginHorizontal: 2,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});

export default RadioPlayer;

