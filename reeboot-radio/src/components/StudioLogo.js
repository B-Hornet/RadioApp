import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import Video from 'react-native-video';
import { colors } from '../theme/tokens';

const StudioLogo = ({ size = 120, showVideo = false, style }) => {
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {showVideo && (
        <Video
          source={require('../../../assets/Radio App Background.mp4')}
          style={styles.videoBg}
          resizeMode="cover"
          repeat
          muted
          disableFocus
          controls={false}
        />
      )}
      <Animated.View style={[styles.glowRing, { opacity: pulseAnim, width: size, height: size, borderRadius: size / 2 }]} />
      <Image
        source={require('../../../assets/Images/reebologo.png')}
        style={[styles.logo, { width: size * 0.75, height: size * 0.75, borderRadius: (size * 0.75) / 2 }]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    overflow: 'hidden',
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.dial,
  },
  logo: {
    backgroundColor: colors.boothSurface,
  },
});

export default StudioLogo;
