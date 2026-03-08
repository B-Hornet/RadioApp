import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { colors, spacing, fonts, borderRadius } from '../theme';

const MerchShop = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{'\uD83D\uDC55'}</Text>
      <Text style={styles.title}>Merch Shop</Text>
      <Text style={styles.subtitle}>
        Rep Reeboot Radio with exclusive gear, hoodies, hats, and more.
      </Text>
      <View style={styles.comingSoonBadge}>
        <Text style={styles.comingSoonText}>COMING SOON</Text>
      </View>
      <Text style={styles.hint}>
        Stay tuned! We are working on bringing you the freshest Reeboot Radio merch.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  comingSoonBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
  },
  comingSoonText: {
    color: colors.textPrimary,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
    letterSpacing: 2,
  },
  hint: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

export default MerchShop;

