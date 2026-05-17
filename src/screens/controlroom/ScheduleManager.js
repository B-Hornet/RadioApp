/**
 * ScheduleManager — CRUD for DJ schedule slots
 * ═══════════════════════════════════════════════
 * Real-time Firestore sync. Add/edit/delete slots, set live toggle.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { db } from '../../firebaseConfig';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { colors, typography, spacing, radius } from '../../theme/tokens';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const SlotForm = ({ slot, onSave, onCancel }) => {
  const [djName, setDjName] = useState(slot?.djName || '');
  const [showName, setShowName] = useState(slot?.showName || '');
  const [startTime, setStartTime] = useState(slot?.startTime || '');
  const [endTime, setEndTime] = useState(slot?.endTime || '');

  const handleSave = () => {
    if (!djName.trim() || !showName.trim() || !startTime.trim() || !endTime.trim()) {
      Alert.alert('Missing Fields', 'All fields are required.');
      return;
    }
    onSave({ djName: djName.trim(), showName: showName.trim(), startTime: startTime.trim(), endTime: endTime.trim() });
  };

  return (
    <View style={styles.form}>
      <TextInput style={styles.input} placeholder="DJ Name" placeholderTextColor={colors.textMuted} value={djName} onChangeText={setDjName} />
      <TextInput style={styles.input} placeholder="Show Name" placeholderTextColor={colors.textMuted} value={showName} onChangeText={setShowName} />
      <View style={styles.timeRow}>
        <TextInput style={[styles.input, styles.timeInput]} placeholder="Start (e.g. 10 PM)" placeholderTextColor={colors.textMuted} value={startTime} onChangeText={setStartTime} />
        <TextInput style={[styles.input, styles.timeInput]} placeholder="End (e.g. 12 AM)" placeholderTextColor={colors.textMuted} value={endTime} onChangeText={setEndTime} />
      </View>
      <View style={styles.formActions}>
        <Pressable style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </Pressable>
        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default function ScheduleManager() {
  const [slots, setSlots] = useState([]);
  const [activeDay, setActiveDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const [loading, setLoading] = useState(true);
  const [editingSlot, setEditingSlot] = useState(null); // null | 'new' | slot object
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'schedule'),
      where('day', '==', activeDay),
      orderBy('order', 'asc'),
    );
    const unsub = onSnapshot(q, (snap) => {
      setSlots(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.warn('Schedule listener error:', err.message);
      setLoading(false);
    });
    return () => unsub();
  }, [activeDay]);

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editingSlot === 'new') {
        await addDoc(collection(db, 'schedule'), {
          ...formData,
          day: activeDay,
          isLive: false,
          order: slots.length,
        });
      } else {
        await updateDoc(doc(db, 'schedule', editingSlot.id), formData);
      }
      setEditingSlot(null);
    } catch (e) {
      Alert.alert('Error', 'Failed to save slot: ' + e.message);
    }
    setSaving(false);
  };

  const handleDelete = (slot) => {
    Alert.alert('Delete Slot', `Remove "${slot.showName}" by ${slot.djName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'schedule', slot.id));
          } catch (e) {
            Alert.alert('Error', 'Failed to delete: ' + e.message);
          }
        },
      },
    ]);
  };

  const handleSetLive = async (slot) => {
    try {
      // Clear all live flags for this day, then set the selected one
      const batch = writeBatch(db);
      slots.forEach((s) => {
        if (s.isLive) batch.update(doc(db, 'schedule', s.id), { isLive: false });
      });
      batch.update(doc(db, 'schedule', slot.id), { isLive: !slot.isLive });
      await batch.commit();
    } catch (e) {
      Alert.alert('Error', 'Failed to update live status: ' + e.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Day selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayRow}>
        {DAYS.map((day) => (
          <Pressable
            key={day}
            onPress={() => { setActiveDay(day); setEditingSlot(null); }}
            style={[styles.dayTab, activeDay === day && styles.dayTabActive]}
          >
            <Text style={[styles.dayText, activeDay === day && styles.dayTextActive]}>{day}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ paddingVertical: spacing.xl }} />
      ) : (
        <>
          {slots.map((slot) => (
            <View key={slot.id} style={[styles.slotCard, slot.isLive && styles.slotCardLive]}>
              {editingSlot?.id === slot.id ? (
                <SlotForm slot={slot} onSave={handleSave} onCancel={() => setEditingSlot(null)} />
              ) : (
                <>
                  <View style={styles.slotInfo}>
                    <Text style={styles.slotTime}>{slot.startTime} – {slot.endTime}</Text>
                    <Text style={styles.slotShow}>{slot.showName}</Text>
                    <Text style={styles.slotDj}>{slot.djName}</Text>
                  </View>
                  <View style={styles.slotActions}>
                    <Pressable
                      style={[styles.liveToggle, slot.isLive && styles.liveToggleActive]}
                      onPress={() => handleSetLive(slot)}
                    >
                      <Text style={[styles.liveToggleText, slot.isLive && styles.liveToggleTextActive]}>
                        {slot.isLive ? 'LIVE' : 'SET LIVE'}
                      </Text>
                    </Pressable>
                    <Pressable style={styles.editBtn} onPress={() => setEditingSlot(slot)}>
                      <Text style={styles.editBtnText}>Edit</Text>
                    </Pressable>
                    <Pressable style={styles.deleteBtn} onPress={() => handleDelete(slot)}>
                      <Text style={styles.deleteBtnText}>Del</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          ))}

          {editingSlot === 'new' ? (
            <SlotForm onSave={handleSave} onCancel={() => setEditingSlot(null)} />
          ) : (
            <Pressable style={styles.addBtn} onPress={() => setEditingSlot('new')}>
              <Text style={styles.addBtnText}>+ Add Time Slot</Text>
            </Pressable>
          )}

          {slots.length === 0 && !editingSlot && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No slots for {activeDay}</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.screen, paddingBottom: 140 },
  dayRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  dayTab: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.sm,
    backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder,
  },
  dayTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayText: { fontFamily: 'DMSans-SemiBold', fontWeight: '600', fontSize: typography.size.xs, color: colors.textMuted },
  dayTextActive: { color: colors.white },

  slotCard: {
    backgroundColor: colors.bgSurface, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.glassBorder, padding: spacing.md, marginBottom: spacing.md,
    flexDirection: 'row', alignItems: 'center',
  },
  slotCardLive: { borderColor: colors.primary },
  slotInfo: { flex: 1 },
  slotTime: { fontFamily: 'JetBrainsMono-Regular', fontSize: typography.size.xs, color: colors.textMuted },
  slotShow: { fontFamily: 'Oswald-Bold', fontWeight: '700', fontSize: typography.size.lg, color: colors.textPrimary, marginTop: 2 },
  slotDj: { fontFamily: 'DMSans-Regular', fontSize: typography.size.sm, color: colors.textSecondary, marginTop: 2 },
  slotActions: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },

  liveToggle: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm,
    borderWidth: 1, borderColor: colors.glassBorder,
  },
  liveToggleActive: { backgroundColor: colors.live, borderColor: colors.live },
  liveToggleText: { fontFamily: 'DMSans-SemiBold', fontSize: 9, color: colors.textMuted, letterSpacing: 0.5 },
  liveToggleTextActive: { color: colors.white },

  editBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm, backgroundColor: colors.bgHighlight },
  editBtnText: { fontFamily: 'DMSans-Medium', fontSize: 10, color: colors.textSecondary },
  deleteBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm, backgroundColor: 'rgba(255, 69, 58, 0.15)' },
  deleteBtnText: { fontFamily: 'DMSans-Medium', fontSize: 10, color: colors.error },

  addBtn: {
    backgroundColor: colors.glass, borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed',
    borderColor: colors.primary, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm,
  },
  addBtnText: { fontFamily: 'DMSans-SemiBold', fontWeight: '600', fontSize: typography.size.md, color: colors.primary },

  form: { marginBottom: spacing.md },
  input: {
    backgroundColor: colors.bgElevated, borderRadius: radius.sm, borderWidth: 1,
    borderColor: colors.glassBorder, padding: spacing.sm, color: colors.textPrimary,
    fontFamily: 'DMSans-Regular', fontSize: typography.size.sm, marginBottom: spacing.sm,
  },
  timeRow: { flexDirection: 'row', gap: spacing.sm },
  timeInput: { flex: 1 },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
  cancelBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  cancelBtnText: { fontFamily: 'DMSans-Medium', fontSize: typography.size.sm, color: colors.textMuted },
  saveBtn: { backgroundColor: colors.primary, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.sm },
  saveBtnText: { fontFamily: 'DMSans-SemiBold', fontWeight: '600', fontSize: typography.size.sm, color: colors.white },

  empty: { paddingVertical: spacing.xxl, alignItems: 'center' },
  emptyText: { fontFamily: 'DMSans-Regular', fontSize: typography.size.md, color: colors.textMuted },
});
