import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import Video from 'react-native-video';
import { spacing, fonts, borderRadius } from '../theme';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const buttonFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Buttons fade in after video starts
    Animated.timing(buttonFade, {
      toValue: 1,
      duration: 1000,
      delay: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Looping video background — covers full screen */}
      <Video
        source={require('../../assets/Images/Radio App Background.mp4')}
        style={styles.backgroundVideo}
        resizeMode="cover"
        repeat={true}
        muted={true}
        playInBackground={false}
        playWhenInactive={false}
        disableFocus={true}
        controls={false}
      />

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
  // Video fills the entire screen edge-to-edge
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: width,
    height: height,
  },
  // Subtle gradient overlay at the bottom so buttons are readable
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.35,
    backgroundColor: 'transparent',
    // Fallback: a subtle dark tint at the bottom
    borderTopWidth: 0,
  },
  // Buttons positioned at the bottom like your original app
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
