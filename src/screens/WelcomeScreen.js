import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native';
import { colors, spacing, fonts, borderRadius } from '../theme';

const WelcomeScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Image
          source={require('../../assets/Images/reebologo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Reeboot Radio</Text>
        <Text style={styles.subtitle}>
          Live DJ sets, community chat, and the best music — all in one place.
        </Text>

        <TouchableOpacity
          style={styles.enterButton}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Text style={styles.enterButtonText}>Enter the Station</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.listenButton}
          onPress={() => navigation.navigate('RadioPlayer')}
          activeOpacity={0.8}
        >
          <Text style={styles.listenButtonText}>Jump to Live Stream</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fonts.sizes.hero,
    fontWeight: fonts.weights.heavy,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fonts.sizes.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xxl,
  },
  enterButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.xl,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  enterButtonText: {
    color: colors.textPrimary,
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
  },
  listenButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.xl,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  listenButtonText: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.medium,
  },
});

export default WelcomeScreen;

