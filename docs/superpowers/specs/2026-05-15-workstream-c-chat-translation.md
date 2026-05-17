# Workstream C — Chat Translation

**Date:** 2026-05-15
**Status:** Approved, ready for implementation plan
**Predecessor:** Workstream B (i18n infrastructure) — locale list, `i18n.language`, glossary
**Affects:** Firebase project `livestreamchat-2d575` (Cloud Functions bootstrap)

## 1. Goal

Every chat message in `Messages` is readable in the viewer's UI language. Source language is auto-detected once at write time; translations are generated on demand at read time and cached.

## 2. Architecture

```
WRITE PATH
  ChatRoom.js  ──addDoc──>  Messages/{messageId}
                                │
                                ▼ Firestore trigger
                     onChatMessageCreate
                                │
                                ▼ Google Cloud Translation (detect)
                     update Messages/{messageId} with:
                       sourceLanguage: 'en'    (detected)
                       translateEligible: true
                       detectedAt: serverTimestamp

READ PATH (viewer UI locale != source)
  ChatBubble renders
       │
       │  if eligible && viewerLang != sourceLanguage
       ▼
  getOrCreateTranslation(messageId, targetLang)
       │
       ├─ Cache HIT  → read Messages/{id}/translations/{lang} → return
       └─ Cache MISS → call Translation API
                        → write Messages/{id}/translations/{lang}
                        → return translated text
```

## 3. Firestore schema

```
Messages/{messageId}                                # existing
  text: string                                      # existing — source, never modified
  username, uid, role, timestamp, ...               # existing
  sourceLanguage: 'en' | 'es' | ...                 # NEW
  translateEligible: boolean                        # NEW
  detectedAt: Timestamp                             # NEW

Messages/{messageId}/translations/{lang}            # NEW subcollection
  text: string
  translatedAt: Timestamp
  translator: 'google-cloud' | 'manual'
  charCount: number
```

Subcollection (not nested map) so re-translating doesn't bump the parent doc's `updateTime` and trigger every viewer's `onSnapshot`.

## 4. Cloud Functions

The `livestreamchat-2d575` project has no CFs yet. Workstream C deploys its first CFs.

| Function | Type | Runtime | Purpose |
|---|---|---|---|
| `onChatMessageCreate` | Firestore onCreate `Messages/{id}` | Node 22 | Detect source language, set eligibility |
| `getOrCreateTranslation` | onCall (auth + App Check) | Node 22 | Read cache → translate on miss → write through |
| `cleanupOldTranslations` | scheduled daily 03:00 ET | Node 22 | Delete translations for messages > 30d old |

## 5. Gating model

Free for all authenticated users. Per-UID and global rate limits in `getOrCreateTranslation`:

| Cap | Limit | Behavior |
|---|---|---|
| Per UID | 200 translations / day (cache hits don't count) | Soft 150 → warning toast; hard 200 → 429 + UI toast |
| Per chatroom (global) | 5,000 API calls / day | Hard cap; logs alert email |
| Reset | midnight UTC | |

Counts live at `rateLimits/{uid}` (per-user) and `rateLimits/_global` (shared); both updated transactionally inside the CF.

## 6. Cost model

- Google Cloud Translation API: $20 per million characters (detection) + $20 per million characters (translation).
- Assumed engagement: 100 messages/hour × 12 active hours/day × 50 chars/message.
- Detection: 60k chars/day = **$1.20/day**.
- Translation: assume 30% × 1 target lang = 18k chars/day = **$0.36/day**.
- **Projected baseline: ~$1.56/day** (~$47/month). Hard cap protects against runaway.

Daily monitor: a scheduled function emails Buzz a daily cost summary for the first 30 days.

## 7. Viewer UX

Auto-translate eligible bubbles when `sourceLanguage != i18n.language`. Show discreet globe icon + "translated from <X>" affordance.

Tap globe → bubble flips to original text with "show translation" affordance to flip back.

Behavior matrix:

| Viewer UI | Message source | translateEligible | Renders |
|---|---|---|---|
| en | en | true | original (no badge) |
| ja | en | true | translated to ja + globe + "translated from English" |
| ja | en | false | original (single emoji, undetermined) |
| any | any | not yet detected | original (eligibility flag may be `undefined` for first ~500ms) |

## 8. Settings — "auto-translate" toggle

In ListenerProfile → Chat → Auto-translate.

Default: ON for non-English UI locales, OFF for English UI (most chat is English; defaulting on would spam the API).

User can override either direction.

## 9. App Check (hard requirement)

Without App Check, anyone with the public Firebase config can call `getOrCreateTranslation` from a script and burn the daily budget.

- iOS: DeviceCheck provider.
- Android: Play Integrity provider.
- Web (if ever): reCAPTCHA Enterprise.
- Roll out in **monitor-mode for 24h** before enforcing — surfaces missing-token clients without blocking real users.
- Anonymous Firebase users + App Check works; tested in the bootstrap path during implementation.

## 10. Firestore rules update

```
match /Messages/{messageId} {
  allow read: if request.auth != null;
  allow create: if isIdentified() && validMessage();
  // existing — server-only writes for sourceLanguage/translateEligible/detectedAt
  allow update: if false;

  match /translations/{lang} {
    allow read: if request.auth != null;
    allow write: if false;  // CF-only
  }
}

match /rateLimits/{uid} {
  allow read, write: if false;  // CF-only
}
```

`firestore.rules` and `firestore.rules.strict` will need to be reconciled before C ships — the strict variant looks like an unmerged alternate. Audit before deploying.

## 11. Detection edge cases

- **Mixed-language messages** ("Lol that was 火 🔥"): API returns dominant language. Eligibility = true; translation is best-effort.
- **Single emoji** ("🔥"): API returns 'und' (undetermined). Set `translateEligible: false`.
- **URLs + @mentions**: API leaves them intact. No special handling.
- **Confidence threshold**: if detection confidence < 0.5, mark `translateEligible: false`.
- **Profanity**: API does not censor. Moderation is a separate concern, flagged as a follow-up before global rollout.

## 12. Historical messages

**Skip historical** — old messages without `sourceLanguage` stay ineligible. Cheaper, simpler. No backfill script.

## 13. Out of scope

- Moderation / profanity filter (separate workstream; recommended before global rollout but not blocking C).
- Translation of usernames or DJ stage names (glossary-locked; never translate).
- Translation of pre-C messages (historical skip).
- Per-language emoji handling.
- Bot accounts / shoutouts / GiveawayModal copy (those are Workstream B build-time strings).
- Voice / audio translation.

## 14. Success criteria

1. French message posted from device A shows up translated on Spanish-UI device B and Japanese-UI device C, each with the "translated from French" affordance.
2. Same French message on a French-UI device shows no translation affordance.
3. Cache hit rate ≥ 90% after first hour of a 10-viewer mixed-locale chatroom session.
4. Rate limit triggers correctly at 200/UID/day; user sees clear toast; cache hits don't count toward the limit.
5. App Check enforced: script-based call with valid public config but no App Check token returns `unauthenticated`.
6. Single emoji "🔥" consumes zero translation API budget across 100 viewers.
7. Daily cost report stays under $5 for first 30 days.
8. End-to-end latency: cache-warm chat in non-English UI fully translates < 800ms; cache-cold < 2s.
9. Firestore rules pass `firebase firestore:rules:test` for both `Messages` and `Messages/{id}/translations/{lang}`.
10. Reconcile `firestore.rules` vs `firestore.rules.strict` before deploying — single canonical file in `main`.

## 15. Risks

| Risk | Mitigation |
|---|---|
| Cloud Functions bootstrap in a CF-naïve project is multi-day | Treat as sub-task; document IAM, billing, App Check; pair with Buzz on first deploy |
| Translation API daily budget overrun | Hard cap at function level; soft cap with UID rate limit; daily cost-monitor email |
| App Check breaks anonymous users at launch | Test in soft-mode first 24h |
| Detection wrong on slang ("ayyy lmao") | Confidence threshold; don't translate when conf < 0.5 |
| Subcollection security rules misconfigured | Rule test suite (Firebase emulator) before deploy |
| Cost projection wrong (chat much busier than assumed) | Hard cap protects revenue; tunable; raise based on real traffic |

## 16. Build sequence

1. **CF bootstrap** — enable Cloud Functions API on `livestreamchat-2d575`, scaffold `functions/`, Node 22, deploy hello-world to validate.
2. **Firestore rules reconcile** — pick canonical between `firestore.rules` and `firestore.rules.strict`; deploy.
3. **App Check** — register iOS + Android with DeviceCheck + Play Integrity; deploy in monitor mode.
4. **Deploy `onChatMessageCreate`** — smoke test by posting messages in 5 source languages.
5. **Deploy `getOrCreateTranslation`** — smoke test from a test client; verify rate limits.
6. **ChatBubble UI** — globe affordance, eligibility-driven render, flip-to-original interaction.
7. **Settings toggle** in ListenerProfile.
8. **Enforce App Check** after 24h soak in monitor mode.
9. **Deploy `cleanupOldTranslations`** scheduled job.
10. **48h staging soak** with monitoring dashboard.
11. **Production cutover** behind a feature flag in `constants.js` for safe rollback.

## 17. Dependencies

- **Blocks on B:** locale list, `i18n.language`, glossary.
- **Triggers E prerequisites:** App Check setup, Firestore rules deploy automation.
- **Does NOT block D** — Wix merch and chat translation are independent.

## 18. Next step

After approval, invoke `superpowers:writing-plans`.
