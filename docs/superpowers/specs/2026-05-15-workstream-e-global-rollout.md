# Workstream E — Global Rollout Readiness

**Date:** 2026-05-15
**Status:** Approved, ready for implementation plan
**Predecessor:** Workstreams A, B, C, D
**Music licensing (confirmed 2026-05-15):** Live365 covers global rebroadcast across all 15 launch markets.

## 1. Goal

App is launchable on iOS App Store + Google Play in all 15 locale markets with crash reporting, analytics, abuse defense, accessibility, localized store assets, and legal compliance in place.

E is the convergence layer — no new product features; final assembly + submission.

## 2. Observability stack

| Component | Choice | Notes |
|---|---|---|
| Crash reporting | `@react-native-firebase/crashlytics` | Free, deep iOS/Android signal |
| Analytics | `@react-native-firebase/analytics` | BigQuery export available |
| Performance monitoring | `@react-native-firebase/perf` | Cold-start, network round-trips |
| Remote Config | `@react-native-firebase/remote-config` | Kill switches for chat translation, Wix sync, merch |

`@react-native-firebase/*` packages are native modules (different from the JS SDK currently used). Adding requires `pod install` + native Android rebuild. The JS SDK Firebase usage (auth, Firestore) coexists fine.

Trade-off accepted (Buzz 2026-05-15): Full native stack over Sentry-only, in exchange for Analytics + Remote Config kill switches.

## 3. App Check

Shared with Workstreams C and D — owned here for sequencing.

- **iOS:** DeviceCheck provider (default; App Attest for iOS 14+).
- **Android:** Play Integrity provider.
- **Rollout:** monitor mode for 48h, then enforce.
- **Coexists with anonymous Firebase auth** — verified in implementation.

Enforcing App Check is a prerequisite for ChatTranslation rate-limit defense (C) and merch click-through logging (D).

## 4. Privacy & tracking

| Surface | Action |
|---|---|
| iOS ATT | App does not perform cross-app tracking. Declare in privacy manifest; skip ATT prompt. |
| iOS Privacy Manifest (`PrivacyInfo.xcprivacy`) | Required Dec 2024+; merge SDK manifests + app declarations |
| App Privacy Labels | Identifiers (UID), Diagnostics (crashes), Usage (analytics), User Content (chat messages) |
| Play Data Safety form | Same disclosures, different UI |
| GDPR | Essential analytics under legitimate interest, no consent needed for v1 |
| Terms / Privacy pages | Already pinned in `LEGAL_URLS` to `reebootradio.com/privacy-policy` and `/terms-of-service`. **Verify content live and accurate before submission.** |
| Account deletion (Apple 5.1.1.v) | `DeleteAccountModal.js` exists. **Verify end-to-end:** Firestore row removed, Firebase Auth user removed. |

## 5. Store listings — 15 locales

| Asset | Spec |
|---|---|
| Listing copy | Localized for 15 locales (Workstream B locale set) |
| ASO keywords | Per-locale research; ~30 min × 15 = 8h |
| Screenshots | 6 standardized screens × 15 locales = 90 screenshots; automated via Fastlane snapshot or Maestro |
| Promotional text | 170-char iOS free-update copy; localized |
| What's New / Release Notes | Per locale per release |
| Category | iOS Music primary / Entertainment secondary; Android Music |
| Age rating | iOS 12+ (UGC); Android Teen with UGC flag |
| Pricing | Free; no IAP at launch |
| Reviewer notes | Pre-empt: anonymous auth, owner long-press affordance, physical merch via WebView, chat moderation policy |

## 6. Accessibility final pass

Verification + polish on Workstream A's foundation:

- VoiceOver tour of Welcome → Hub → Chat → Profile completable without sighted assistance.
- TalkBack equivalent on Android.
- Dynamic Type up to AX5 (no clipping).
- WCAG 2.2 AA contrast verified on every text/background pair.
- Touch targets ≥ 44×44pt on all interactive elements.
- Reduced motion: every animation honors `useReducedMotion()` from A.
- Screen-reader labels on all interactive elements.
- Color is not the only state indicator (LIVE shows pulse + text "LIVE"; OFFLINE shows "OFF AIR" text).

## 7. RTL final stress test

After B implements RTL, E verifies on real Arabic-locale device + iOS simulator:

- Layout flips correctly.
- Chat bubble corners mirror.
- NavDock active indicator flips.
- Directional icons (back arrows, send) mirrored.
- Modal dismiss icons remain in natural top-trailing corner.
- Number formatting appropriate.

## 8. Performance & startup

| Metric | Target | Current estimate |
|---|---|---|
| Cold start to first paint | < 2.0s on iPhone SE 2nd gen | ~2.5–3s |
| TTI (time to interactive) | < 3.0s | Unknown |
| Bundle size | < 30 MB iOS / < 25 MB Android | Unknown |
| Memory at idle on Hub | < 150 MB | Unknown |

Workstream A defers TrackPlayer init. E adds:
- Lazy-load `react-native-webview` (D dep) until merch tab opens.
- Image asset audit — appropriate density buckets (`@1x @2x @3x`).
- Verify production builds use Hermes (gradle.properties + Podfile).
- Bundle size report attached to release commit.

## 9. Release pipeline

| Element | Setup |
|---|---|
| iOS Fastlane | New Fastfile; reuse FAMUS lane patterns (`appstore_submit`, `play_upload_existing`) where applicable |
| TestFlight internal track | Smoke test before production |
| Play Internal Testing track | Same purpose |
| Build numbers | Fresh `1.0.0+1` / `1.0.0 (1)`. Increment from here. |
| Signing | Verify iOS provisioning + Android keystore status at `/Volumes/Ex_Drive/RadioApp/` |
| App Store Connect API key | Generate for this app's automation |
| Play Console service account | Generate with Release Manager role |
| CI | Manual `fastlane` for v1; optional GitHub Actions later |

## 10. Customer support

- Support email: `reebootradio@gmail.com` (already in `LEGAL_URLS`).
- In-app "Help" link in ListenerProfile.
- Crash-feedback hook: after N Crashlytics events for the same user, surface an in-app "tell us what happened" prompt.

## 11. Chat moderation stub (added to E from a C-scope deferral)

App Store and Play Store both want UGC moderation tooling visible to reviewers. C doesn't include moderation; E adds the minimum viable stub:

- `reportMessage` Cloud Function (onCall, auth + App Check). Writes to `moderationReports/{id}` with messageId, reporter UID, reason. Notifies Buzz via email.
- "Report" affordance on chat bubbles (long-press menu).
- Admin script `functions/scripts/moderate.js` for owner to delete reported messages.
- In-app Code of Conduct screen accessible from Settings.

Why E and not C: C's scope was translation. Moderation is rollout readiness — if reviewer can't see a report button on a UGC surface, they reject.

## 12. Music licensing

**Confirmed (Buzz, 2026-05-15):** Live365 rebroadcast license covers all 15 launch markets. No per-market PRO blockers.

## 13. Pre-submission checklist (E ship gate)

1. ☐ All Workstream A success criteria pass.
2. ☐ All Workstream B success criteria pass.
3. ☐ All Workstream C success criteria pass.
4. ☐ All Workstream D success criteria pass.
5. ☐ Crashlytics receiving events from staging build.
6. ☐ Analytics events firing in DebugView.
7. ☐ App Check enforcing in production mode.
8. ☐ Privacy policy + ToS URLs return 200 with correct content.
9. ☐ Account deletion flow tested end-to-end (Firestore + Auth row removed).
10. ☐ 90 screenshots present (6 × 15 locales) and uploaded.
11. ☐ Listing copy localized for 15 locales.
12. ☐ Privacy manifest matched to actual SDK behavior.
13. ☐ TestFlight build approved by internal testers covering en + de + ja + ar.
14. ☐ Play Internal Testing build approved by same.
15. ☐ No console errors / warnings in production build.
16. ☐ Bundle size reported and under target.
17. ☐ Cold start time profiled and under target.
18. ☐ Reviewer notes drafted (anonymous auth, owner long-press, WebView merch, chat report).
19. ☐ Chat report affordance visible and functional.
20. ☐ Code of Conduct screen reachable.

## 14. Success criteria

1. Apple approves on first submission.
2. Google Play approves on first submission.
3. Both store listings live in 15 locales.
4. Crash-free user rate ≥ 99.5% in first 7 days.
5. Cold start meets target on iPhone SE 2nd gen.
6. Zero critical crashes in TestFlight internal track.
7. Privacy manifest accurate; zero privacy-related rejections.
8. Reviewer notes pre-empt every owner-only path, WebView question, and UGC question.

## 15. Risks

| Risk | Mitigation |
|---|---|
| `@react-native-firebase` native modules conflict with JS SDK | Test in clean install; both Firebase auths use the same project, no conflict in practice |
| App Check breaks anonymous auth at launch | Monitor mode 48h before enforcement |
| Apple ATT rejection if privacy manifest is wrong | Generate manifest from SDK truth + verify with `xcrun privacy-manifest-tool` |
| Screenshot automation flaky | Fall back to manual screenshots for v1; automate post-launch |
| Translation review missed a market-specific term | Soft launch in 5 locales first if budget allows; otherwise accept user-feedback loop |
| Bundle size over target due to native deps | Audit unused packages from A2.9 sweep + native module footprint |

## 16. Out of scope for E (post-launch backlog)

- Apple Watch / CarPlay / Android Auto / Wear OS.
- Web app version.
- Sponsorship / ad SDK (would trigger ATT prompt + GDPR consent).
- Push notifications (FCM + APNs — planned separately).
- Universal Links / App Links / deep linking.
- Smart playlists / on-demand content.
- A/B test framework (Remote Config exists; experiment platform is separate).

## 17. Build sequence

1. **App Check setup** (shared with C, D — install + register + monitor mode).
2. **Crashlytics + Analytics install** (`@react-native-firebase/*` native modules; `pod install`; verify dashboards).
3. **Performance Monitoring + Remote Config** install; define kill-switch keys.
4. **Privacy manifest** assembly.
5. **Reviewer-facing moderation stub** — `reportMessage` CF + UI affordance + Code of Conduct screen.
6. **Accessibility final pass** (VoiceOver / TalkBack tour; fix issues).
7. **RTL final pass** (Arabic stress test).
8. **Performance profile** (startup time, bundle size, memory; close gaps).
9. **Fastlane wiring** (iOS + Android lanes for upload, metadata, screenshots).
10. **Screenshot automation** (6 × 15 = 90 screenshots).
11. **Store listings** uploaded (15-locale copy, keywords, screenshots, promotional text).
12. **TestFlight Internal + Play Internal Testing** tracks populated.
13. **Internal QA sign-off** (Buzz + 2 testers covering en/de/ja/ar).
14. **Reviewer notes draft.**
15. **Production submission to both stores.**

## 18. Dependencies

- **Blocks on A, B, C, D** all shipping their success criteria.
- **No new dependencies** introduced.

## 19. Next step

After approval, invoke `superpowers:writing-plans` for E. Recommend writing all five plans (A–E) before starting implementation, so build order across workstreams stays coherent.
