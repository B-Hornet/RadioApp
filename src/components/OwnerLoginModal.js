/**
 * OwnerLoginModal — Firebase Auth login for owner access
 * ═══════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { auth } from '../firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { colors, typography, spacing, radius } from '../theme/tokens';

export default function OwnerLoginModal({
  visible,
  onClose,
  onLogin,
  error,
  hasBiometricCreds,
  onEnableBiometric,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) return;
    setSubmitting(true);
    const trimmedEmail = email.trim();
    const success = await onLogin(trimmedEmail, password);
    setSubmitting(false);
    if (success) {
      // Offer to save for Face ID on first successful sign-in. Skip
      // if creds are already saved (don't pester returning owners).
      if (!hasBiometricCreds && onEnableBiometric) {
        Alert.alert(
          'Save for Face ID?',
          'Use Face ID next time so you don\'t have to type the password again. Stored only on this device.',
          [
            { text: 'Not now', style: 'cancel' },
            {
              text: 'Save',
              onPress: async () => {
                await onEnableBiometric(trimmedEmail, password);
              },
            },
          ],
        );
      }
      setEmail('');
      setPassword('');
      setResetSent(false);
      onClose();
    }
  };

  const handleResetPassword = async () => {
    const resetEmail = email.trim();
    if (!resetEmail) {
      Alert.alert('Enter Email', 'Type your email address above, then tap Reset Password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
      Alert.alert('Reset Email Sent', `A password reset link was sent to ${resetEmail}. Check your inbox.`);
    } catch (e) {
      // Surface the actual code so triage doesn't have to guess.
      // Most common in this project: auth/operation-not-allowed (the
      // Email/Password provider isn't enabled in Firebase Console),
      // auth/missing-android-pkg-name (when the deep-link continueUrl
      // isn't whitelisted), or auth/unauthorized-domain.
      console.warn('[OwnerLoginModal] reset failed:', e?.code, e?.message);
      let msg;
      switch (e?.code) {
        case 'auth/user-not-found':
          msg = 'No account found with that email.';
          break;
        case 'auth/invalid-email':
          msg = 'That email address is not valid.';
          break;
        case 'auth/operation-not-allowed':
          msg = 'Email/Password sign-in is disabled. Enable it in Firebase Console.';
          break;
        case 'auth/network-request-failed':
          msg = 'Network error. Check connection and try again.';
          break;
        case 'auth/too-many-requests':
          msg = 'Too many attempts. Try again later.';
          break;
        default:
          msg = `Reset failed: ${e?.code || 'unknown'}\n${e?.message || ''}`;
      }
      Alert.alert('Reset Failed', msg);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.card}>
          <Text style={styles.title}>CONTROL ROOM</Text>
          <Text style={styles.subtitle}>Owner authentication required</Text>

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
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            style={[styles.loginBtn, submitting && styles.loginBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.loginBtnText}>Sign In</Text>
            )}
          </Pressable>

          <Pressable style={styles.resetBtn} onPress={handleResetPassword}>
            <Text style={styles.resetBtnText}>
              {resetSent ? 'Reset email sent — check inbox' : 'Forgot Password?'}
            </Text>
          </Pressable>

          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
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
    marginBottom: spacing.xl,
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
  loginBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    fontFamily: 'Oswald-Bold',
    fontWeight: '700',
    fontSize: typography.size.lg,
    color: colors.white,
    letterSpacing: 1,
  },
  resetBtn: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  resetBtnText: {
    fontFamily: 'DMSans-Medium',
    fontSize: typography.size.sm,
    color: colors.primary,
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
