/**
 * ListenerAuthModal — sign in / sign up for chat posting
 * ═════════════════════════════════════════════════════════
 * Anonymous users can read chat. To post, they sign up (or sign
 * back in). On success the modal closes and the caller can
 * proceed; firestore.rules now permits Messages.create.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, typography, spacing, radius } from '../theme/tokens';

const MODES = { SIGN_IN: 'signIn', SIGN_UP: 'signUp' };

export default function ListenerAuthModal({
  visible,
  onClose,
  onSignIn,
  onSignUp,
  authError,
  clearError,
}) {
  const [mode, setMode] = useState(MODES.SIGN_UP);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reset transient state every time the modal opens.
  useEffect(() => {
    if (visible) {
      setEmail('');
      setPassword('');
      setDisplayName('');
      setSubmitting(false);
      setMode(MODES.SIGN_UP);
      clearError?.();
    }
  }, [visible, clearError]);

  const switchMode = (next) => {
    if (mode === next) return;
    setMode(next);
    clearError?.();
  };

  const canSubmit =
    !submitting &&
    email.trim().length > 3 &&
    password.length >= 6 &&
    (mode === MODES.SIGN_IN || displayName.trim().length >= 2);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    let success = false;
    if (mode === MODES.SIGN_UP) {
      success = await onSignUp(email, password, displayName);
    } else {
      success = await onSignIn(email, password);
    }
    setSubmitting(false);
    if (success) onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.card}>
          <Text style={styles.title}>JOIN THE CHAT</Text>
          <Text style={styles.subtitle}>
            {mode === MODES.SIGN_UP
              ? 'Create a listener account to post messages'
              : 'Welcome back — sign in to post messages'}
          </Text>

          {/* Mode toggle */}
          <View style={styles.tabRow}>
            <Pressable
              onPress={() => switchMode(MODES.SIGN_UP)}
              style={[styles.tab, mode === MODES.SIGN_UP && styles.tabActive]}
            >
              <Text style={[styles.tabText, mode === MODES.SIGN_UP && styles.tabTextActive]}>
                Sign Up
              </Text>
            </Pressable>
            <Pressable
              onPress={() => switchMode(MODES.SIGN_IN)}
              style={[styles.tab, mode === MODES.SIGN_IN && styles.tabActive]}
            >
              <Text style={[styles.tabText, mode === MODES.SIGN_IN && styles.tabTextActive]}>
                Sign In
              </Text>
            </Pressable>
          </View>

          {mode === MODES.SIGN_UP && (
            <TextInput
              style={styles.input}
              placeholder="Display name (shown in chat)"
              placeholderTextColor={colors.textMuted}
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder={mode === MODES.SIGN_UP ? 'Password (min 6 chars)' : 'Password'}
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {authError ? <Text style={styles.error}>{authError}</Text> : null}

          <Pressable
            style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            {submitting ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>
                {mode === MODES.SIGN_UP ? 'Create Account' : 'Sign In'}
              </Text>
            )}
          </Pressable>

          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Keep Lurking</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.screen,
  },
  card: {
    width: '100%',
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.xl,
  },
  title: {
    fontFamily: 'Oswald-Bold',
    fontWeight: '700',
    fontSize: typography.size.xxl,
    color: colors.primary,
    letterSpacing: 2,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'JetBrainsMono-Regular',
    fontWeight: '400',
    fontSize: typography.size.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  tabRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontFamily: 'DMSans-SemiBold',
    fontWeight: '600',
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.white,
  },
  input: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.md,
    color: colors.textPrimary,
    fontFamily: 'DMSans-Regular',
    fontSize: typography.size.md,
    marginBottom: spacing.md,
  },
  error: {
    fontFamily: 'DMSans-Medium',
    fontSize: typography.size.sm,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    fontFamily: 'Oswald-Bold',
    fontWeight: '700',
    fontSize: typography.size.lg,
    color: colors.white,
    letterSpacing: 1,
  },
  cancelBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  cancelBtnText: {
    fontFamily: 'DMSans-Medium',
    fontSize: typography.size.md,
    color: colors.textMuted,
  },
});
