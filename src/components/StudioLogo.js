/**
 * StudioLogo — Animated station identity with MP4 support
 * ═══════════════════════════════════════════════════════════
 * The signature element of the Midnight Broadcast Booth.
 * Shows the animated MP4 logo inside a circular mask with
 * pulsing glow rings. Falls back to a static logo if video fails.
 *
 * Usage:
 *   <StudioLogo size={160} />                    // Full hero with glow + rings
 *   <StudioLogo size={40} glow={false} />        // Compact for headers
 *   <StudioLogo size={72} spinning playing />     // Spinning when live
 *   <StudioLogo size={34} glow={false} mini />    // Mini player bar
 */

import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Video from 'react-native-video';
import { colors, elevation } from '../theme/tokens';

// Asset paths — update these to match your project
const LOGO_VIDEO = require('../../assets/Images/Radio App Background.mp4');
const LOGO_IMAGE = require('../../assets/Images/reebologo.png');

export default function StudioLogo({
  size = 120,
  glow = true,
  spinning = false,
  playing = true,
  mini = false,
}) {
  const [videoError, setVideoError] = useState(false);

  // Pulse animation
  const pulse = useSharedValue(1);
  // Spin animation
  const spin = useSharedValue(0);
  // Ring pulse
  const ringPulse = useSharedValue(0);
  // Spinning state as shared value (avoids stale closure in worklet)
  const isSpinning = useSharedValue(spinning ? 1 : 0);

  useEffect(() => {
    // Logo pulse
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
    // Ring pulse
    ringPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, []);

  useEffect(() => {
    isSpinning.value = spinning ? 1 : 0;
    if (spinning) {
      spin.value = withRepeat(
        withTiming(360, { duration: 8000, easing: Easing.linear }),
        -1,
      );
    } else {
      spin.value = withTiming(0, { duration: 500 });
    }
  }, [spinning]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: isSpinning.value
      ? [{ rotate: `${spin.value}deg` }]
      : [{ scale: pulse.value }],
  }));

  const ring1Style = useAnimatedStyle(() => ({
    opacity: interpolate(ringPulse.value, [0, 1], [0.3, 0.8]),
    transform: [{ scale: interpolate(ringPulse.value, [0, 1], [1, 1.04]) }],
  }));

  const ring2Style = useAnimatedStyle(() => ({
    opacity: interpolate(ringPulse.value, [0, 1], [0.15, 0.4]),
    transform: [{ scale: interpolate(ringPulse.value, [0, 1], [1, 1.06]) }],
  }));

  const showVideo = !videoError && !mini && size >= 100;

  return (
    <View style={[styles.wrapper, { width: size + 20, height: size + 20 }]}>
      {/* Outer glow rings — only on larger sizes */}
      {glow && size >= 60 && (
        <>
          <Animated.View
            style={[
              styles.ring,
              {
                width: size + 8,
                height: size + 8,
                borderRadius: (size + 8) / 2,
                borderColor: colors.primaryBorder,
              },
              ring1Style,
            ]}
          />
          <Animated.View
            style={[
              styles.ring,
              {
                width: size + 18,
                height: size + 18,
                borderRadius: (size + 18) / 2,
                borderColor: 'rgba(255, 107, 0, 0.06)',
              },
              ring2Style,
            ]}
          />
        </>
      )}

      {/* Main logo container */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          glow && styles.glowShadow,
          containerStyle,
        ]}
      >
        {showVideo ? (
          <Video
            source={LOGO_VIDEO}
            style={[styles.video, { width: size, height: size, borderRadius: size / 2 }]}
            resizeMode="cover"
            repeat
            muted
            paused={!playing}
            onError={() => setVideoError(true)}
            // Prevent controller UI
            controls={false}
          />
        ) : (
          <Image
            source={LOGO_IMAGE}
            style={[styles.fallbackImage, { width: size * 0.6, height: size * 0.6 }]}
            resizeMode="contain"
          />
        )}

        {/* Overlay border for clean edge */}
        <View
          style={[
            styles.borderOverlay,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
  },
  logoContainer: {
    overflow: 'hidden',
    backgroundColor: colors.bgElevated,
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowShadow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 8,
  },
  video: {
    position: 'absolute',
  },
  fallbackImage: {
    tintColor: colors.primary,
  },
  borderOverlay: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.12)',
  },
});
