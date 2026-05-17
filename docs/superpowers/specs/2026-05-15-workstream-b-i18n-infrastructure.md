# Workstream B — i18n Infrastructure (15 locales)

**Date:** 2026-05-15
**Status:** Approved, ready for implementation plan
**Author:** Buzz (Keith Busby) + Claude
**Predecessor:** Workstream A (design-system unification) — must complete A2.1–A2.4 first
**Successor unblocks:** Workstream C (chat translation), Workstream E (store listings)

## 1. Goal

App renders in 15 locales (FAMUS-matched) with device-language detection on first launch, in-app override, RTL layout for Arabic, and CLDR-correct pluralization. Zero hardcoded user-facing strings remain in source.

**Locale set:** en, es, fr, pt, de, it, nl, ja, ko, zh, ar, hi, tr, sw, ru

## 2. Library stack

| Package | Purpose |
|---|---|
| `i18next` | i18n engine (CLDR plurals, fallback chains, namespaces) |
| `react-i18next` | React bindings — `useTranslation`, `<Trans>` |
| `react-native-localize` | Read OS locale list for first-launch detection |
| `react-native-restart` | Force reload when Arabic toggle changes RTL state |

Alternatives considered: `i18n-js` (rejected — no plurals/namespaces), `@formatjs/intl-locale` (already in Hermes — no install needed).

## 3. File layout

```
src/i18n/
├── index.js              # init, detector, fallback chain
├── languages.js          # canonical locale list + native names + RTL flags
├── glossary.js           # do-not-translate term map
└── locales/
    ├── en.json           # source language
    ├── es.json
    ├── fr.json
    ├── pt.json
    ├── de.json
    ├── it.json
    ├── nl.json
    ├── ja.json
    ├── ko.json
    ├── zh.json
    ├── ar.json
    ├── hi.json
    ├── tr.json
    ├── sw.json
    └── ru.json
```

Single-file-per-locale (not namespaced). At ~150 keys, bundle cost ~50 KB total minified — lazy loading isn't worth the complexity.

## 4. `languages.js` contract

```js
export const SUPPORTED_LOCALES = [
  { code: 'en', name: 'English',    nativeName: 'English',   rtl: false, flag: '🇺🇸' },
  { code: 'es', name: 'Spanish',    nativeName: 'Español',   rtl: false, flag: '🇪🇸' },
  { code: 'fr', name: 'French',     nativeName: 'Français',  rtl: false, flag: '🇫🇷' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', rtl: false, flag: '🇵🇹' },
  { code: 'de', name: 'German',     nativeName: 'Deutsch',   rtl: false, flag: '🇩🇪' },
  { code: 'it', name: 'Italian',    nativeName: 'Italiano',  rtl: false, flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch',      nativeName: 'Nederlands',rtl: false, flag: '🇳🇱' },
  { code: 'ja', name: 'Japanese',   nativeName: '日本語',     rtl: false, flag: '🇯🇵' },
  { code: 'ko', name: 'Korean',     nativeName: '한국어',     rtl: false, flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese',    nativeName: '中文',       rtl: false, flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic',     nativeName: 'العربية',   rtl: true,  flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi',      nativeName: 'हिन्दी',    rtl: false, flag: '🇮🇳' },
  { code: 'tr', name: 'Turkish',    nativeName: 'Türkçe',    rtl: false, flag: '🇹🇷' },
  { code: 'sw', name: 'Swahili',    nativeName: 'Kiswahili', rtl: false, flag: '🇰🇪' },
  { code: 'ru', name: 'Russian',    nativeName: 'Русский',   rtl: false, flag: '🇷🇺' },
];
```

## 5. String inventory

| Surface | Strings | Notes |
|---|---|---|
| WelcomeScreen | 3 | "Listen Now", "Go to the Website", "WHAT RADIO SHOULD SOUND LIKE" — **last one is a glossary-locked tagline, English only** |
| HubScreen | 10 | ON AIR / OFF AIR, 4 quick-tile labels + 4 subs |
| ChatRoom | 12 | "TALKBACK" (translated), "Live Chat", "LIVE", listener count format with plurals, empty state, sign-in CTA, placeholder, send error toast |
| SongRequests | ~35 | Largest screen |
| DJSchedule | ~15 | 7 day names from `constants.DAYS`, time-of-day strings |
| ListenerProfile | ~20 | 9 badge names + 9 descriptions, stats labels |
| MerchShop | 0 | Will be replaced by Workstream D — do not translate placeholder |
| RadioPlayer | ~8 | |
| MiniPlayer | 2 | "Live" pill, paused state |
| Modals + Banners | ~12 | OwnerLoginModal, ListenerAuthModal, ShoutoutBanner, GiveawayModal, DeleteAccountModal |
| constants.js | 22 | 9 badges × 2 (name+desc) + 4 reaction labels |
| **ControlRoom** | ~20 | **English-only at launch** (owner-only surface; ~5% translation-cost savings) |
| **Total to translate** | **~139 strings** | × 14 non-English locales = ~1,950 translations |

Plus glossary-locked terms (NOT translated): Reeboot, Reeboot Radio, REEBOOT RADIO, WHAT RADIO SHOULD SOUND LIKE, DJ Shadow, DJ Reeboot, DJ Pulse, MC Vortex, Luna Wave, Live365, badge IDs.

**TALKBACK** is translated (per Buzz approval 2026-05-15) — chat clarity for non-English speakers wins over broadcast-vocabulary purity.

## 6. Translation method

1. Hand-write `en.json` from source extraction (~139 keys).
2. Generate 14 target locales via Google Cloud Translation API with glossary lock.
3. Buzz spot-reviews locales he can verify (typically es, fr if available; otherwise rely on user feedback).
4. Coverage gate: ≥97% non-identical-to-source per locale (loanwords are the documented exception for ja/ko/de).
5. Cost: ~360k characters × $20 / 1M chars = ~$7 one-time.

## 7. Language detection chain

```js
// src/i18n/index.js
const detectInitialLanguage = async () => {
  // 1. User preference (persisted)
  const saved = await AsyncStorage.getItem('@reeboot/locale');
  if (saved && SUPPORTED_LOCALES.find(l => l.code === saved)) return saved;

  // 2. OS locale (first match in supported set)
  const deviceLocales = RNLocalize.getLocales(); // ordered preference list
  for (const dl of deviceLocales) {
    const match = SUPPORTED_LOCALES.find(l => l.code === dl.languageCode);
    if (match) return match.code;
  }

  // 3. Fallback
  return 'en';
};
```

First-launch behavior:
- Silently apply detected language.
- If detected ≠ `en`, do not surface a banner (the app is in their language — the banner would be noise).
- Settings screen always has the picker for explicit changes.

## 8. RTL support

Arabic toggle path:
1. User selects Arabic in picker.
2. Persist locale to AsyncStorage.
3. Call `I18nManager.forceRTL(true)`.
4. Show modal: "Restart required for Arabic layout" with single CTA.
5. CTA calls `RNRestart.Restart()`.
6. On relaunch, app boots in RTL.

Reverse path (Arabic → any LTR locale): same restart prompt.

Component RTL audit (implementation step):

| Pattern | Replace with |
|---|---|
| `marginLeft`, `marginRight` | `marginStart`, `marginEnd` |
| `paddingLeft`, `paddingRight` | `paddingStart`, `paddingEnd` |
| `textAlign: 'left'` (body text) | `textAlign: 'auto'` |
| `textAlign: 'left'` (intentional, e.g., timestamps) | Leave + comment why |
| Send-icon `↑` in ChatRoom | OK — vertical, RTL-neutral |
| Back-arrow icons (when we add them in A4) | Use `chevron-left` icon + `style={{ transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }] }}` |
| Chat bubble corner radius (`borderTopLeftRadius: sm` for "other" bubbles) | Mirror under RTL — write a helper `bubbleCorners(isOwn, isRTL)` |
| NavDock item order | RN handles via `flexDirection: 'row'` flip automatically when `I18nManager.isRTL` |

Inverted FlatList in ChatRoom: RTL does not flip the inversion — newest still at visible bottom.

## 9. Pluralization

i18next applies CLDR rules per locale. Example:

```json
// en.json
{
  "chat.listenerCount_one": "{{count}} listener",
  "chat.listenerCount_other": "{{count}} listeners"
}

// ru.json — Russian has 4 plural forms
{
  "chat.listenerCount_one": "{{count}} слушатель",
  "chat.listenerCount_few": "{{count}} слушателя",
  "chat.listenerCount_many": "{{count}} слушателей",
  "chat.listenerCount_other": "{{count}} слушателя"
}

// ar.json — Arabic has 6 plural forms
{
  "chat.listenerCount_zero":  "لا يوجد مستمعون",
  "chat.listenerCount_one":   "مستمع واحد",
  "chat.listenerCount_two":   "مستمعان",
  "chat.listenerCount_few":   "{{count}} مستمعين",
  "chat.listenerCount_many":  "{{count}} مستمعًا",
  "chat.listenerCount_other": "{{count}} مستمع"
}
```

Usage: `t('chat.listenerCount', { count })`.

## 10. Date / time formatting

Replace `ChatRoom.formatTime` with locale-aware:

```js
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString(i18n.language, {
    hour: '2-digit',
    minute: '2-digit',
  });
};
```

Same treatment for DJSchedule times. Hermes ships full Intl — no polyfill needed.

## 11. Language picker UX

- **Where:** ListenerProfile → new "Settings" section → "Language" row.
- **Visual:** flag emoji + native language name (e.g., 🇯🇵 日本語). Native name first — users find their language by sight, not by reading English.
- **Storage:** `@reeboot/locale` AsyncStorage key.
- **Effect:** immediate re-render for LTR↔LTR; restart prompt for any toggle to or from Arabic.
- **Placement note:** v1 lives inside Profile. v2 may promote to a dedicated Settings screen — not blocking.

## 12. Out of scope for B

- Chat message translation (Workstream C — runtime translation of UGC).
- Cloud Functions response localization (deferred; responses are mostly status codes).
- Push notification localization (not wired yet; defer).
- App Store / Play Store listing translation (Workstream E).
- ControlRoom screen (English-only at launch).
- Translation of screenshots used in store listings (Workstream E).
- Per-region currency / pricing (Workstream D and Workstream E).

## 13. Success criteria

1. App launches in detected device language without user action.
2. Settings picker switches language; choice persists across cold launches.
3. Every screen renders correctly in stress-test set **en / de / ja / ar** (baseline, longest strings, narrow CJK glyphs, RTL).
4. Coverage gate: ≥97% non-identical-to-source per non-English locale (loanwords documented).
5. No layout overflow in German verified by screenshot per screen.
6. RTL: Arabic flips the layout; chat bubbles, NavDock order, NavDock active indicator, modal headers all flip correctly.
7. CLDR plurals work in Russian + Arabic (test cases: 0, 1, 2, 5, 21, 100 listeners).
8. `npx eslint src/i18n/` clean; all 15 JSON locales parse via `JSON.parse` in a unit test.
9. Snapshot tests pass for `HubScreen + ChatRoom + WelcomeScreen` × `en + de + ar` (9 snapshots).
10. Translation cost report attached to commit (Google Cloud Translation API actual spend).

## 14. Risks

| Risk | Mitigation |
|---|---|
| Machine translation produces awkward strings in target language | Glossary lock; Buzz spot-review where possible; user feedback loop post-launch |
| German strings overflow tight UI (NavDock labels, badges, pills) | Stress-test in implementation; use `numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}` on tight surfaces |
| RTL flip breaks an asymmetric component | RTL stress test before merging; visual screenshot of every screen in Arabic |
| `react-native-localize` requires `pod install` + native rebuild | Document the rebuild step in the implementation plan; CI parity |
| Translation API cost surprise | Run a dry-run character count first; expected ~$7 |
| User changes Arabic ↔ LTR mid-session and gets confused by restart | Modal copy makes the restart unambiguous; tested in all 15 locales |

## 15. Build sequence

1. **Library install + native rebuild** (`i18next`, `react-i18next`, `react-native-localize`, `react-native-restart`; `pod install`; verify iOS + Android boot).
2. **Skeleton infrastructure** — `src/i18n/index.js`, `languages.js`, `glossary.js`, empty `locales/en.json`.
3. **Hook up `I18nextProvider`** at app root (above `StreamProvider`).
4. **Extract `en.json`** screen by screen (WelcomeScreen → HubScreen → ChatRoom → others). Commit per screen.
5. **Generate 14 target locales** via Google Cloud Translation API; write `scripts/translate.js` for repeatability.
6. **Spot review + glossary verification.**
7. **RTL audit pass** — replace `Left/Right` with `Start/End`, fix corner cases.
8. **Language picker UI** in ListenerProfile.
9. **Snapshot tests + coverage report.**
10. **Visual QA in en / de / ja / ar via simulator screenshot.**

## 16. Next step

After this spec is reviewed and approved by Buzz, invoke `superpowers:writing-plans` to convert it into a step-by-step implementation plan.

## 17. Dependencies

- **Blocks on A:** Wait until A2.1–A2.4 (screen theme migrations) land — no extracting strings from screens that are mid-redesign.
- **Unblocks C:** Chat translation reuses this locale list, glossary, and detection chain.
- **Unblocks E:** Store listings localize against this same locale set; ASO keywords per locale.
