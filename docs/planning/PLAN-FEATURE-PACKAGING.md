# Plan Feature Packaging

> Current home: `docs/planning/PLAN-FEATURE-PACKAGING.md`
>
> Purpose: define what stays free, what is paid, recommended limits per plan tier, and how all features map to plans.
>
> Source-of-truth rule: business policy lives in this document; executable mapping lives in `master-seeder.service.ts` and must stay in sync with this file.

---

## Confirmed Plan Catalog

### Billing Cycle Rules

| Tier | Allowed Billing Cycles | Rationale |
| ---- | ---- | ---- |
| Free | Yearly (internal) | One static plan, no billing |
| Silver | Monthly, Quarterly, Yearly | Entry paid; half-yearly removed to keep the tier simple and push users toward yearly |
| Gold | Monthly, Quarterly, Yearly | Core revenue tier; half-yearly adds complexity with no differentiation gain |
| Platinum | Monthly, Quarterly, Yearly | Same as Gold; users commit at monthly or yearly |
| Assisted | Half-Yearly, Yearly | Service-led; quarterly too short to deliver human matchmaking value; monthly does not apply |
| One-time boost | Daily (non-recurring SKU) | Impulse purchase, not a subscription |

### Full Plan List (13 plans total)

| # | Plan name | Tier | Billing cycle | Price (INR) | Duration | Popular |
| -- | ---- | ---- | ---- | ---- | ---- | ---- |
| 1 | FREE | Free | — | 0 | 365 days | — |
| 2 | SILVER_MONTHLY | Silver | Monthly | 699 | 30 days | — |
| 3 | SILVER_QUARTERLY | Silver | Quarterly | 1,799 | 90 days | ✓ |
| 4 | SILVER_YEARLY | Silver | Yearly | 5,999 | 365 days | — |
| 5 | GOLD_MONTHLY | Gold | Monthly | 999 | 30 days | ✓ |
| 6 | GOLD_QUARTERLY | Gold | Quarterly | 2,499 | 90 days | — |
| 7 | GOLD_YEARLY | Gold | Yearly | 7,999 | 365 days | — |
| 8 | PLATINUM_MONTHLY | Platinum | Monthly | 2,499 | 30 days | — |
| 9 | PLATINUM_QUARTERLY | Platinum | Quarterly | 6,499 | 90 days | ✓ |
| 10 | PLATINUM_YEARLY | Platinum | Yearly | 19,999 | 365 days | — |
| 11 | ASSISTED_HALF_YEARLY | Assisted | Half-Yearly | 26,186 | 180 days | ✓ |
| 12 | ASSISTED_YEARLY | Assisted | Yearly | 42,373 | 365 days | — |
| 13 | PROFILE_BOOST_24H | Gold (boost SKU) | Daily | 199 | 1 day | — |

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

### PROFILE_BOOST_24H — One-time impulse SKU

Non-recurring. Only grants:
- 1 profile boost
- One-time boost purchase flag
- Spotlight profile (24h)

---

## Limits Matrix

| Capability | Free | Silver | Gold | Platinum / Assisted |
| ---- | :----: | :----: | :----: | :----: |
| Upload photos | 5 | 10 | 20 | 20 |
| Upload videos | 0 | 0 | 5 | 5 |
| Send interests | 10 | 50 | Unlimited | Unlimited |
| Messages | 20 | 100 | Unlimited | Unlimited |
| Daily profile views | 25 | 100 | Unlimited | Unlimited |
| Profile views (total) | 25 | 100 | Unlimited | Unlimited |
| Shortlist profiles | 20 | 50 | — | Unlimited |
| Favourite profiles | 0 | 50 | — | Unlimited |
| Saved searches | 0 | 10 | — | Unlimited |
| Profile boosts | 0 | 1 daily | 2 quota | 7 weekly / 30 monthly / ∞ |
| Match limit | 20 | — | — | Unlimited |
| Contact view limit | 0 | enabled | enabled | Unlimited |
| Shortlist limit (cap) | 20 | 50 | — | Unlimited |
| Grace period (days) | 0 | 3 | 3 | 3 |

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
   + PROFILE_BOOST_24H     → Boost-only SKU
```

Later additions in the same plan override earlier platform defaults via the `addFeature` deduplication map.

### Recurring plan slug sets in seeder

| Bundle | Plans |
| ---- | ---- |
| `recurringPlanSlugs` | FREE + all Silver + all Gold + all Platinum + all Assisted |
| Silver mapping | SILVER_MONTHLY, SILVER_QUARTERLY, SILVER_YEARLY |
| Gold mapping | GOLD_MONTHLY, GOLD_QUARTERLY, GOLD_YEARLY |
| Platinum mapping | PLATINUM_MONTHLY, PLATINUM_QUARTERLY, PLATINUM_YEARLY |
| Assisted mapping | ASSISTED_HALF_YEARLY, ASSISTED_YEARLY |
| Boost SKU | PROFILE_BOOST_24H |

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
   - All limit/quota/duration feature `defaultValue` fields are numeric (not boolean)






















Here's the full feature breakdown. You can filter by plan tab at the top. Here's the design rationale:

**Platform (all plans, non-negotiable):** These are infrastructure and trust features — auth flows, basic profile CRUD, push/email notifications, safety tools (report, block, fraud detection), GDPR/privacy controls, and customer support. Every user gets these regardless of plan.

**Free:** A taste of the app — limited interests (e.g. 5/day), basic search with common filters (religion, caste, location, height), up to 3 photos, basic matching, limited chat and contact views, gamification hooks to drive engagement, and promo/referral entry points to push upgrades.

**Silver:** The first paid step — removes ads, unlocks AI fake profile detection, Kundli matching, matrimony-specific preferences, SMS notifications, saved searches, contact requests, AI basic matching, and blurred photo mode. Good for users who are serious but budget-conscious.

**Gold:** The workhorse plan — unlocks most AI features (conversation starters, recommendations, compatibility scores), voice calls, unlimited chat, video/image sharing in chat, who-viewed-me, advanced filters, income-based search, family features, and daily activity stats.

**Platinum:** The full suite — incognito mode, video calls, AI compatibility deep-analysis, travel mode, unlimited boosts, spotlight, personal matchmaker, weekly reports, international/NRI search, and top-of-search placement.

**Enterprise value guidance:** For B2B/white-label clients, every feature is "custom" — meaning configurable limits, SSO integration, admin dashboards, dedicated relationship managers, SLA-backed support, API access, custom branding, bulk seat pricing, and data residency controls. The features themselves aren't the differentiator; control, compliance, and concierge are.

Click any plan tab to see only what's included in that tier. The "limited" badge means the feature exists but with a count cap (e.g. 5 messages/day, 3 contact views/week) — a key free-to-paid conversion trigger.