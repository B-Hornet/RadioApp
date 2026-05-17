# Workstream A — Design-System Unification

**Date:** 2026-05-15
**Status:** Approved, ready for implementation plan
**Author:** Buzz (Keith Busby) + Claude
**Predecessor audit:** systemic audit run 2026-05-15 against `/Volumes/Ex_Drive/RadioApp/`

## 1. Problem

Two brand identities live in the same app:

- **Legacy** (`src/theme.js`): red `#CC0000` + gold/brown chat. Imported by `WelcomeScreen.js`, `SongRequests.js`, `MerchShop.js`, `LiveReactions.js` (4 files).
- **Current** (`src/theme/tokens.js`): amber `#FF6B00` "Midnight Broadcast Booth", layered dark studio backgrounds with glass panels. Imported by 18 files.

A user tapping "Listen Now" on the Welcome screen experiences a brand identity break in the first second of the app — red CTA on Welcome, amber-orange app one navigation later. This kills first-run perception, blocks i18n (no point translating into a screen that's about to change skin), and undermines all global-rollout work downstream.

10 hardcoded hex values exist outside `tokens.js`, violating the file's own anti-pattern statement. The shim `src/theme/index.js` papers over the split rather than resolving it.

## 2. Decision

**Brand-lock: Midnight Broadcast Booth (amber `#FF6B00`).**

Rationale: bigger investment (18 files vs 4), more recent direction, "premium late-night broadcast studio" is stronger positioning than red-and-black radio cliché. Legacy theme is deleted, not preserved.

## 3. Scope

### In scope

| # | Action | Files |
|---|---|---|
| A2.1 | Migrate `WelcomeScreen.js` from `'../theme'` → `'../theme/tokens'`; replace all hardcoded reds (`#CC0000`, `#E62020`, raw `#FFFFFF`, `rgba(204,0,0,*)`) with token values; switch CTA to amber primary | `src/screens/WelcomeScreen.js` |
| A2.2 | Migrate `SongRequests.js` to tokens | `src/screens/SongRequests.js` |
| A2.3 | Migrate `MerchShop.js` to tokens (note: the screen content stays "Coming Soon" — that's Workstream D's job) | `src/screens/MerchShop.js` |
| A2.4 | Migrate `LiveReactions.js` to tokens | `src/components/LiveReactions.js` |
| A2.5 | Delete legacy theme file | `src/theme.js` |
| A2.6 | Rewrite `src/theme/index.js` as a clean barrel re-exporting `./tokens`. The legacy aliases (`colors.background`, `colors.surface`, `fonts.sizes.*`, `borderRadius.*`) become real exports of the unified system, not bandaids. | `src/theme/index.js` |
| A2.7 | Replace `'rgba(8, 8, 12, 0.95)'` in NavDock with a new token `colors.bgDeepAlpha95` defined in `tokens.js` | `src/theme/tokens.js`, `src/components/NavDock.js` |
| A2.8 | Sweep the remaining 9 hardcoded hex values across the codebase; either token-ize or document why a literal is correct | grep-driven sweep |
| A2.9 | Remove `react-native-paper` from `package.json` if not imported anywhere (verified via `grep -rn "react-native-paper" src/`) | `package.json`, lockfile |
| A2.10 | Pick ONE of `@react-navigation/stack` / `@react-navigation/native-stack`. Recommendation: `native-stack` (faster, native-driven). Remove the unused package. Update `AppNavigator.js`. | `package.json`, `src/AppNavigator.js` |

### Font assets (A3)

Tokens reference `Oswald-Bold`, `Oswald-Medium`, `Oswald-SemiBold`, `DMSans-Regular`, `DMSans-SemiBold`, `DMSans-Bold`, `JetBrainsMono-Regular`, `JetBrainsMono-Medium`. Verify each:

1. `.ttf`/`.otf` file present in `assets/fonts/`.
2. `react-native.config.js` declares the assets path.
3. iOS `Info.plist > UIAppFonts` lists every font filename.
4. Android `app/src/main/assets/fonts/` mirrors the assets folder.
5. Run `npx react-native-asset` (or `pod install` after manual link) and verify in a fresh build that text renders in the intended family — visual screenshot, not just code review.

If any font is missing, that font is a **blocker for A** — log it and stop.

### Accessibility (A4) — folded into this pass

- Replace NavDock Unicode glyphs (`⬡ ◉ ◫ ☰ ◎ ⚙`) with `lucide-react-native` icon components. Decision on icon library deferred to plan-writing step but lucide is the recommendation (tree-shaken SVG, no native linking).
- Add to each NavDock item: `accessibilityLabel={item.label}`, `accessibilityRole="tab"`, `accessibilityState={{ selected: isActive }}`.
- Bump NavDock label from `fontSize: 9` → 11. Remove `allowFontScaling={false}` if set anywhere; honor Dynamic Type by default.
- Add `accessibilityLabel` on: Welcome CTAs ("Listen Now", "Visit website"), MiniPlayer play/pause, LiveBadge ("On air" / "Off air"), the chat sign-in CTA, send button.
- Wrap visualizer / ambient glow / spinning logo in a `useReducedMotion()` guard from `react-native-reanimated`. When reduced motion is on, render the static frame.

### Performance (A5) — folded into this pass

- Restore `gestureEnabled: true` in `AppNavigator.js` Stack screenOptions (currently `false`). Override per-screen to `false` only on Welcome.
- HubScreen: wrap the ambient glow + spinning logo + visualizer in a single isolation boundary (`<View collapsable={false}>`) so reactive updates from `useStream()` don't force the entire screen to repaint.
- Defer TrackPlayer init from App.js mount until after first paint: wrap `setupPlayer()` in `InteractionManager.runAfterInteractions()`. The Welcome screen does not need playback ready.

### Out of scope

- TypeScript migration — separate workstream.
- Crashlytics / Analytics / App Check — Workstream E.
- New screens, new copy, new flows.
- Merch screen content beyond the theme migration — Workstream D.
- Any string change (i18n is Workstream B; we don't touch copy during A).

## 4. Success criteria

1. `grep -rEn '#[0-9A-Fa-f]{6}' src/ --include="*.js" | grep -v 'theme/tokens.js'` returns **zero lines**.
2. `grep -rln "from '../theme'" src/screens src/components` returns **zero lines** (everyone imports from `'../theme/tokens'` or from the new `'../theme'` barrel that re-exports tokens).
3. `src/theme.js` does not exist.
4. Welcome → Hub transition reviewed by **screenshot** (per `feedback_visual_artifact_self_screenshot.md`): both screens render the same amber + dark + glass identity. No red CTA, no gold/brown chat.
5. `npx react-native-asset` or equivalent succeeds; Oswald headline on Hub reads in Oswald (not system default), verified by screenshot.
6. VoiceOver on iOS reads each NavDock item by `accessibilityLabel`, not by Unicode glyph name.
7. `npx eslint src/` clean, Metro bundler clean.
8. Reduced-motion smoke test: enable iOS "Reduce Motion" in Settings → Accessibility, relaunch, confirm visualizer + ambient glow + spinning logo render in their static state.
9. Bundle-size delta from removing `react-native-paper` and the unused navigation package: report the number in the commit message.

## 5. Risks

| Risk | Mitigation |
|---|---|
| Font assets missing → app silently falls back to System | Verify in A3 before any visual sign-off; if missing, A is blocked, not "shipped" |
| Reverting `gestureEnabled: true` introduces accidental back-swipes in flows that depended on it | Audit each screen for "in the middle of a destructive action" cases; override per-screen only where needed |
| Removing `react-native-paper` breaks a hidden import | Grep first (`grep -rn "react-native-paper" src/`); only remove if zero matches |
| Token sweep introduces a regression somewhere subtle (e.g., status pill color drift) | Self-screenshot every changed screen before commit per the canonical visual-bug protocol |

## 6. Build sequence

1. **Foundation** — A2.6 (rewrite barrel), A2.5 (delete legacy), A2.7 (add `bgDeepAlpha95` token). Get the import graph clean first.
2. **Screen migrations** — A2.1 (WelcomeScreen, highest-impact), A2.2, A2.3, A2.4, in any order.
3. **Sweep** — A2.8 (remaining hex), A2.9 (paper), A2.10 (nav).
4. **Fonts** — A3 verification. Block if missing.
5. **A11y + perf** — A4, A5.
6. **Visual QA** — self-screenshot every changed surface; compare against tokens-as-intended.
7. **Commit** — one clean commit per logical group (foundation, migrations, sweep, fonts, a11y/perf) for easy rollback.

## 7. Next step

After this spec is reviewed and approved by Buzz, invoke `superpowers:writing-plans` to convert this spec into a step-by-step implementation plan.

## 8. Dependencies / blockers for downstream workstreams

- **Workstream B (i18n)** waits on A2.1–A2.4 because we will not extract strings from screens that are mid-theme-migration.
- **Workstream C (chat translation)** waits on B.
- **Workstream D (Wix merch)** can start in parallel after A2.3 lands (MerchShop on tokens). The Wix integration replaces the "Coming Soon" content; A only fixes the chrome.
- **Workstream E (global rollout)** waits on B + C + D — must capture analytics events for the final feature set.
