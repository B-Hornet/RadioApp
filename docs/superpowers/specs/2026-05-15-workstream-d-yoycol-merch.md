# Workstream D — Yoycol Merch (POD + Stripe PaymentSheet)

**Date:** 2026-05-15 (rev. 1 — pivot from Wix Stores)
**Status:** Approved, ready for implementation plan
**Predecessor:** Workstream A (MerchShop on tokens), Workstream B (locale-aware pricing)
**Affects:** Firebase project `livestreamchat-2d575` (new Stripe + Yoycol Cloud Functions); new Stripe account for Reebootradio LLC
**Note:** Earlier draft of this spec used Wix Stores REST API. Wix doesn't have the e-commerce API available on Buzz's current site plan. This rev pivots to Yoycol (print-on-demand, FAMUS pattern) with in-app Stripe checkout.

## 1. Goal

Replace the "COMING SOON" placeholder with a browsable merch catalog backed by Buzz's Yoycol POD store. Checkout happens in-app via Stripe PaymentSheet. On payment success, a Cloud Function posts the order to Yoycol's fulfillment API; Yoycol prints and ships; tracking is polled back.

**Physical goods only at launch** — no IAP entanglement.

## 2. Stack

| Layer | Choice |
|---|---|
| Catalog source | Yoycol API (existing key in FAMUS `functions/.env` — Buzz to confirm same key works for Reeboot Radio or generate a separate one) |
| Catalog cache | Firestore `merchCatalog/*` in `livestreamchat-2d575` |
| Checkout UX | **Stripe PaymentSheet** via `@stripe/stripe-react-native` (native module — requires `pod install` + rebuild) |
| Payment processor | New Stripe account for Reebootradio LLC |
| Fulfillment | Yoycol POD: Stripe webhook → CF → POST order to Yoycol → Yoycol prints + ships |
| Tracking | Scheduled CF polls Yoycol for tracking updates; writes back to user-facing order doc |

## 3. Architecture

```
Yoycol catalog
     │
     ▼  scheduled (daily 03:00 ET) + admin-on-demand
syncYoycolCatalog (Cloud Function — port from FAMUS pattern)
     │  upserts merchCatalog/{productId}
     ▼
Firestore: merchCatalog/* (client-readable; CF-only writes)
     │
     ▼  onSnapshot
MerchShop (grid) → ProductDetail (variants) → "Buy" button
                                                     │
                                                     ▼
                                            createPaymentIntent CF
                                            (auth + App Check)
                                                     │
                                                     ▼
                                            Stripe PaymentSheet
                                            (Apple Pay / Google Pay / card)
                                                     │
                                              ▼ success
                                          Stripe webhook
                                                     │
                                                     ▼
                                          yoycolFulfillment CF
                                                     │
                                          1. validate signature
                                          2. POST order to Yoycol API
                                          3. write orders/{orderId} with status='placed'
                                          4. email user receipt
                                                     │
                                                     ▼  daily
                                          yoycolTrackingSync CF
                                                     │
                                          update orders/{orderId} status,
                                          shipment carrier, tracking #
```

## 4. Stripe account setup (D0 — blocker)

**New Stripe account required for Reebootradio LLC merch.**

Buzz manual steps (estimated 2–7 days for KYC):
1. Create Stripe account at dashboard.stripe.com → register as Reebootradio LLC.
2. Complete business verification (EIN, bank link, identity verification).
3. Enable Apple Pay + Google Pay in Stripe Dashboard → Settings → Payment methods.
4. Generate **publishable key** (client-side, lives in app env) and **secret key** (server-side, lives in CF secret).
5. Register webhook endpoint for `livestreamchat-2d575` Cloud Functions.

**D0 unblocks the checkout step only.** Catalog work (D2–D5 below) can run in parallel with Stripe verification.

## 5. Firestore schema

```
merchCatalog/{productId}                    # synced from Yoycol
  yoycolProductId: string
  name: string
  description: string                       # markdown-safe
  thumbnail: string
  images: string[]
  basePriceCents: number                    # before variant adjustments
  currency: 'USD'
  variants: [
    {
      id, sku, optionName,                  # "Black / L"
      priceCents,
      available: boolean,
      yoycolVariantSku: string              # opaque Yoycol identifier
    }
  ]
  inStock: boolean
  category: string
  sortOrder: number
  syncedAt: Timestamp

orders/{orderId}                            # one per Stripe PI
  uid: string                               # Firebase Auth user (anonymous or signed-in)
  stripePaymentIntentId: string
  yoycolOrderId: string | null              # set after yoycolFulfillment succeeds
  productId, variantId
  amountCents: number
  currency: 'USD'
  shippingAddress: { ... }                  # captured during checkout
  status: 'pending_payment' | 'placed' | 'in_production' | 'shipped' | 'delivered' | 'cancelled'
  carrier: string | null
  trackingNumber: string | null
  createdAt, updatedAt: Timestamp

merchClickThroughs/{eventId}                # analytics, ~30d retention
  productId, variantId, uid, locale, timestamp
```

## 6. Cloud Functions

| Function | Type | Notes |
|---|---|---|
| `syncYoycolCatalog` | scheduled daily 03:00 ET + onRequest (admin) | Port from FAMUS `syncYoycolCatalog.js` pattern; adapt for `livestreamchat-2d575` project |
| `createPaymentIntent` | onCall (auth + App Check) | Validates product + variant + price against Firestore catalog (never trust client price); creates Stripe PI; returns client_secret |
| `stripeWebhook` | onRequest (Stripe signature verification) | Single endpoint receives payment events; routes to `yoycolFulfillment` for `payment_intent.succeeded` of type=merch |
| `yoycolFulfillment` | helper invoked from `stripeWebhook` | Port from FAMUS pattern; POSTs to Yoycol; writes `orders/{orderId}` |
| `yoycolTrackingSync` | scheduled daily 04:00 ET | Polls Yoycol for orders in `placed` / `in_production` / `shipped` status; updates Firestore |
| `logMerchClickThrough` | onCall (auth + App Check) | Rate-limited 100/UID/hour |

## 7. UX flow

### MerchShop (grid)
- 2-column grid of product cards (image, name, price, sold-out badge).
- Filter chip row: All / Apparel / Accessories.
- Pull-to-refresh re-snapshots Firestore; admin-only trigger refreshes from Yoycol.
- Empty state: "Merch is loading — check back soon."

### ProductDetail
- Hero image carousel.
- Name, price, description (markdown rendering).
- Variant picker (size / color).
- Sold-out variants greyed; CTA disabled until valid selection.
- "Buy Now" CTA → opens Stripe PaymentSheet.

### Checkout (Stripe PaymentSheet)
- Sheet rises from bottom (native iOS / Android).
- Apple Pay / Google Pay primary button at top.
- "Pay with card" option below; collects card + billing address + shipping address.
- On success: PaymentSheet dismisses → app shows "Order placed!" with order number → user can tap "View order" to see status.

### Order tracking screen
- Listing of user's orders from `orders` collection where `uid == currentUser.uid`.
- Per-order: status pill, ETA, tracking number (tappable → carrier site in WebView).
- Empty state: "Your orders will appear here after your first purchase."

## 8. Currency / pricing

Display in store currency (assumed USD from Yoycol). Locale-aware formatting via `Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'USD' })`.

For non-USD viewers: "approx €X" estimate using daily-refreshed FX rate from `exchangerate.host`. Marked "approximate; final charge in USD."

Multi-currency Stripe is a separate workstream — out of scope for v1.

## 9. App Store / Play Store compliance

Physical goods only at launch:

| Concern | Resolution |
|---|---|
| Apple IAP (3.1.1) | Physical goods exempt (3.1.5(a)). Stripe checkout in-app is fine for physical goods. |
| Apple Apple Pay disclosure | Disclose "Apple Pay" as a payment method in App Store metadata. |
| Google Play Billing | Physical goods exempt. |
| Account deletion impact | Deleting user account does NOT cancel in-flight Yoycol orders (legal/business need to retain). Document in privacy policy. |

**Hard rule (flagged for future):** Digital merch MUST use IAP, not Stripe. Triggers a separate workstream.

## 10. Anti-abuse

- `createPaymentIntent` validates everything server-side — never trust client-supplied price.
- App Check required on `createPaymentIntent` + `logMerchClickThrough`.
- `stripeWebhook` validates Stripe signature on every event; rejects unsigned.
- Rate limit on `createPaymentIntent`: 10 PI creations / UID / hour (well above legitimate user need; blocks card-testing attacks).
- All Stripe events log to `stripeEvents/{eventId}` for audit and idempotent replay.

## 11. Yoycol API key

**Current state (verified 2026-05-15):**
- A Yoycol API key exists in FAMUS's `functions/.env` at `/Volumes/Ex_Drive/famus-test/functions/.env`.
- FAMUS has `yoycolFulfillment.js` source as the reference pattern.

**For Reeboot Radio:**
- Reuse the same key if Yoycol allows multi-project use (Buzz confirms), OR
- Generate a separate Reeboot Radio Yoycol key (cleaner separation, recommended).
- Store via `firebase functions:secrets:set YOYCOL_API_KEY` in `livestreamchat-2d575`.

Never in client bundle.

## 12. Theme integration

Merch cards use the existing `Glass` component + Workstream-A tokens. No new design language.

## 13. Out of scope for D

- In-app multi-item cart (single-item-buy at launch).
- Digital goods (IAP territory).
- Wishlist / favorites.
- In-app reviews / ratings.
- Subscription products (T-shirt-of-the-month, etc.).
- Real-time inventory (daily sync sufficient).
- Multi-currency charging.
- Custom (user-uploaded design) products via Yoycol.

## 14. Success criteria

1. Buzz publishes a new product in Yoycol; appears in the app within 24h or on admin refresh.
2. User taps "Buy Now"; PaymentSheet opens with Apple Pay (iOS) / Google Pay (Android) + card option.
3. User completes payment; sheet dismisses; "Order placed!" toast; order visible in tracking screen.
4. Stripe webhook fires `payment_intent.succeeded`; `yoycolFulfillment` posts order to Yoycol; `orders/{orderId}.yoycolOrderId` is set.
5. Yoycol tracking sync updates `orders/{orderId}.status` from `placed` → `in_production` → `shipped` → `delivered` over the order lifetime.
6. Sold-out variant is greyed and unsellable.
7. Currency formatting respects viewer locale.
8. Failed payment shows clear in-app error (declined card, network error, etc.).
9. Stripe webhook signature validation rejects unsigned events with 400.
10. App Store reviewer can browse merch → tap product → see PaymentSheet → complete a test purchase with Stripe test card.
11. No IAP-flagged transactions.
12. `grep -rn "sk_live\|sk_test\|STRIPE_SECRET" src/` returns no Stripe secret keys.

## 15. Risks

| Risk | Mitigation |
|---|---|
| Stripe account verification slips (2–7 days variable) | D0 is parallel to A/B catalog work; checkout integrates last |
| Yoycol API rate-limits at scale | Daily sync; cached catalog stays usable |
| Stripe webhook misconfigured → payments succeed but no Yoycol order | Daily reconciliation report; manual order-create fallback |
| User account deletion mid-order | Retain order data for legal/fulfillment purposes; document in privacy policy |
| PaymentSheet native module conflicts with other native modules | Test on real iOS + Android during D6 |
| Stripe fraud / chargeback rate | Stripe Radar default rules; review false-positive rate after first month |
| Yoycol fulfillment failure (out of stock, supplier issue) | Refund flow + email user; tracked in `orders.status='cancelled'` |
| Apple reviewer perceives digital goods | Clear "Physical goods" copy + reviewer notes |

## 16. Build sequence

1. **D0 (Buzz manual, parallel):** Create Stripe account for Reebootradio LLC. KYC + bank link.
2. **D1:** Yoycol key in CF secret + verify access from `livestreamchat-2d575`.
3. **D2:** `syncYoycolCatalog` CF — port from FAMUS, deploy, smoke test.
4. **D3:** Schedule daily + admin-trigger endpoint.
5. **D4:** Replace `MerchShop.js` with grid from Firestore.
6. **D5:** `ProductDetailScreen` with variant picker.
7. **D6:** Once Stripe verified — install `@stripe/stripe-react-native`, `pod install`, rebuild.
8. **D7:** `createPaymentIntent` CF.
9. **D8:** Stripe webhook endpoint + signature validation + `yoycolFulfillment` helper (port from FAMUS).
10. **D9:** PaymentSheet integration in ProductDetail.
11. **D10:** Order tracking screen.
12. **D11:** `yoycolTrackingSync` scheduled CF.
13. **D12:** `logMerchClickThrough` + analytics.
14. **D13:** End-to-end test with Stripe test card.
15. **D14:** Visual QA in en + de + ja + ar locales.

Steps D1–D5 can run in parallel with D0. D6–D14 require D0 complete.

## 17. Dependencies

- **Blocks on A2.3** (MerchShop on tokens — handled in A).
- **Blocks on B** (locale-aware price formatting).
- **D0 external blocker:** Stripe account verification (2–7 days variable).
- **Independent of C.**
- **Triggers E prerequisites:** App Check (shared with C), reviewer notes copy, App Privacy Labels (financial transactions disclosure).

## 18. Estimated effort vs original Wix model

| Phase | Wix (original) | Yoycol + Stripe (this rev) |
|---|---|---|
| Catalog + display | 1.5 days | 1.5 days (similar) |
| Checkout | 0.5 day (WebView wrap) | 3–4 days (PaymentSheet + CFs + webhook + signature validation) |
| Fulfillment | 0 (Wix handles) | 1.5 days (Yoycol API integration + order tracking) |
| Stripe account verification | N/A | 2–7 calendar days (parallelizable) |
| **Total** | ~2 days | ~6–7 days + Stripe lead time |

## 19. Next step

After this spec is reviewed and approved by Buzz, invoke `superpowers:writing-plans`.
