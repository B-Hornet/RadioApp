/**
 * MessageActionSheet — moderation actions for a chat message
 * ════════════════════════════════════════════════════════════
 * App Store guideline 1.2: long-press a message (not your own) to
 * Report it or Block its author. Bottom-anchored sheet styled to
 * the Midnight Broadcast Booth system (dark surface, amber accent).
 *
 * Stateless and controlled: the parent owns the target message and
 * the report/block handlers. Tapping the scrim or Cancel dismisses.
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../theme/tokens';
import { MODERATION_STRINGS } from '../constants';

export default function MessageActionSheet({
  visible,
  message,
  onReport,
  onBlock,
  onClose,
}) {
  const username = message?.username || MODERATION_STRINGS.blockedRowLabel;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.scrim} onPress={onClose}>
        {/* Stop propagation so taps inside the sheet don't dismiss it. */}
        <Pressable style={styles.sheetWrap} onPress={() => {}}>
          <SafeAreaView edges={['bottom']}>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <Text style={styles.title}>{MODERATION_STRINGS.sheetTitle}</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {username}
              </Text>

              <Pressable
                style={styles.actionRow}
                onPress={onReport}
                android_ripple={{ color: colors.glassHover }}
              >
                <Text style={styles.actionIcon}>⚑</Text>
                <Text style={styles.actionText}>
                  {MODERATION_STRINGS.reportAction}
                </Text>
              </Pressable>

              <Pressable
                style={styles.actionRow}
                onPress={onBlock}
                android_ripple={{ color: colors.glassHover }}
              >
                <Text style={[styles.actionIcon, styles.actionIconDanger]}>⊘</Text>
                <Text style={[styles.actionText, styles.actionTextDanger]}>
                  {MODERATION_STRINGS.blockAction}
                </Text>
              </Pressable>

              <Pressable style={styles.cancelRow} onPress={onClose}>
                <Text style={styles.cancelText}>
                  {MODERATION_STRINGS.cancel}
                </Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  sheetWrap: {
    width: '100%',
  },
  sheet: {
    backgroundColor: colors.bgSurface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.glassBorder,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: 'Oswald-Bold',
    fontWeight: '700',
    fontSize: typography.size.lg,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  subtitle: {
    fontFamily: 'DMSans-Regular',
    fontWeight: '400',
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginBottom: spacing.sm,
  },
  actionIcon: {
    fontSize: typography.size.lg,
    color: colors.primary,
    width: 22,
    textAlign: 'center',
  },
  actionIconDanger: {
    color: colors.error,
  },
  actionText: {
    fontFamily: 'DMSans-SemiBold',
    fontWeight: '600',
    fontSize: typography.size.md,
    color: colors.textPrimary,
  },
  actionTextDanger: {
    color: colors.error,
  },
  cancelRow: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  cancelText: {
    fontFamily: 'DMSans-Medium',
    fontWeight: '500',
    fontSize: typography.size.md,
    color: colors.textMuted,
  },
});
