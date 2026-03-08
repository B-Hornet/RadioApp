import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import Video from 'react-native-video';
import { spacing, fonts } from '../theme';

const { width, height } = Dimensions.get('window');

let videoSource = null;
try {
  videoSource = require('../../assets/Images/Radio App Background.mp4');
} catch (e) {
  videoSource = null;
}

const WelcomeScreen = ({ navigation }) => {
  const buttonFade = useRef(new Animated.Value(0)).current;
  const logoFade = useRef(new Animated.Value(0)).current;
  const [videoError, setVideoError] = useState(!videoSource);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoFade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(buttonFade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Video background if available */}
      {videoSource && !videoError && (
        <Video
          source={videoSource}
          style={styles.backgroundVideo}
          resizeMode="cover"
          repeat={true}
          muted={true}
          playInBackground={false}
          playWhenInactive={false}
          disableFocus={true}
          controls={false}
          onError={() => setVideoError(true)}
        />
      )}

      {/* Fallback branding when no video */}
      {videoError && (
        <View style={styles.fallbackBackground}>
          <Animated.View style={[styles.logoContainer, { opacity: logoFade }]}>
            <Image
              source={require('../../assets/Images/reebologo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>YOUR SOUND. YOUR STATION.</Text>
          </Animated.View>
        </View>
      )}

      {/* Dark overlay for button readability */}
      <View style={styles.overlay} />

      {/* Buttons at bottom */}
      <Animated.View style={[styles.buttonContainer, { opacity: buttonFade }]}>
        <TouchableOpacity
          style={styles.listenButton}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Text style={styles.listenButtonText}>Listen To Reeboot Radio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.websiteButton}
          onPress={() => navigation.navigate('RadioPlayer')}
          activeOpacity={0.8}
        >
          <Text style={styles.websiteButtonText}>Go to the Website</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: width,
    height: height,
  },
  fallbackBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: -60,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: spacing.lg,
  },
  tagline: {
    color: '#FF6B00',
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    letterSpacing: 3,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.35,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 80,
    width: '100%',
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  listenButton: {
    paddingVertical: spacing.md + 4,
    paddingHorizontal: spacing.xxl,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  listenButtonText: {
    color: '#FF3B00',
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.weights.heavy,
    textShadowColor: 'rgba(255, 59, 0, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  websiteButton: {
    paddingVertical: spacing.md + 4,
    paddingHorizontal: spacing.xxl,
    width: '100%',
    alignItems: 'center',
  },
  websiteButtonText: {
    color: '#FF6B00',
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.weights.heavy,
    textShadowColor: 'rgba(255, 107, 0, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
});

export default WelcomeScreen;
