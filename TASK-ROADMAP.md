# 🚀 Enterprise Matrimonial App — Task Roadmap

## Status Legend

| Icon | Status |
|------|--------|
| ✅ | Done / Completed |
| ⏳ | Pending / In Progress |
| 📂 | Open / Not Started |
| 🚫 | Not Picked / Not Assigned |
| ⚠️ | Blocked / Issue |
| 🔥 | High Priority |
| 💤 | On Hold |
| 🆕 | Recommended Addition |

---

## 🧱 1. Core Platform (Foundation)

### 1.1 Application Boot & Health

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| ✅ | Root URL Check (`/`) | None | Quick sanity check for uptime |
| ✅ | Health Check (`/health`) | None | Required for load balancers, Kubernetes |
| ✅ | Readiness Probe (`/ready`) | DB, Redis | Separate liveness vs readiness for K8s |
| ✅ | Graceful Shutdown Handler | Server | Zero-downtime deploys |

### 1.2 Config, Environment & Feature System

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| ✅ | Central Config System (`@nestjs/config` + Joi) | None | Prevent runtime crashes due to missing env |
| ✅ | Environment Separation (dev/staging/prod) | Config | Safe deployments |
| 🆕 | Secrets Manager Integration (AWS SM / Vault) | Config | Never store secrets in env files |
| 🆕 | Feature Flag System (LaunchDarkly / Unleash) | Config | Safe rollouts, A/B testing |
| 🆕 | Remote Config (Firebase RC / custom) | Config | Dynamic app behaviour without redeploy |

---

## 🔐 2. Authentication & Session System

### 2.1 Authentication Flows

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| ✅ | Email Registration | None | Primary onboarding |
| ✅ | Phone + OTP Registration | OTP Service | India-first users |
| ✅ | Social Login (Google / Facebook) | OAuth 2.0 | Reduce friction |
| ✅ | Apple Sign-In | OAuth | iOS App Store requirement |
| ✅ | Login (Email / Phone / Social) | Auth | Core access |
| ✅ | Forgot Password | Email Service | Account recovery |
| ✅ | Magic Link Login | Email | Passwordless UX option |
| ✅ | Biometric Auth (Face ID / Fingerprint) | Mobile SDK | Fast re-auth on mobile |

### 2.2 Token & Session Management

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| ✅ | Access + Refresh Token System (JWT) | Auth | Secure sessions |
| ✅ | Token Rotation on Refresh | Session DB | Prevent token replay attacks |
| ✅ | Logout from All Devices | Session DB | Security control |
| ✅ | Device Tracking (OS, browser, IP) | Headers | Fraud detection |
| ✅ | Concurrent Session Limit | Session DB | Prevent account sharing |
| ✅ | Suspicious Login Detection | ML / Heuristics | Geo anomaly, new device alerts |
| ✅ | Session Activity Timeline | Session DB | User transparency + audit |

### 2.3 Verification & KYC System

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| ✅ | Email Verification | Email Service | Trust |
| ✅ | Phone Verification (OTP) | SMS / OTP | Mandatory in India |
| ✅ | Profile KYC Verification | Storage + Admin | Prevent fake users |
| ✅ | Aadhaar / DigiLocker eKYC | Govt API | Legal & high-trust verification |
| ✅ | Selfie-to-Photo Liveness Check | AI / Vision API | Ensure user is real person |
| ✅ | Document Upload + Manual Review Queue | Storage + Admin | KYC workflow |
| ✅ | Verification Badge System | Profile | Show verified checkmarks on profile |

### 2.4 Two-Factor Authentication (2FA)

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| ✅ | TOTP 2FA (Google Authenticator) | Auth | Enterprise security add-on |
| ✅ | SMS 2FA Toggle | OTP | User-configurable |
| ✅ | Recovery Codes Generation | Auth | 2FA backup |

---

## 👤 3. User & Profile System

### 3.1 Profile Management

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| ✅ | Onboarding Profile (multi-step wizard) | Auth | First-time setup |
| ✅ | View My Profile | Auth | Core |
| ✅ | Edit Profile | Auth | Updates |
| ✅ | Partner Preferences | Profile | Feed into match engine |
| ✅ | Profile Strength / Completeness Score | Profile | Nudge users to complete profile |
| ✅ | Profile Visibility Score (searchability) | Algorithm | Engagement driver |
| ✅ | Soft-Delete / Deactivate Account | Auth | GDPR compliance |
| ✅ | Account Deletion (Right to Erasure) | DB + Storage | GDPR / IT Act 2023 |
| ✅ | Profile Boost (paid feature) | Subscription | Monetization lever |

### 3.2 Matrimonial-Specific Bio Fields

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| ✅ | Horoscope / Kundli Details | Profile DB | Core for Indian matrimony |
| ✅ | Family Background Section | Profile DB | Key matrimonial data point |
| ✅ | Lifestyle Preferences (diet, habits) | Profile DB | Better match scoring |
| ✅ | Career & Education Details (structured) | Profile DB | Searchable fields |
| ✅ | Community / Caste / Sub-caste Fields | Profile DB | Market-specific matching |
| ✅ | NRI Flag & Abroad Location | Profile DB | NRI segment is premium |

### 3.3 Media System

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| ✅ | Upload Images (S3 / local) | Storage | Core UX |
| ✅ | Upload Videos (intro video) | Storage / CDN | Premium feature |
| ✅ | Set Primary Profile Photo | Media | UX |
| ✅ | AI Image Moderation (nudity / offensive) | AI API (AWS Rekognition) | Content safety |
| ✅ | Manual Review Queue for Flagged Media | Admin Panel | Moderation workflow |
| ✅ | Photo Privacy (blur until interest accepted) | Media + Match | Safety & trust |
| ✅ | Watermarking on Exported Photos | Media | Prevent photo scraping |
| ✅ | Profile Video Thumbnail Auto-generation | FFmpeg | Better UX |

### 3.4 Privacy, Consent & Settings

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| ✅ | Privacy Settings (who can see what) | Auth | User control |
| ✅ | Notification Settings | Notification Service | Engagement control |
| ✅ | Hide Profile from Specific Users | Interaction | User safety |
| ✅ | Incognito Browse Mode (premium) | Subscription | Browse without showing viewed |
| ✅ | Data Download (GDPR data export) | DB + Storage | Legal compliance |
| ✅ | Consent Management (privacy policy versioning) | Auth | PDPB / GDPR compliance |

---

## ❤️ 4. Matching Engine

### 4.1 Match Discovery & Feed

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| ✅ | Recommended Matches API | Profile + Algorithm | Core business logic |
| ✅ | Filters API (age, location, community…) | Search | UX control |
| ✅ | ML-based Ranking Engine | Data pipeline | Competitive edge |
| ✅ | Compatibility Score Engine | Profile fields | Show % match to user |
| ✅ | Mutual Preference Scoring | Both profiles | Better match quality |
| ✅ | Nearby Matches (geolocation) | Location | Convenience |
| ✅ | Premium Match Curator (human + AI) | Admin + ML | Concierge upsell |
| ✅ | "Daily Matches" Push Notification | Scheduler + Notif | Daily re-engagement |

### 4.2 Interaction System

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| ✅ | View Profile (tracked) | Interaction DB | Analytics input |
| ✅ | Send Interest | Interaction DB | Matrimony-specific CTA |
| ✅ | Accept / Reject Interest | Interaction DB | Match trigger |
| ✅ | Shortlist / Save Profile | Interaction DB | Bookmark for later |
| ✅ | Block User | Moderation | Safety |
| ✅ | Report User / Content | Moderation | Safety + compliance |
| ✅ | "Who Viewed Me" Feature (premium) | Interaction + Sub | Monetization lever |
| ✅ | "Who Liked Me" Feature (premium) | Interaction + Sub | Monetization lever |
| ✅ | Interaction Limit by Subscription Tier | RBAC + Sub | Enforce plan limits |

### 4.3 Match Creation & Lifecycle

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| ✅ | Match Creation Logic (on mutual interest) | Interaction | Core |
| ✅ | Match Expiry Logic | Subscription + Scheduler | Premium upsell |
| ✅ | Match Quality Score (post-match) | ML | Track match health |
| ✅ | Unmatch Feature | Match DB | User control |
| ✅ | Match Statistics per User | Analytics | Engagement insights |

---

## 💬 5. Chat System

### Backend

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| ✅ | Chat List API | Match | Messaging hub |
| ✅ | Chat Messages API (REST + Socket.io) | Socket.io | Real-time messaging |
| ✅ | Read Receipts | Chat DB | UX feedback |
| ✅ | Typing Indicators | Socket.io | UX feedback |
| ⚠️ | Media Sharing in Chat (image / video) | Storage | Engagement |
| ⚠️ | Chat Moderation (AI + manual) | AI + Admin | Safety |
| 🆕 | Message Deletion (own messages) | Chat DB | User control |
| 🆕 | Message Reactions (emoji) | Chat DB | Engagement |
| 🆕 | Voice Messages | Storage + CDN | Mobile-native UX |
| 🆕 | Chat Request System (pre-match DM) | Subscription | Premium unlock |
| 🆕 | Chat Translation (multilingual) | AI API | Pan-India regional support |
| 🆕 | Profanity Filter (NLP) | AI API | Safety |
| 🆕 | Chat Archiving | Chat DB | Long-term users |

### Frontend

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| ✅ | Chat List Screen | API | UX |
| ✅ | Chat Screen (real-time) | Socket.io | Core |
| ✅ | Typing Indicator UI | Socket | UX |
| ⚠️ | Media Sharing UI | Storage API | Blocked |
| 🆕 | Chat Request Accept / Reject UI | API | Pre-match flow |
| 🆕 | Voice Message Recording UI | Browser API | Engagement |
| 🆕 | Message Reactions UI | Chat API | Engagement |
| 🆕 | Translated Message Toggle | Translation API | Accessibility |

---

## 🔔 6. Notifications System

### Backend

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| 🆕 | Push Notification Service (FCM / APNs) | Firebase | Mobile engagement |
| 🆕 | In-App Notification System | DB + Socket | Real-time alerts |
| 🆕 | Email Notification Templates (transactional) | Email Service | Professional comms |
| 🆕 | SMS Notification Service | SMS API | Critical alerts |
| 🆕 | WhatsApp Notification (Meta WABA) | Meta WABA | India-first high-engagement channel |
| 🆕 | Notification Preference Management | User DB | Avoid spamming users |
| 🆕 | Notification Deduplication | Queue + Cache | Prevent duplicate sends |
| 🆕 | Scheduled / Drip Notifications | Scheduler (BullMQ) | Retention campaigns |
| 🆕 | Deep Link Support in Notifications | Frontend | Direct to relevant screen |

### Frontend

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| 🆕 | Notification Bell with Unread Count | WebSocket / API | Core UX |
| 🆕 | Notification List / History Screen | API | Review past alerts |
| 🆕 | Notification Settings Screen (granular) | API | User control |
| 🆕 | Push Permission Prompt (iOS / Android) | Native SDK | Required for push |
| 🆕 | In-App Toast / Banner Notifications | Socket + UI | Real-time feedback |

---

## 💰 7. Subscription & Monetization

### 7.1 Plans & Feature Access

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| ✅ | Plan System (Free / Premium / Gold) | DB | Monetization tiers |
| ✅ | Feature Access Control (RBAC) | Plans | Paywall enforcement |
| ✅ | Tier Upgrade / Downgrade Logic | Subscription DB | Plan management |
| 📂 | Upgrade Plan API (payment integration) | Payment Gateway | Revenue trigger |
| ✅ | Purchase History | DB | Transparency & support |
| 🆕 | Plan Expiry Reminders (T-7, T-3, T-1 days) | Scheduler + Notif | Reduce churn |
| 🆕 | Promotional Coupons / Discount Codes | Promo DB | Growth marketing |
| 🆕 | Auto-Renewal / Subscription Lifecycle | Payment Gateway | Recurring revenue |
| 🆕 | Free Trial System | Subscription | Conversion funnel |
| 🆕 | Coin / Credit System (micro-purchases) | Wallet DB | Granular monetization |

### 7.2 Payments

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| ✅ | Razorpay / Stripe Integration | Payment Gateway | Revenue |
| ⚠️ | Payment Webhook Handling (verify signature) | Payment | Prevent fraud |
| ⚠️ | Refund System | Payment + Support | User trust |
| 🆕 | UPI Payment Support | Razorpay / Cashfree | India-first payment method |
| 🆕 | Invoice / Receipt Generation (PDF) | PDF Service | GST compliance |
| 🆕 | GST Calculation & Filing Data Export | Finance | Legal requirement India |
| 🆕 | Failed Payment Retry Logic | Queue + Payment | Revenue recovery |
| 🆕 | Payment Analytics Dashboard | Admin | Business intelligence |

### 7.3 Referral & Growth

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| ✅ | Referral Code Generation | User DB | Viral growth |
| ✅ | Referral Earnings / Wallet | Wallet DB | Incentive |
| 🆕 | Referral Campaign Tracking (UTM) | Analytics | Marketing ROI |
| 🆕 | Referral Leaderboard | Gamification | Virality boost |
| 🆕 | Family / Group Plans (matrimonial package) | Subscription | Market-specific feature |

---

## 🛠 8. Admin Panel & Moderation

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| ⚠️ | Admin Panel APIs (CRUD operations) | DB | Operations |
| 🆕 | Role-Based Admin Access (Super / Support / Finance) | RBAC | Internal security |
| 🆕 | User Management (search, ban, KYC approve) | Admin DB | Ops workflow |
| 🆕 | Content Moderation Queue (photos, chats) | AI + Admin | Safety |
| 🆕 | Bulk Communication Tool (email / push blast) | Notification + Admin | Marketing ops |
| 🆕 | Admin Audit Logs (who did what, when) | Activity Log | Compliance |
| 🆕 | Dashboard Metrics (DAU, MAU, revenue) | Analytics DB | Business decisions |
| 🆕 | Match Success Story Management | CMS | Social proof / PR |
| 🆕 | Support Ticket System / Helpdesk | Support Tool | Customer service |
| 🆕 | Fake Profile Detection Dashboard | ML + Admin | Quality control |

---

## 📊 9. Analytics & Tracking

### Backend

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| ✅ | Activity / Interaction Logs | DB | Audit & analytics source |
| 📂 | Profile Analytics (views, likes received) | Interaction DB | Engagement data |
| ⚠️ | Funnel Tracking (registration → match → chat) | Events | Conversion optimisation |
| ⚠️ | Admin Dashboard Metrics | DB + BI Tool | Business decisions |
| 🆕 | Event Tracking System (Mixpanel / Amplitude) | Events SDK | Granular user behaviour |
| 🆕 | Cohort Analysis (weekly / monthly retention) | Analytics | Growth decisions |
| 🆕 | A/B Testing Infrastructure | Feature Flags | Product optimisation |
| 🆕 | Match Success Rate Tracking | Analytics | Core KPI |
| 🆕 | Revenue Analytics (MRR, ARR, churn) | Finance + DB | Investor metrics |
| 🆕 | Profile Quality Score Tracking | ML + Analytics | Platform health metric |

### Frontend

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| 📂 | Profile Analytics UI (who viewed me, likes) | API | User engagement |
| ⚠️ | Insights / Stats Dashboard for user | Analytics API | Retention feature |
| 🆕 | Match Success Story Submission UI | API + CMS | Social proof |
| 🆕 | Account Activity Log UI | API | Trust & transparency |

---

## 🛡️ 10. Security

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| ✅ | Rate Limiting (per IP + per user) | Throttler | Prevent abuse |
| ✅ | Brute Force Protection (lockout) | Auth | Login security |
| ✅ | Input Sanitization & Validation | Pipes + Joi | Prevent injection |
| ✅ | Data Encryption at Rest (PII fields) | DB encryption | Compliance |
| ✅ | Audit Logs | Activity Log | Legal & security |
| ⚠️ | Internal API Key System | API Gateway | Service-to-service auth |
| 🆕 | HTTPS Enforced + HSTS | Infrastructure | Transport security |
| 🆕 | CORS Policy (strict origins) | NestJS config | Browser security |
| 🆕 | Helmet.js (security headers) | Middleware | OWASP hardening |
| 🆕 | OWASP Top 10 Checklist Review | Security audit | Enterprise requirement |
| 🆕 | Penetration Testing Schedule | External vendor | Pre-launch must |
| 🆕 | GDPR / PDPB Compliance Layer | Legal + Backend | Privacy law (India + EU) |
| 🆕 | Data Masking for Logs (PII scrubbing) | Logger middleware | Compliance |
| 🆕 | Vulnerability Scanning (Snyk / Dependabot) | CI/CD | Dependency security |

---

## 📜 11. Logging & Monitoring

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| ✅ | Central Logger (Winston) | None | Structured logging |
| ✅ | Request Tracing (Correlation ID) | Logger | Distributed tracing |
| ✅ | Error Monitoring (Sentry) | Logger | Crash tracking |
| ✅ | Log Storage (ELK / CloudWatch) | Logger | Production visibility |
| 🆕 | APM (Datadog / New Relic) | Infrastructure | Performance monitoring |
| 🆕 | Uptime Monitoring (Pingdom / UptimeRobot) | Infrastructure | SLA tracking |
| 🆕 | Alerting Rules (PagerDuty / OpsGenie) | Monitoring | On-call escalation |
| 🆕 | Custom Metrics (match rate, chat latency) | APM + Prometheus | Product KPIs in monitoring |
| 🆕 | Database Query Performance Monitoring | DB + APM | Slow query detection |
| 🆕 | Socket.io Connection Metrics | Custom | Chat system health |

---

## ⚙️ 12. Performance & Scaling

### Backend

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| ✅ | Redis Caching (profiles, sessions, feeds) | Redis | Speed |
| ✅ | CDN for Media (CloudFront / Cloudflare) | Storage | Faster loading |
| ✅ | DB Index Optimization (MongoDB) | Mongo | Query performance |
| ⚠️ | Queue System (BullMQ + Redis) | Redis | Background job processing |
| 🆕 | Database Read Replica / Sharding Strategy | MongoDB Atlas | Scale for 1M+ users |
| 🆕 | Connection Pooling | DB driver config | Resource efficiency |
| 🆕 | Cursor-based Pagination | API design | Large dataset performance |
| 🆕 | Response Compression (gzip / brotli) | Middleware | Reduced bandwidth |
| 🆕 | Horizontal Scaling Strategy (stateless pods) | Kubernetes | High availability |
| 🆕 | Load Testing (k6 / Artillery) | CI/CD | Validate scale targets |

### Frontend

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| ⚠️ | Lazy Loading (routes, images) | UI framework | Initial load performance |
| ⚠️ | Image Optimization (WebP, srcset) | CDN | Bandwidth saving |
| 🆕 | Code Splitting per Route | Webpack / Vite | Faster first paint |
| 🆕 | Skeleton Loading Screens | UI | Perceived performance |
| 🆕 | Offline Mode / PWA Support | Service Worker | Low-network India users |
| 🆕 | Prefetching Match Profiles | React Query | Instant swipe feel |

---

## 📦 13. Background Jobs

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| ⚠️ | Email Queue (transactional + marketing) | BullMQ | Async, reliable delivery |
| ⚠️ | Notification Queue (push / SMS / WA) | BullMQ | Scalability |
| ⚠️ | Match Recalculation Job (nightly) | Queue + Scheduler | Keep feeds fresh |
| 🆕 | Profile Expiry / Archival Job | Scheduler | Inactive profile management |
| 🆕 | Subscription Expiry Cron Job | Scheduler | Auto-downgrade + alerts |
| 🆕 | OTP Cleanup Job (expired OTPs) | Scheduler | DB hygiene |
| 🆕 | Analytics Aggregation Job | Scheduler | Pre-compute dashboard data |
| 🆕 | Media Cleanup Job (orphaned files) | Storage + Scheduler | Cost management |
| 🆕 | Fraud Detection Batch Scan | ML + Scheduler | Periodic fake profile sweep |

---

## 📱 14. Frontend Contract & API Standards

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| ✅ | API Versioning (`/api/v1/…`) | Backend | Breaking change safety |
| ✅ | Standardized API Response Envelope | Backend | Consistency |
| ✅ | Mobile vs Web Token Handling | Auth | Security differentiation |
| 🆕 | OpenAPI / Swagger Docs Auto-generated | NestJS decorators | FE dev speed |
| 🆕 | API Error Code Registry (`MATCH_001` etc.) | Backend | FE can map user-friendly messages |
| 🆕 | Cursor + Offset Pagination Standard | API design | Consistent FE handling |
| 🆕 | SDK / API Client Auto-generation (OpenAPI → TS) | Tooling | Eliminate manual API types |
| 🆕 | Storybook Component Library | Frontend | Design system & FE speed |
| 🆕 | Internationalization / i18n (hi, ta, te, bn…) | Frontend + Backend | Pan-India regional expansion |

---

## 🏗️ 15. DevOps & Infrastructure

| Status | Task | Dependency | Why |
|--------|------|------------|-----|
| 🆕 | Docker Containerization (all services) | Docker | Consistent environments |
| 🆕 | Kubernetes Deployment (EKS / GKE) | Docker + K8s | Production orchestration |
| 🆕 | CI/CD Pipeline (GitHub Actions) | Repo | Automated test + deploy |
| 🆕 | Infrastructure as Code (Terraform) | Cloud | Reproducible infra |
| 🆕 | Blue-Green / Canary Deployments | K8s + CI/CD | Zero-downtime releases |
| 🆕 | Database Migration Strategy (versioned) | Mongo Migrate | Safe schema changes |
| 🆕 | Disaster Recovery Plan + RTO/RPO Targets | Infra | Business continuity |
| 🆕 | Multi-region Failover (AWS Mumbai + secondary) | AWS | 99.9% SLA |
| 🆕 | Automated Backup Verification | DB + S3 | Backup is only good if it restores |

---

## 🧠 Recommended Build Order

```
Phase 1  →  Auth + Session
Phase 2  →  Profile + Media
Phase 3  →  Discovery + Interaction
Phase 4  →  Match Logic
Phase 5  →  Chat System
Phase 6  →  Notifications
Phase 7  →  Subscription & Payments
Phase 8  →  Security & Compliance
Phase 9  →  Logging & Monitoring
Phase 10 →  Scale + Analytics + Admin Panel
```

---