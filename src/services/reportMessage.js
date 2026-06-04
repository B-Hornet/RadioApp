/**
 * reportMessage — submit a message report to Firestore
 * ══════════════════════════════════════════════════════
 * Supports App Store guideline 1.2 (UGC apps must let users flag
 * objectionable content). Writes a single doc to the `reports`
 * collection. Reporting is allowed for anonymous and signed-in
 * listeners; an anonymous reporter is recorded as 'anonymous'.
 *
 * Firestore rules: clients may CREATE in `reports` but cannot read,
 * update, or delete — moderation review happens server-side only.
 *
 * Returns true on success, false on failure (the caller shows the
 * appropriate confirmation/alert). Never throws.
 */

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { REPORTS_COLLECTION } from '../constants';

export default async function reportMessage(message) {
  if (!message || !message.id) return false;
  const reporterUid = auth.currentUser?.uid || 'anonymous';
  try {
    await addDoc(collection(db, REPORTS_COLLECTION), {
      messageId: message.id,
      // Cap stored text so a pathological message can't bloat the
      // report doc; full content stays on the original Message.
      messageText: String(message.text || '').slice(0, 2000),
      reportedUid: message.uid || 'unknown',
      reportedUsername: message.username || 'unknown',
      reporterUid,
      reason: 'user_report',
      status: 'open',
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (e) {
    console.warn('reportMessage failed:', e?.message);
    return false;
  }
}
