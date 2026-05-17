/**
 * DeleteAccountModal — irreversible account deletion
 * ════════════════════════════════════════════════════
 * Two-step UX: explicit-language confirmation, then password
 * re-entry. Firebase requires a "recent" credential for delete,
 * so we use reauthenticateWithCredential before user.delete().
 *
 * Required for App Store compliance (guideline 5.1.1(v),
 * effective 2022) and Google Play (effective 2024).
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

export default function DeleteAccountModal({
  visible,
  onClose,
  onConfirm,
  authError,
  clearError,
}) {
  const [stage, setStage] = useState('warn'); // 'warn' | 'password'
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setStage('warn');
      setPassword('');
      setSubmitting(false);
      clearError?.();
    }
  }, [visible, clearError]);

  const handleConfirm = async () => {
    if (!password) return;
    setSubmitting(true);
    const success = await onConfirm(password);
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
          <Text style={styles.title}>DELETE ACCOUNT</Text>

          {stage === 'warn' ? (
            <>
              <Text style={styles.body}>
                This permanently deletes your account, profile, chat
                messages, song requests, and reactions. It cannot be
                undone.
              </Text>
              <Text style={styles.bodyMuted}>
                You'll be signed out and returned to anonymous mode.
              </Text>
              <Pressable
                style={styles.dangerBtn}
                onPress={() => {
                  clearError?.();
                  setStage('password');
                }}
              >
                <Text style={styles.dangerBtnText}>Continue</Text>
              </Pressable>
              <Pressable style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.body}>
                Re-enter your password to confirm.
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoFocus
              />
              {authError ? <Text style={styles.error}>{authError}</Text> : null}
              <Pressable
                style={[
                  styles.dangerBtn,
                  (!password || submitting) && styles.dangerBtnDisabled,
                ]}
                onPress={handleConfirm}
                disabled={!password || submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.dangerBtnText}>Delete My Account</Text>
                )}
              </Pressable>
              <Pressable style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
            </>
          )}
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
    borderColor: 'rgba(255, 69, 58, 0.4)',
    padding: spacing.xl,
  },
  title: {
    fontFamily: 'Oswald-Bold',
    fontWeight: '700',
    fontSize: typography.size.xxl,
    color: colors.error,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  body: {
    fontFamily: 'DMSans-Regular',
    fontSize: typography.size.md,
    color: colors.textPrimary,
    lineHeight: typography.size.md * typography.lineHeight.relaxed,
    marginBottom: spacing.md,
  },
  bodyMuted: {
    fontFamily: 'DMSans-Regular',
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
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
  dangerBtn: {
    backgroundColor: colors.error,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  dangerBtnDisabled: {
    opacity: 0.5,
  },
  dangerBtnText: {
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
