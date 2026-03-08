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
import { spacing, fonts, borderRadius } from '../theme';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const buttonFade = useRef(new Animated.Value(0)).current;
  const logoFade = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(40)).current;
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoFade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(buttonFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(buttonSlide, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Looping video background — the MP4 logo animation */}
      {!videoError && (
        <Video
          source={require('../../assets/Radio App Background.mp4')}
          style={styles.backgroundVideo}
          resizeMode="cover"
          repeat={true}
          muted={true}
          playInBackground={false}
          playWhenInactive={false}
          disableFocus={true}
          controls={false}
          onLoad={() => setVideoReady(true)}
          onError={() => setVideoError(true)}
        />
      )}

      {/* Dark overlay to make buttons readable over video */}
      <View style={styles.videoOverlay} />

      {/* Fallback branding when video fails or is loading */}
      {!videoReady && (
        <View style={styles.brandingContainer}>
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

      {/* Buttons at bottom — redesigned with solid styling */}
      <Animated.View
        style={[
          styles.buttonContainer,
          { opacity: buttonFade, transform: [{ translateY: buttonSlide }] },
        ]}
      >
        <TouchableOpacity
          style={styles.listenButton}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.85}
        >
          <View style={styles.listenButtonInner}>
            <Text style={styles.listenButtonText}>Listen to Reeboot Radio</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.websiteButton}
          onPress={() => navigation.navigate('RadioPlayer')}
          activeOpacity={0.85}
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
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  brandingContainer: {
    ...StyleSheet.absoluteFillObject,
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
    color: '#CC0000',
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    letterSpacing: 3,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 80,
    width: '100%',
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  // Primary CTA — solid red button with glow
  listenButton: {
    width: '100%',
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#CC0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  listenButtonInner: {
    backgroundColor: '#CC0000',
    paddingVertical: spacing.md + 4,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: '#E62020',
  },
  listenButtonText: {
    color: '#FFFFFF',
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.heavy,
    letterSpacing: 0.5,
  },
  // Secondary CTA — outlined/ghost button
  websiteButton: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    width: '100%',
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(204, 0, 0, 0.6)',
    backgroundColor: 'rgba(204, 0, 0, 0.1)',
  },
  websiteButtonText: {
    color: '#CC0000',
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    letterSpacing: 0.5,
  },
});

export default WelcomeScreen;
