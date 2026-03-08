import React, { useEffect, useRef } from 'react';
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
import { spacing, fonts } from '../theme';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const buttonFade = useRef(new Animated.Value(0)).current;
  const logoFade = useRef(new Animated.Value(0)).current;

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

      {/* Branding */}
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
  brandingContainer: {
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
