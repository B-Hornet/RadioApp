import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Alert } from 'react-native';
import Video from 'react-native-video';
import TrackPlayer, { usePlaybackState, State } from 'react-native-track-player';
import LiveReactions from './LiveReactions';
import { colors, spacing, fonts, borderRadius } from '../theme';

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
      {/* Station artwork — animated MP4 video logo */}
      <View style={styles.artworkContainer}>
        <Animated.View
          style={[
            styles.artworkGlow,
            isPlaying && { transform: [{ scale: pulseAnim }] },
          ]}
        />
        <View style={styles.artworkVideoWrapper}>
          <Video
            source={require('../../assets/Radio App Background.mp4')}
            style={styles.artworkVideo}
            resizeMode="cover"
            repeat={true}
            muted={true}
            playInBackground={false}
            playWhenInactive={false}
            disableFocus={true}
            controls={false}
          />
        </View>
      </View>

      {/* Station info */}
      <Text style={styles.stationName}>Reeboot Radio</Text>
      <View style={styles.liveIndicator}>
        {isPlaying && <View style={styles.liveDot} />}
        <Text style={[styles.liveText, isPlaying && styles.liveTextActive]}>
          {isPlaying ? 'LIVE' : 'OFFLINE'}
        </Text>
      </View>

      {/* Now playing track info — removed Live365 reference */}
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle}>Reeboot Radio Live</Text>
        <Text style={styles.trackArtist}>Your Sound. Your Station.</Text>
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

      {/* Audio visualizer placeholder */}
      {isPlaying && (
        <View style={styles.visualizer}>
          {[...Array(12)].map((_, i) => (
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
      )}

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
  },
  artworkContainer: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  artworkGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary,
    opacity: 0.15,
  },
  artworkVideoWrapper: {
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  artworkVideo: {
    width: 180,
    height: 180,
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
