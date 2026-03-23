/**
 * MiniPlayer — Persistent mini player bar
 * ═══════════════════════════════════════════
 * Shows on every screen except the full RadioPlayer.
 * Displays animated logo, track title, DJ name, and play/pause.
 * Tap to expand to full player.
 *
 * Usage:
 *   <MiniPlayer
 *     trackTitle="Midnight Frequencies"
 *     djName="DJ Shadow"
 *     isPlaying={true}
 *     isLive={true}
 *     onPress={() => navigation.navigate('RadioPlayer')}
 *     onPlayPause={() => togglePlayback()}
 *   />
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, typography, spacing, radius, elevation, layout } from '../theme/tokens';
import StudioLogo from './StudioLogo';
import LiveBadge from './LiveBadge';

export default function MiniPlayer({
  trackTitle = 'Reeboot Radio',
  djName = '',
  isPlaying = false,
  isLive = false,
  onPress,
  onPlayPause,
}) {
  const playScale = useSharedValue(1);

  const playButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playScale.value }],
  }));

  const handlePlayPress = () => {
    playScale.value = withSpring(0.85, {}, () => {
      playScale.value = withSpring(1);
    });
    onPlayPause?.();
  };

  return (
    <View style={styles.container}>
      {/* Tap anywhere except play button to expand to full player */}
      <Pressable onPress={onPress} style={styles.expandZone}>
        {/* Logo */}
        <StudioLogo size={34} glow={false} mini playing={isPlaying} />

        {/* Track info */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{trackTitle}</Text>
          {djName ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {djName}{isLive ? ' • Live Now' : ''}
            </Text>
          ) : null}
        </View>

        {/* Live badge */}
        {isLive && <LiveBadge size="sm" />}
      </Pressable>

      {/* Play/Pause button — separate touch target, does NOT navigate */}
      <Animated.View style={playButtonStyle}>
        <Pressable onPress={handlePlayPress} style={styles.playButton}>
          <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: layout.miniPlayerBottom, // above NavDock
    left: spacing.md,
    right: spacing.md,
    height: 56,
    backgroundColor: 'rgba(13, 13, 20, 0.92)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    ...elevation.prominent,
    zIndex: 50,
  },
  info: {
    flex: 1,
    minWidth: 0, // allows text truncation
  },
  expandZone: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },
  title: {
    fontFamily: 'DMSans-SemiBold',
    fontWeight: '600',
    fontSize: typography.size.md,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: 'DMSans-Regular',
    fontWeight: '400',
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  playIcon: {
    fontSize: 14,
    color: colors.white,
    marginLeft: 1, // optical center for play triangle
  },
});
