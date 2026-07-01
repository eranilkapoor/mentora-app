# Plan Feature Packaging

> Current home: `docs/planning/PLAN-FEATURE-PACKAGING.md`
>
> Purpose: define what stays free, what is paid, recommended limits per plan tier, and how all features map to plans.
>
> Source-of-truth rule: business policy lives in this document; executable mapping lives in `master-seeder.service.ts` and must stay in sync with this file.

---

## Confirmed Plan Catalog

### Billing Cycle Rules

| Tier           | Allowed Billing Cycles     | Rationale                                                                                   |
| -------------- | -------------------------- | ------------------------------------------------------------------------------------------- |
| Free           | Yearly (internal)          | One static plan, no billing                                                                 |
| Silver         | Monthly, Quarterly, Yearly | Entry paid; half-yearly removed to keep the tier simple and push users toward yearly        |
| Gold           | Monthly, Quarterly, Yearly | Core revenue tier; half-yearly adds complexity with no differentiation gain                 |
| Platinum       | Monthly, Quarterly, Yearly | Same as Gold; users commit at monthly or yearly                                             |
| Assisted       | Half-Yearly, Yearly        | Service-led; quarterly too short to deliver human matchmaking value; monthly does not apply |
| Enterprise     | Custom contract            | Price, term, limits, integrations, governance, and support are negotiated                   |
| One-time boost | Daily (non-recurring SKU)  | Impulse purchase, not a subscription                                                        |

### Full Plan List (14 plans total)

| #   | Plan name            | Tier             | Billing cycle | Price (INR) | Duration | Popular |
| --- | -------------------- | ---------------- | ------------- | ----------- | -------- | ------- |
| 1   | FREE                 | Free             | —             | 0           | 365 days | —       |
| 2   | SILVER_MONTHLY       | Silver           | Monthly       | 699         | 30 days  | —       |
| 3   | SILVER_QUARTERLY     | Silver           | Quarterly     | 1,799       | 90 days  | ✓       |
| 4   | SILVER_YEARLY        | Silver           | Yearly        | 5,999       | 365 days | —       |
| 5   | GOLD_MONTHLY         | Gold             | Monthly       | 999         | 30 days  | ✓       |
| 6   | GOLD_QUARTERLY       | Gold             | Quarterly     | 2,499       | 90 days  | —       |
| 7   | GOLD_YEARLY          | Gold             | Yearly        | 7,999       | 365 days | —       |
| 8   | PLATINUM_MONTHLY     | Platinum         | Monthly       | 2,499       | 30 days  | —       |
| 9   | PLATINUM_QUARTERLY   | Platinum         | Quarterly     | 6,499       | 90 days  | ✓       |
| 10  | PLATINUM_YEARLY      | Platinum         | Yearly        | 19,999      | 365 days | —       |
| 11  | ASSISTED_HALF_YEARLY | Assisted         | Half-Yearly   | 26,186      | 180 days | ✓       |
| 12  | ASSISTED_YEARLY      | Assisted         | Yearly        | 42,373      | 365 days | —       |
| 13  | ASSISTED_CUSTOM     | Enterprise       | Custom        | Custom      | Custom   | —       |
| 14  | PROFILE_BOOST_24H    | Gold (boost SKU) | Daily         | 199         | 1 day    | —       |

---

## Native IAP Console Payload (Google + Apple)

This payload is aligned with current source-of-truth mapping in `plans.seed-data.ts`, payment verification DTOs, and mobile IAP purchase flow.

Use this as the exact setup blueprint for Google Play Console and App Store Connect.

```json
{
   "catalogVersion": "2026-07-01",
   "currency": "INR",
   "notes": {
      "excludedFromStore": ["FREE", "ASSISTED_CUSTOM"],
      "trialOfferId": "trial-7-days",
      "appleSubscriptionGroupId": "matchmate_membership"
   },
   "googlePlay": {
      "subscriptions": [
         {
            "productId": "matchmate_silver",
            "title": "MatchMate Silver",
            "basePlans": [
               {
                  "basePlanId": "monthly",
                  "linkedPlan": "SILVER_MONTHLY",
                  "priceInr": 699,
                  "durationDays": 30,
                  "offerId": "trial-7-days",
                  "trialDays": 7
               },
               {
                  "basePlanId": "quarterly",
                  "linkedPlan": "SILVER_QUARTERLY",
                  "priceInr": 1799,
                  "durationDays": 90,
                  "offerId": "trial-7-days",
                  "trialDays": 7
               },
               {
                  "basePlanId": "yearly",
                  "linkedPlan": "SILVER_YEARLY",
                  "priceInr": 5999,
                  "durationDays": 365,
                  "offerId": "trial-7-days",
                  "trialDays": 7
               }
            ]
         },
         {
            "productId": "matchmate_gold",
            "title": "MatchMate Gold",
            "basePlans": [
               {
                  "basePlanId": "monthly",
                  "linkedPlan": "GOLD_MONTHLY",
                  "priceInr": 999,
                  "durationDays": 30,
                  "offerId": "trial-7-days",
                  "trialDays": 7
               },
               {
                  "basePlanId": "quarterly",
                  "linkedPlan": "GOLD_QUARTERLY",
                  "priceInr": 2499,
                  "durationDays": 90,
                  "offerId": "trial-7-days",
                  "trialDays": 7
               },
               {
                  "basePlanId": "yearly",
                  "linkedPlan": "GOLD_YEARLY",
                  "priceInr": 7999,
                  "durationDays": 365,
                  "offerId": "trial-7-days",
                  "trialDays": 7
               }
            ]
         },
         {
            "productId": "matchmate_platinum",
            "title": "MatchMate Platinum",
            "basePlans": [
               {
                  "basePlanId": "monthly",
                  "linkedPlan": "PLATINUM_MONTHLY",
                  "priceInr": 2499,
                  "durationDays": 30,
                  "offerId": "trial-7-days",
                  "trialDays": 7
               },
               {
                  "basePlanId": "quarterly",
                  "linkedPlan": "PLATINUM_QUARTERLY",
                  "priceInr": 6499,
                  "durationDays": 90,
                  "offerId": "trial-7-days",
                  "trialDays": 7
               },
               {
                  "basePlanId": "yearly",
                  "linkedPlan": "PLATINUM_YEARLY",
                  "priceInr": 19999,
                  "durationDays": 365,
                  "offerId": "trial-7-days",
                  "trialDays": 7
               }
            ]
         },
         {
            "productId": "matchmate_assisted",
            "title": "MatchMate Assisted",
            "basePlans": [
               {
                  "basePlanId": "half-yearly",
                  "linkedPlan": "ASSISTED_HALF_YEARLY",
                  "priceInr": 26186,
                  "durationDays": 180,
                  "offerId": "trial-7-days",
                  "trialDays": 7
               },
               {
                  "basePlanId": "yearly",
                  "linkedPlan": "ASSISTED_YEARLY",
                  "priceInr": 42373,
                  "durationDays": 365,
                  "offerId": "trial-7-days",
                  "trialDays": 7
               }
            ]
         }
      ],
      "consumables": [
         {
            "productId": "matchmate_profile_boost_24h",
            "linkedPlan": "PROFILE_BOOST_24H",
            "priceInr": 199,
            "type": "consumable"
         }
      ]
   },
   "appStore": {
      "subscriptionGroupId": "matchmate_membership",
      "autoRenewableSubscriptions": [
         {
            "productId": "matchmate_silver_monthly",
            "linkedPlan": "SILVER_MONTHLY",
            "priceInr": 699,
            "durationDays": 30,
            "introductoryTrialDays": 7
         },
         {
            "productId": "matchmate_silver_quarterly",
            "linkedPlan": "SILVER_QUARTERLY",
            "priceInr": 1799,
            "durationDays": 90,
            "introductoryTrialDays": 7
         },
         {
            "productId": "matchmate_silver_yearly",
            "linkedPlan": "SILVER_YEARLY",
            "priceInr": 5999,
            "durationDays": 365,
            "introductoryTrialDays": 7
         },
         {
            "productId": "matchmate_gold_monthly",
            "linkedPlan": "GOLD_MONTHLY",
            "priceInr": 999,
            "durationDays": 30,
            "introductoryTrialDays": 7
         },
         {
            "productId": "matchmate_gold_quarterly",
            "linkedPlan": "GOLD_QUARTERLY",
            "priceInr": 2499,
            "durationDays": 90,
            "introductoryTrialDays": 7
         },
         {
            "productId": "matchmate_gold_yearly",
            "linkedPlan": "GOLD_YEARLY",
            "priceInr": 7999,
            "durationDays": 365,
            "introductoryTrialDays": 7
         },
         {
            "productId": "matchmate_platinum_monthly",
            "linkedPlan": "PLATINUM_MONTHLY",
            "priceInr": 2499,
            "durationDays": 30,
            "introductoryTrialDays": 7
         },
         {
            "productId": "matchmate_platinum_quarterly",
            "linkedPlan": "PLATINUM_QUARTERLY",
            "priceInr": 6499,
            "durationDays": 90,
            "introductoryTrialDays": 7
         },
         {
            "productId": "matchmate_platinum_yearly",
            "linkedPlan": "PLATINUM_YEARLY",
            "priceInr": 19999,
            "durationDays": 365,
            "introductoryTrialDays": 7
         },
         {
            "productId": "matchmate_assisted_half_yearly",
            "linkedPlan": "ASSISTED_HALF_YEARLY",
            "priceInr": 26186,
            "durationDays": 180,
            "introductoryTrialDays": 7
         },
         {
            "productId": "matchmate_assisted_yearly",
            "linkedPlan": "ASSISTED_YEARLY",
            "priceInr": 42373,
            "durationDays": 365,
            "introductoryTrialDays": 7
         }
      ],
      "consumables": [
         {
            "productId": "matchmate_profile_boost_24h",
            "linkedPlan": "PROFILE_BOOST_24H",
            "priceInr": 199,
            "type": "consumable"
         }
      ]
   }
}
```

### Seed-Mapped Entitlement Keys (for backend verification)

```json
{
   "SILVER_MONTHLY": {
      "android": { "productId": "matchmate_silver", "basePlanId": "monthly", "offerId": "trial-7-days", "productType": "subscription" },
      "ios": { "productId": "matchmate_silver_monthly", "subscriptionGroupId": "matchmate_membership", "productType": "subscription" }
   },
   "SILVER_QUARTERLY": {
      "android": { "productId": "matchmate_silver", "basePlanId": "quarterly", "offerId": "trial-7-days", "productType": "subscription" },
      "ios": { "productId": "matchmate_silver_quarterly", "subscriptionGroupId": "matchmate_membership", "productType": "subscription" }
   },
   "SILVER_YEARLY": {
      "android": { "productId": "matchmate_silver", "basePlanId": "yearly", "offerId": "trial-7-days", "productType": "subscription" },
      "ios": { "productId": "matchmate_silver_yearly", "subscriptionGroupId": "matchmate_membership", "productType": "subscription" }
   },
   "GOLD_MONTHLY": {
      "android": { "productId": "matchmate_gold", "basePlanId": "monthly", "offerId": "trial-7-days", "productType": "subscription" },
      "ios": { "productId": "matchmate_gold_monthly", "subscriptionGroupId": "matchmate_membership", "productType": "subscription" }
   },
   "GOLD_QUARTERLY": {
      "android": { "productId": "matchmate_gold", "basePlanId": "quarterly", "offerId": "trial-7-days", "productType": "subscription" },
      "ios": { "productId": "matchmate_gold_quarterly", "subscriptionGroupId": "matchmate_membership", "productType": "subscription" }
   },
   "GOLD_YEARLY": {
      "android": { "productId": "matchmate_gold", "basePlanId": "yearly", "offerId": "trial-7-days", "productType": "subscription" },
      "ios": { "productId": "matchmate_gold_yearly", "subscriptionGroupId": "matchmate_membership", "productType": "subscription" }
   },
   "PLATINUM_MONTHLY": {
      "android": { "productId": "matchmate_platinum", "basePlanId": "monthly", "offerId": "trial-7-days", "productType": "subscription" },
      "ios": { "productId": "matchmate_platinum_monthly", "subscriptionGroupId": "matchmate_membership", "productType": "subscription" }
   },
   "PLATINUM_QUARTERLY": {
      "android": { "productId": "matchmate_platinum", "basePlanId": "quarterly", "offerId": "trial-7-days", "productType": "subscription" },
      "ios": { "productId": "matchmate_platinum_quarterly", "subscriptionGroupId": "matchmate_membership", "productType": "subscription" }
   },
   "PLATINUM_YEARLY": {
      "android": { "productId": "matchmate_platinum", "basePlanId": "yearly", "offerId": "trial-7-days", "productType": "subscription" },
      "ios": { "productId": "matchmate_platinum_yearly", "subscriptionGroupId": "matchmate_membership", "productType": "subscription" }
   },
   "ASSISTED_HALF_YEARLY": {
      "android": { "productId": "matchmate_assisted", "basePlanId": "half-yearly", "offerId": "trial-7-days", "productType": "subscription" },
      "ios": { "productId": "matchmate_assisted_half_yearly", "subscriptionGroupId": "matchmate_membership", "productType": "subscription" }
   },
   "ASSISTED_YEARLY": {
      "android": { "productId": "matchmate_assisted", "basePlanId": "yearly", "offerId": "trial-7-days", "productType": "subscription" },
      "ios": { "productId": "matchmate_assisted_yearly", "subscriptionGroupId": "matchmate_membership", "productType": "subscription" }
   },
   "PROFILE_BOOST_24H": {
      "android": { "productId": "matchmate_profile_boost_24h", "productType": "consumable" },
      "ios": { "productId": "matchmate_profile_boost_24h", "productType": "consumable" }
   }
}
```

### Store Setup Checklist (Execution Order)

1. Google Play Console:
    - Create subscription products: `matchmate_silver`, `matchmate_gold`, `matchmate_platinum`, `matchmate_assisted`.
    - Under each product, create base plans exactly as above (`monthly`, `quarterly`, `yearly`, `half-yearly`).
    - Under each base plan, create an offer `trial-7-days` with 7-day free trial.
    - Create in-app product `matchmate_profile_boost_24h` as consumable.
    - Activate products in all launch countries and set regional pricing.

2. App Store Connect:
    - Create subscription group `matchmate_membership`.
    - Create all 11 auto-renewable product IDs listed above inside the same group.
    - Configure 7-day introductory trial for each subscription product.
    - Create non-consumable in-app purchase `matchmate_profile_boost_24h` as consumable.
    - Set pricing and availability for target storefronts.

3. Backend strict verification requirements:
    - Set store credentials and keep strict mode enabled in production:
       - `PAYMENT_MOBILE_STORE_VERIFICATION_MODE=strict`
       - `PAYMENT_MOBILE_STORE_STRICT_VERIFICATION_ENABLED=true`
    - Configure Google and Apple server verification secrets from `docs/launch/STORE-BILLING-INTEGRATION.md`.

4. Mobile runtime verification:
    - Ensure `EXPO_PUBLIC_STORE_BILLING_ENABLED=true` for release channels using native IAP.
    - Confirm each plan from API has expected `storeProducts` mapping.
    - Confirm purchase verify payload sends matching `productId`, `basePlanId`, and `offerId` (Google) and matching `productId` (Apple).

5. Sandbox QA before production:
    - Test new purchase, trial-eligible purchase, trial-ineligible fallback, renewal, grace period, cancellation, refund, reinstall + restore.
    - Test duplicate transaction replay and verify idempotent backend behavior.
    - Validate consumable boost purchase replay and entitlement application.

---

## Tier Strategy

### Free — Activation and trust only

Give users enough to complete a profile and feel the product. Strict limits on every action so they hit the paywall during normal use.

Features included:

- All auth and account basics
- Create, edit, delete profile
- Upload 5 photos
- Basic search, basic filters, religion/caste/location/education/profession/height filters
- Send 10 interests, accept/reject interests
- View interests received
- Shortlist up to 20 profiles
- Chat access with 20-message limit
- Daily profile views: 25
- Profile completion score
- Push and email notifications
- Safety: report, block
- Customer support chat

Features NOT included in Free:

- Advanced search or advanced filters
- Contact details (phone, email)
- Unlimited chat or interests
- Voice/video calls
- AI features
- Boosts or visibility tools
- Analytics

---

### Silver — Entry paid, practical daily upgrade

Target user: price-sensitive first-time subscriber who wants to actually connect with matches. Converts the highest volume of free users. Monthly is the anchor price; quarterly is the conversion sweet spot.

Features added over Free:

- Advanced profile completion tools
- Upload 10 photos
- Send 50 interests
- Shortlist 50, Favorites 50
- Chat with 100 message limit + read receipts + typing indicator
- Send images in chat
- View contact details (phone, email)
- View private photos
- Advanced search and advanced filters
- Income-based search filter
- Daily profile views: 100
- Who viewed me
- Saved searches: 10
- Ad-free experience
- 1 daily profile boost
- Subscription lifecycle: auto-renewal, grace period

NOT included in Silver (reserved for Gold+):

- Unlimited chat or interests
- Voice/video calls
- Upload videos
- Unlimited profile views
- Profile visibility tools (highlight, top in search)
- AI and compatibility intelligence

---

### Gold — Power user, core revenue driver

Target user: serious user who needs unlimited access and real visibility. Typically 60–70% of paid plan revenue. Monthly is entry; Yearly drives long-term retention.

Features added over Silver:

- Upload 20 photos + 5 videos
- Send unlimited interests
- Unlimited chat
- Send voice notes + voice calls
- Hide last seen, hide online status, hide profile photo
- Private photos album
- Profile highlight
- Request and view profile photos + videos
- Unlimited search and unlimited profile views
- Profile analytics + daily activity stats
- Top in search + show on home
- Manglik matching
- Marketing notifications
- 2 profile boosts
- Wallet system
- Priority support

NOT included in Gold (reserved for Platinum+):

- Video calls
- AI features
- Global/NRI search
- Featured in search / priority search ranking
- Verified/VIP badges
- Concierge or matchmaker access

---

### Platinum — Premium intelligence and exclusivity

Target user: user who wants every advantage, AI-powered matching, global search, and maximum visibility. Justified by AI + exclusive features, not just higher limits.

Features added over Gold:

- Video profile + audio intro
- Featured profile + incognito mode
- Private album
- ID verification + verified badge
- Horoscope upload + Kundli matching + astrology report
- Priority interest delivery
- Unlimited shortlist and favorites
- Chat without match required
- Priority chat + message translation
- Send videos in chat + video calls
- Direct contact access
- AI photo verification + blurred photo mode
- Request private videos
- Global search + international matches + NRI matching
- Featured in search + priority search ranking
- Saved searches, recent searches
- Full AI suite: recommendations, profile summary, photo selection, compatibility analysis, conversation starters, interest prediction, fake profile detection
- Advanced personality, interest, location matching
- Strict and smart preferences
- Sub-caste, community, marriage timeline, children, eating, lifestyle preferences
- Full family features: contact visibility, parent login, guardian access
- Full analytics: interest, chat, engagement, match success rate, weekly reports
- SMS + instant match alerts + daily match digest
- Location-based matching, nearby profiles, travel mode
- VIP badge + premium badge
- Relationship manager + dedicated relationship manager
- Concierge matchmaking + personal matchmaker
- Weekly boosts (7) + monthly boosts (30) + unlimited boosts
- Spotlight profile
- Promo codes + referral rewards + referral bonus + earn credits
- Safe mode + fraud detection + manual profile review
- Unlimited shortlist, contact view, message, match limits
- Gamification: streak rewards, login rewards, match quiz, compatibility games
- Account export

---

### Assisted — Platinum entitlements + human service layer

Target user: serious, time-constrained professional willing to pay a premium for a human matchmaker. Product entitlements are identical to Platinum. Pricing reflects the human service, not additional feature flags.

Billing rationale:

- Half-Yearly: standard entry to assisted service; provides enough time for meaningful curation and match presentation
- Yearly: premium committed clients who want a full engagement cycle with their matchmaker

---

### Enterprise — Contract-configured platform

Enterprise is not a checkout subscription and has no public price, fixed duration, trial, or automatic renewal. It is activated only after a signed commercial contract.

Every feature value is seeded as `custom`, including all consumer capabilities plus:

- SAML/OIDC single sign-on
- Organization admin dashboard
- Contracted API access and quotas
- Custom branding and white-label options
- Bulk seat management and pricing
- SLA-backed support and escalation
- Data residency and retention controls
- Dedicated account manager

The mobile/web Membership screen routes Enterprise enquiries to support/sales and never sends this plan to payment, coupon, trial, or app-store checkout APIs.

---

### PROFILE_BOOST_24H — One-time impulse SKU

Non-recurring. Only grants:

- 1 profile boost
- One-time boost purchase flag
- Spotlight profile (24h)

---

## Limits Matrix

| Capability            | Free | Silver  |   Gold    |    Platinum / Assisted    |
| --------------------- | :--: | :-----: | :-------: | :-----------------------: |
| Upload photos         |  5   |   10    |    20     |            20             |
| Upload videos         |  0   |    0    |     5     |             5             |
| Send interests        |  10  |   50    | Unlimited |         Unlimited         |
| Messages              |  20  |   100   | Unlimited |         Unlimited         |
| Daily profile views   |  25  |   100   | Unlimited |         Unlimited         |
| Profile views (total) |  25  |   100   | Unlimited |         Unlimited         |
| Shortlist profiles    |  20  |   50    |     —     |         Unlimited         |
| Favourite profiles    |  0   |   50    |     —     |         Unlimited         |
| Saved searches        |  0   |   10    |     —     |         Unlimited         |
| Profile boosts        |  0   | 1 daily |  2 quota  | 7 weekly / 30 monthly / ∞ |
| Match limit           |  20  |    —    |     —     |         Unlimited         |
| Contact view limit    |  0   | enabled |  enabled  |         Unlimited         |
| Shortlist limit (cap) |  20  |   50    |     —     |         Unlimited         |
| Grace period (days)   |  0   |    3    |     3     |             3             |

`—` = feature not explicitly limited; access is controlled by the feature flag value.

`Unlimited` = seeded as `-1` which the access service treats as unlimited.

---

## Seeder Mapping Architecture

All plan-feature mappings use a layered bundle pattern in `master-seeder.service.ts`:

```
platformFeatures          → applied to every recurring plan (auth, safety, basics)
   + FREE overlay          → Free-specific limits and flags
   + silverFeatures        → All SILVER_* plans
   + goldFeatures          → All GOLD_* plans
   + platinumFeatures      → All PLATINUM_* and ASSISTED_* plans
   + ASSISTED_CUSTOM      → Every feature mapped to `custom`
   + PROFILE_BOOST_24H     → Boost-only SKU
```

Later additions in the same plan override earlier platform defaults via the `addFeature` deduplication map.

### Recurring plan slug sets in seeder

| Bundle               | Plans                                                      |
| -------------------- | ---------------------------------------------------------- |
| `recurringPlanSlugs` | FREE + all Silver + all Gold + all Platinum + all Assisted |
| Silver mapping       | SILVER_MONTHLY, SILVER_QUARTERLY, SILVER_YEARLY            |
| Gold mapping         | GOLD_MONTHLY, GOLD_QUARTERLY, GOLD_YEARLY                  |
| Platinum mapping     | PLATINUM_MONTHLY, PLATINUM_QUARTERLY, PLATINUM_YEARLY      |
| Assisted mapping     | ASSISTED_HALF_YEARLY, ASSISTED_YEARLY                      |
| Custom assisted mapping | ASSISTED_CUSTOM (all feature keys, value `custom`)      |
| Boost SKU            | PROFILE_BOOST_24H                                          |

---

## Governance Rules

When changing pricing or packaging:

1. Update this document first (policy first, code second).
2. Update `plans.seed-data.ts`: plan list, price, duration, billing cycle, sort order.
3. Update `master-seeder.service.ts`: `PlanSlug` type, `recurringPlanSlugs`, and relevant feature bundle.
4. Re-run seeder and verify:
   - Every `PlanTier` value has intended plans
   - Silver: M, Q, Y — Gold: M, Q, Y — Platinum: M, Q, Y — Assisted: HY, Y
   - No Assisted monthly plan exists
   - No Gold or Platinum half-yearly plan exists
   - Fixed-plan limit/quota/duration values are numeric
   - Enterprise maps every feature to the explicit string `custom`
   - Enterprise cannot enter trial, coupon, payment, or store checkout flows
