# Reeboot Radio - Google Play First Launch Checklist (2026-06-04)

Context: com.reebootradioapp has NO public Play listing (404). This is a
first production launch, not a relaunch. The build toolchain already meets
current Play requirements (target API 35, AGP 8.5.1, NDK r28, 16KB pages).

## PART 1 - Buzz manual, one time (Claude is blocked until these are done)

1. SERVICE ACCOUNT GRANT (unblocks all automation)
   - Open Play Console for the account that owns Reeboot Radio
     (the Reebootradio account, NOT the FAMUS account).
   - Users and permissions -> Invite new users
   - Email: play-store-deploy@flyeapp.iam.gserviceaccount.com
   - App-level access to Reeboot Radio (com.reebootradioapp) with:
     - View app information
     - Manage store presence (listing edits)
     - Release to testing tracks
     - Release apps to production
   - Verified blocked as of 2026-06-04: API returns 404 Package not found
     while the same credentials read FAMUS fine.

2. FORMS WITH NO API (console only - Claude cannot automate these)
   - App content -> Privacy policy URL: https://www.reebootradio.com/privacy-policy
   - App content -> Data Safety form. The app uses Firebase
     (livestreamchat-2d575): declare account info (email), user content
     (chat messages), and any analytics/crash data actually collected.
     Claude will prepare the exact answers once the SA grant lands and we
     can see the console state; the iOS privacy declarations from commit
     005c4dd2 are the source of truth.
   - App content -> Content rating questionnaire (music/UGC chat answers).
   - App content -> App access: provide a test login if chat requires
     sign-in; otherwise mark all functionality available without credentials.
   - App content -> Ads declaration (app has no ads -> No).
   - Store settings -> Category: Music & Audio.
   - Target audience: 13+ (UGC chat; do not select child categories).

3. SIGNING
   - Keystore exists at android/app/reeboot-radio-release.jks (memory note
     from 2026-05-17). Confirm the keystore password is available in
     android/keystore.properties or wherever signing config reads it,
     so the AAB build can be signed for upload.

## PART 2 - Claude automated, after the grant

- Upload signed AAB (versionCode 2, versionName 2.2.0) to internal track.
- Push full store listing from docs/store/aso-metadata-2026-06-04.md:
  title, short description, full description for en-US, de-DE, ja-JP,
  pt-BR, es-419, fr-FR.
- Screenshots: capture from the running app per the caption plan.
- Feature graphic: 1024x500, Midnight Broadcast Booth brand.
- Promote internal -> production once smoke-tested (per release discipline:
  no production rollout within 24h of internal upload).

## Notes

- Play search currently autocorrects "reeboot" to "reboot". Exact-title
  match ("Reeboot Radio - Hip Hop Live") plus install velocity is the
  long-term fix; there is no keyword field on Play - the description
  carries the indexing weight.
- Organization account assumed (Reebootradio LLC). If this is a PERSONAL
  Play account created after Nov 2023, production requires a closed test
  with 12+ testers for 14 days first - flag this to Claude if so.
