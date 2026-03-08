import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { colors, spacing, fonts, borderRadius } from '../theme';

const { width, height } = Dimensions.get('window');

// Animated ember/particle component
const Ember = ({ delay, startX, startY, size }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      translateY.setValue(0);
      translateX.setValue(0);
      opacity.setValue(0);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -(100 + Math.random() * 200),
          duration: 2000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: (Math.random() - 0.5) * 80,
          duration: 2000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.8,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1600 + Math.random() * 2000,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animate());
    };

    const timer = setTimeout(animate, delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.ember,
        {
          left: startX,
          top: startY,
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity,
          transform: [{ translateY }, { translateX }],
        },
      ]}
    />
  );
};

const WelcomeScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Buttons fade in after logo
    Animated.timing(buttonFade, {
      toValue: 1,
      duration: 800,
      delay: 800,
      useNativeDriver: true,
    }).start();

    // Continuous glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.2,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Generate embers
  const embers = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    delay: i * 300,
    startX: Math.random() * width,
    startY: height * 0.4 + Math.random() * (height * 0.4),
    size: 2 + Math.random() * 4,
  }));

  return (
    <View style={styles.container}>
      {/* Ember particles */}
      {embers.map((ember) => (
        <Ember
          key={ember.id}
          delay={ember.delay}
          startX={ember.startX}
          startY={ember.startY}
          size={ember.size}
        />
      ))}

      {/* Radial glow behind logo */}
      <Animated.View style={[styles.glowOuter, { opacity: glowAnim }]} />
      <Animated.View
        style={[styles.glowInner, { opacity: Animated.multiply(glowAnim, 1.5) }]}
      />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require('../../assets/Images/reebologo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Buttons */}
      <Animated.View style={[styles.buttonContainer, { opacity: buttonFade }]}>
        <TouchableOpacity
          style={styles.listenButton}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Text style={styles.listenButtonText}>Listen To Reeboot Radio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.enterButton}
          onPress={() => navigation.navigate('RadioPlayer')}
          activeOpacity={0.8}
        >
          <Text style={styles.enterButtonText}>Jump to Live Stream</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Ember particles
  ember: {
    position: 'absolute',
    backgroundColor: '#FF6B00',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  // Glow effects
  glowOuter: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: '#FF6B00',
    top: height * 0.2,
  },
  glowInner: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#CC3300',
    top: height * 0.2 + 50,
  },
  // Logo
  logoContainer: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logo: {
    width: 260,
    height: 260,
  },
  // Buttons
  buttonContainer: {
    position: 'absolute',
    bottom: 100,
    width: '100%',
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  listenButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF3B00',
    paddingVertical: spacing.md + 4,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.xl,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: '#FF3B00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  listenButtonText: {
    color: '#FF3B00',
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.heavy,
    letterSpacing: 1,
  },
  enterButton: {
    paddingVertical: spacing.md + 4,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.xl,
    width: '100%',
    alignItems: 'center',
  },
  enterButtonText: {
    color: '#FF6B00',
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    letterSpacing: 0.5,
  },
});

export default WelcomeScreen;
