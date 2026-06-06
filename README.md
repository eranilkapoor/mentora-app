<div align="center">

<img src="https://img.shields.io/badge/MatchMate-Matrimonial%20Platform-blue?style=for-the-badge&logo=heart&logoColor=white" alt="MatchMate" />

# MatchMate

### Enterprise-Grade AI-Powered Matrimonial Platform — India First

**Modern matchmaking for Gen Z · Trusted by families · Built for scale**

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-7.x-DC382D?logo=redis&logoColor=white)](https://redis.io)
[![React Native](https://img.shields.io/badge/React%20Native-Expo-0EA5E9?logo=expo&logoColor=white)](https://expo.dev)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)
[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=github-actions&logoColor=white)](https://github.com/features/actions)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Market Positioning](#-market-positioning)
- [Feature Highlights](#-feature-highlights)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [API Documentation](#-api-documentation)
  - [Response Format](#response-format)
  - [Error Codes](#error-codes)
  - [Key Endpoints](#key-endpoints)
- [Module Overview](#-module-overview)
  - [Auth Module](#auth-module)
  - [User & Profile Module](#user--profile-module)
  - [Match Module](#match-module)
  - [Chat Module](#chat-module)
  - [Notification Module](#notification-module)
  - [Payment & Subscription Module](#payment--subscription-module)
  - [Admin Module](#admin-module)
- [Database Design](#-database-design)
- [Security](#-security)
- [Frontend](#-frontend)
- [Testing](#-testing)
- [CI/CD & Deployment](#-cicd--deployment)
- [Microservices Migration Path](#-microservices-migration-path)
- [Development Roadmap](#-development-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

MatchMate is a full-stack, enterprise-grade matrimonial platform built for the Indian market. It combines the trust-first approach of traditional matrimonial services with the modern UX of apps like Tinder — powered by AI matchmaking, real-time chat, KYC verification, and a robust subscription system.

> **Architecture Strategy:** Start as a **modular monolith** (NestJS) for fast MVP delivery, with clean domain boundaries that allow seamless extraction into **microservices** as the platform scales — without rewriting any business logic.

```
Phase 1 → Modular Monolith    (MVP → ~100K users)
Phase 2 → Split Services      (100K → 1M users)
Phase 3 → Full Microservices  (1M+ users)
```

---

## 🎯 Market Positioning

| Platform | Focus | Gap |
|---|---|---|
| Jeevansathi | Traditional matrimony | Outdated UX |
| Shaadi.com | Serious matchmaking + family | No AI personalization |
| Tinder | Fast modern dating | Not serious / family-oriented |
| **MatchMate** | **AI-powered matrimony for Gen Z + families** | ✅ Fills all gaps |

---

## ✨ Feature Highlights

| Category | Features |
|---|---|
| 🔐 **Auth** | Email, Phone OTP, Google / Facebook / Apple OAuth, JWT + Refresh Tokens, Aadhaar eKYC, Device Session Management |
| 👤 **Profiles** | Multi-step onboarding, Photos + Video Intro, Horoscope/Kundli, KYC Verification, AI Profile Scoring, PDF Biodata |
| ❤️ **Matching** | ML Recommendations, Compatibility Score + Explanation, Swipe Cards, Filters, Interest/Accept Flow |
| 💬 **Chat** | Real-time Socket.io Messaging, Read Receipts, Typing Indicators, Media Sharing, Audio/Video Calling |
| 🔔 **Notifications** | FCM Push, WhatsApp (Meta WABA), SMS (MSG91/Twilio), In-app Alerts, Drip Campaigns |
| 💰 **Monetization** | Tiered Plans (Free / Gold / Platinum / VIP), Razorpay + UPI, Boosts, Coin Wallet, Referral System |
| 🛡️ **Safety** | AI Nudity Detection, Fake Profile Detection, Block/Report, Harassment Filtering, PII Encryption |
| 📊 **Analytics** | Funnel Tracking, Cohort Analysis, A/B Testing, Match Success Metrics, KPI Dashboards |
| ⚙️ **Admin** | Role-based Panel, KYC Queue, Content Moderation, CRM, Audit Logs, Revenue Dashboard |

---

## 🛠 Tech Stack

### Backend

| Layer | Technology | Why |
|---|---|---|
| Framework | **NestJS** (Node.js + TypeScript) | Enforces modular architecture + DI; easy to split into microservices |
| Database | **MongoDB** + Mongoose | Schema-flexible, ideal for profiles and messages |
| Cache | **Redis** (ioredis) | OTPs, sessions, presence, rate limits, recommendation cache |
| Real-time | **Socket.io** | WebSocket gateway for chat and live notifications |
| Queue | **BullMQ** + Redis | Background jobs — emails, push, media processing |
| Auth | **JWT** + Passport.js + OAuth 2.0 | Access + refresh tokens, social login strategies |
| Storage | **AWS S3** + CloudFront CDN | Profile photos, videos, documents |
| Email | **SendGrid** | Transactional emails |
| SMS / OTP | **MSG91** / Twilio | Phone OTP, SMS notifications (India-first) |
| Payments | **Razorpay** | UPI, cards, net banking — India-first |
| Logging | **Winston** + ELK Stack | Structured JSON logs, searchable by Correlation ID |
| Monitoring | **Sentry** + Datadog | Error tracking + APM |

### Frontend

| Layer | Technology |
|---|---|
| Mobile | React Native (Expo + TypeScript) — iOS, Android, Web |
| Web | Next.js (App Router + TypeScript) |
| State | Redux Toolkit + React Query |
| UI | React Native Paper + Custom Design System |
| Real-time | Socket.io Client |
| Auth Storage | expo-secure-store (mobile) / HttpOnly Cookie (web) |

### Infrastructure

| Layer | Technology |
|---|---|
| Containers | Docker + Kubernetes (EKS — ap-south-1) |
| CI/CD | GitHub Actions |
| IaC | Terraform |
| CDN | CloudFront / Cloudflare |
| Secrets | AWS Secrets Manager |

---

## 🏗 Architecture

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
│          React Native App  ←→  Next.js Web App             │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS / WSS
┌──────────────────────────▼──────────────────────────────────┐
│                     API GATEWAY / NGINX                     │
│            Rate Limiting · SSL Termination · CORS           │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼────────────────────────────────┐
│                    NESTJS APPLICATION                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │   Auth   │ │ Profile  │ │ Matching │ │     Chat     │  │
│  │  Module  │ │  Module  │ │  Module  │ │    Module    │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ Payment  │ │  Notif.  │ │  Admin   │ │  Analytics   │  │
│  │  Module  │ │  Module  │ │  Module  │ │    Module    │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
└──────┬────────────┬──────────────┬────────────┬───────────┘
       │            │              │            │
┌──────▼───┐  ┌─────▼────┐  ┌─────▼────┐  ┌───▼──────────┐
│ MongoDB  │  │  Redis   │  │  AWS S3  │  │  BullMQ      │
│ (Primary │  │ (Cache + │  │  (Media  │  │  (Job Queue) │
│  Replica)│  │ Sessions)│  │   CDN)   │  │              │
└──────────┘  └──────────┘  └──────────┘  └──────────────┘
```

### Security Layers (Every Request)

```
┌─────────────────────────────────────────────────────────┐
│  1. Request Headers (Auth token, Correlation ID)        │
├─────────────────────────────────────────────────────────┤
│  2. Rate Limiting (Redis-backed, per IP + per user)     │
├─────────────────────────────────────────────────────────┤
│  3. Input Validation + Sanitization (class-validator)   │
├─────────────────────────────────────────────────────────┤
│  4. Authentication (JWT validation + blacklist check)   │
├─────────────────────────────────────────────────────────┤
│  5. Authorization (RBAC + subscription guard)           │
├─────────────────────────────────────────────────────────┤
│  6. Business Logic                                      │
├─────────────────────────────────────────────────────────┤
│  7. Response Filtering (strip sensitive fields)         │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
matchmate-app/
├── apps/
│   ├── api/                        # NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/           # JWT, OAuth, OTP, sessions, device tracking
│   │   │   │   ├── user/           # Profiles, photos, preferences, verification
│   │   │   │   ├── match/          # Recommendations, scoring, interest flow
│   │   │   │   ├── chat/           # Messages, Socket.io gateway, receipts
│   │   │   │   ├── notification/   # Push, email, SMS, WhatsApp, BullMQ workers
│   │   │   │   ├── payment/        # Subscription plans, Razorpay, wallet
│   │   │   │   ├── admin/          # Admin panel APIs, RBAC, KYC queue
│   │   │   │   └── analytics/      # Event tracking, funnels, metrics
│   │   │   ├── common/
│   │   │   │   ├── decorators/     # @CurrentUser, @Roles, @RateLimit
│   │   │   │   ├── filters/        # Global exception filters
│   │   │   │   ├── guards/         # JwtAuthGuard, RolesGuard, SubscriptionGuard
│   │   │   │   ├── interceptors/   # Logging, Transform, CorrelationId
│   │   │   │   ├── middleware/     # RateLimit, Helmet, Sanitization
│   │   │   │   └── pipes/          # ValidationPipe, SanitizationPipe
│   │   │   ├── infrastructure/
│   │   │   │   ├── database/       # Mongoose connection provider
│   │   │   │   ├── redis/          # Redis client provider
│   │   │   │   ├── events/         # EventBus abstraction (local → Kafka later)
│   │   │   │   └── jobs/           # BullMQ processors
│   │   │   ├── config/             # Env config factory + Joi validation
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   └── Dockerfile
│   │
│   ├── mobile/                     # React Native (Expo) App
│   │   └── src/
│   │       ├── screens/            # Auth, Home, Matches, Chat, Profile, Settings
│   │       ├── components/         # Button, Input, Avatar, Card, MatchCard
│   │       ├── navigation/         # AppNavigator (tabs), AuthNavigator (stack)
│   │       ├── store/              # Redux — authSlice, profileSlice
│   │       ├── hooks/              # useAuth, useSocket, useMatches, useProfile
│   │       ├── services/           # authService, matchService, profileService
│   │       └── api/                # httpClient (Axios + interceptors)
│   │
│   └── web/                        # Next.js Web App
│       └── src/
│           ├── app/                # App router pages
│           ├── components/
│           └── lib/
│
├── packages/
│   ├── shared-types/               # Shared TypeScript interfaces, DTOs, event payloads
│   ├── ui-kit/                     # Shared component library (RN + Next.js)
│   └── config/                     # Shared ESLint / TypeScript / Prettier config
│
├── infrastructure/
│   ├── terraform/                  # IaC — VPC, EKS, RDS, managed DBs
│   ├── k8s/                        # Kubernetes manifests + Helm charts
│   └── docker-compose.yml          # Local dev stack
│
├── .github/
│   └── workflows/
│       ├── ci.yml                  # Lint + test on every push / PR
│       ├── cd-staging.yml          # Deploy to staging on merge to main
│       └── cd-prod.yml             # Deploy to prod on release tag v*.*.*
│
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | >= 20.x | Use [nvm](https://github.com/nvm-sh/nvm) to manage versions |
| npm | >= 10.x | Or pnpm >= 9.x |
| Docker | >= 24.x | For local MongoDB + Redis |
| Docker Compose | >= 2.x | Included with Docker Desktop |
| NestJS CLI | Latest | `npm i -g @nestjs/cli` |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_ORG/matchmate-app.git
cd matchmate-app

# 2. Install all dependencies (monorepo)
npm install

# 3. Start local infrastructure (MongoDB + Redis)
docker-compose up -d mongo redis

# 4. Copy environment file and fill in your values
cp .env.example .env
```

### Environment Variables

<details>
<summary>📄 Click to expand full <code>.env.example</code></summary>

```env
# ── App ──────────────────────────────────────────────
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
CORS_ORIGINS=http://localhost:3001,http://localhost:3002

# ── MongoDB ──────────────────────────────────────────
MONGODB_URI=mongodb://localhost:27017/matrimonial_dev

# ── Redis ────────────────────────────────────────────
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ── JWT ──────────────────────────────────────────────
JWT_ACCESS_SECRET=your_access_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=30d

# ── OAuth ────────────────────────────────────────────
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
APPLE_CLIENT_ID=
APPLE_TEAM_ID=
APPLE_KEY_ID=
APPLE_PRIVATE_KEY=

# ── OTP / SMS ────────────────────────────────────────
MSG91_AUTH_KEY=
MSG91_TEMPLATE_ID=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# ── Email ────────────────────────────────────────────
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
EMAIL_FROM=no-reply@matchmate.app

# ── AWS S3 ───────────────────────────────────────────
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=matchmate-media
AWS_CLOUDFRONT_DOMAIN=

# ── Payments (Razorpay) ──────────────────────────────
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# ── WhatsApp (Meta WABA) ─────────────────────────────
META_WABA_TOKEN=
META_WABA_PHONE_ID=

# ── Firebase (Push Notifications) ───────────────────
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# ── Monitoring ───────────────────────────────────────
SENTRY_DSN=
DATADOG_API_KEY=

# ── KYC ──────────────────────────────────────────────
DIGILOCKER_CLIENT_ID=
DIGILOCKER_CLIENT_SECRET=
```

</details>

### Running Locally

```bash
# Development with hot reload
npm run start:dev

# Or with full Docker stack (API + MongoDB + Redis + Mongo Express)
docker-compose up --build
```

**Service URLs after startup:**

| Service | URL |
|---|---|
| API | http://localhost:3000 |
| Swagger / API Docs | http://localhost:3000/api/docs |
| Mongo Express (GUI) | http://localhost:8081 |
| BullMQ Dashboard | http://localhost:3000/queues |
| React Native (Metro) | http://localhost:8081 |
| Next.js Web | http://localhost:3001 |

```bash
# Run mobile app
cd apps/mobile
npx expo start

# Run web app
cd apps/web
npm run dev

# Run tests
npm test

# Run with coverage
npm run test:cov

# Lint
npm run lint
```

---

## 📖 API Documentation

Full Swagger / OpenAPI 3.0 documentation is auto-generated from NestJS decorators.

- **Local:** http://localhost:3000/api/docs
- **Staging:** https://api-staging.matchmate.app/api/docs

### Response Format

All endpoints return a standard envelope:

```json
// Success
{
  "success": true,
  "data": { },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 450,
    "correlationId": "uuid-v4"
  }
}

// Error
{
  "success": false,
  "data": null,
  "error": {
    "code": "AUTH_001",
    "message": "Invalid OTP. Please try again.",
    "statusCode": 400
  }
}
```

### Error Codes

| Code | HTTP | Description |
|---|---|---|
| `AUTH_001` | 400 | Invalid or expired OTP |
| `AUTH_002` | 401 | Access token missing or invalid |
| `AUTH_003` | 401 | Refresh token expired — re-login required |
| `AUTH_004` | 429 | Too many login attempts — account temporarily locked |
| `PROFILE_001` | 404 | Profile not found |
| `MATCH_001` | 403 | Cannot interact — user is blocked |
| `PAYMENT_001` | 402 | Subscription required for this feature |
| `PAYMENT_002` | 400 | Payment verification failed |
| `VALIDATION_001` | 422 | Request body failed validation |
| `SERVER_001` | 500 | Internal server error |

### Key Endpoints

```
POST   /api/v1/auth/register/email       Register with email + password
POST   /api/v1/auth/register/phone       Register with phone — sends OTP
POST   /api/v1/auth/verify-otp           Verify phone OTP
POST   /api/v1/auth/login                Login (email or phone)
POST   /api/v1/auth/refresh              Refresh access token
POST   /api/v1/auth/logout               Logout current device
GET    /api/v1/auth/google               Initiate Google OAuth

GET    /api/v1/users/me                  Get own profile
PUT    /api/v1/users/me                  Update profile
POST   /api/v1/users/me/photos           Upload photos (S3 pre-signed)
PUT    /api/v1/users/me/preferences      Update match preferences
GET    /api/v1/users/:id                 View another user's profile

GET    /api/v1/matches/recommendations   Get recommended matches (paginated)
POST   /api/v1/interests                 Send interest
PUT    /api/v1/interests/:id/accept      Accept an interest
PUT    /api/v1/interests/:id/decline     Decline an interest
POST   /api/v1/users/:id/block           Block a user

GET    /api/v1/chat/rooms                List chat rooms
GET    /api/v1/chat/rooms/:id/messages   Get messages (cursor-based pagination)
PUT    /api/v1/chat/rooms/:id/read       Mark messages as read

GET    /api/v1/subscriptions/plans       List subscription plans
POST   /api/v1/subscriptions/create      Create Razorpay order
POST   /api/v1/subscriptions/verify      Verify payment + activate plan
POST   /api/v1/payments/webhook          Razorpay webhook (idempotent)
```

---

## 🧩 Module Overview

### Auth Module

Handles all identity and session management.

**Supported flows:**
- Email + password login / registration
- Phone OTP login / registration (MSG91 / Twilio)
- Google, Facebook, Apple OAuth (Passport.js strategies)
- Refresh token rotation with sliding window (30-day TTL)
- Multi-device session management — view and revoke active sessions
- Forgot password via email OTP

**JWT Strategy:**
- Access token: RS256 signed, 15-min TTL
- Refresh token: stored as hash in Redis with 30-day TTL
- On logout: refresh token deleted, access token blacklisted in Redis

---

### User & Profile Module

Manages all profile data, photos, preferences, and verification.

**Key features:**
- Multi-step onboarding wizard (7 steps, saves partial progress)
- Profile completion percentage with nudge notifications
- Photo upload to S3 with AI moderation (nudity detection)
- Video intro upload (Lambda transcoding pipeline)
- Horoscope / Kundli data — critical for Indian market
- Family details, education, career, religion, caste, community
- Partner preference management
- PDF biodata generation (printable for family sharing)
- Profile score with AI-generated improvement suggestions

---

### Match Module

Recommendation engine and interaction flow.

**Matching algorithm (in order of application):**
1. Hard filters — age, religion, caste, location, education
2. Weighted preference score adjustments
3. Activity score — recently active users ranked higher
4. Compatibility score — lifestyle, goals, behavioral patterns
5. Results cached in Redis sorted sets, refreshed on `profile.updated` events

**Interaction flow:**
```
User A sends interest → User B gets notified
User B accepts → Chat room created → Both notified
User B declines → Interest archived
Either user blocks → Bidirectional hide, no further interaction
```

---

### Chat Module

Real-time messaging via Socket.io WebSocket gateway with MongoDB persistence.

**Features:**
- End-to-end room-based messaging
- Message types: text, image, video, voice, GIF
- Read receipts and delivery status
- Typing indicators (Redis TTL-based, 5-sec expiry)
- Online presence tracking (Redis, 30-sec heartbeat)
- Cursor-based pagination for message history
- Soft delete for messages
- Phone number extraction blocking (safety feature)

**WebSocket Events:**

| Client → Server | Server → Client |
|---|---|
| `send_message` | `new_message` |
| `typing` | `user_typing` |
| `mark_read` | `message_read` |
| `join_room` | `user_online` |

---

### Notification Module

Multi-channel notification delivery via BullMQ queues.

| Event | Channels |
|---|---|
| `user.registered` | Email, SMS |
| `interest.sent` | Push, In-app |
| `interest.accepted` | Push, WhatsApp |
| `message.received` (offline) | Push |
| `subscription.expiring` | Email, Push |
| `payment.succeeded` | Email, WhatsApp |
| `new.match` | Push, Email |
| `profile.incomplete` | Push (drip campaign) |

---

### Payment & Subscription Module

**Plans:**

| Plan | Price | Key Features |
|---|---|---|
| Free | ₹0 | Basic search, 5 interests/month, view photos |
| Gold | ₹799/month | Unlimited interests, see who viewed you, read receipts, advanced filters |
| Platinum | ₹1,499/month | Gold + weekly profile boost, AI match assistant, priority support |
| VIP | ₹2,999/month | Platinum + personal relationship manager, spotlight, unlimited boosts |

**Payment flow:**
```
1. POST /subscriptions/create  →  Razorpay order created, order_id returned
2. Client completes payment on Razorpay checkout
3. POST /subscriptions/verify  →  Signature verified, subscription activated
4. POST /payments/webhook      →  Idempotent webhook for async confirmation
```

---

### Admin Module

Role-based admin panel for operations and moderation.

**Roles:** `super-admin`, `moderator`, `support`

**Features:**
- User search, view, suspend, unsuspend, hard delete
- KYC approval queue — review ID documents and selfies
- Content moderation queue — reported profiles and photos
- Subscription and payment management, manual refunds
- Audit logs — every admin action timestamped with actor
- Analytics dashboard — DAU, MAU, conversions, revenue, retention

---

## 🗄 Database Design

### Golden Rules

> **One module = one data owner.**
> No cross-module writes. No `$lookup` across module boundaries.
> Share data via IDs and domain events only.

### Collection Ownership

| Module | Collections | DB (Microservices Phase) |
|---|---|---|
| Auth | `auth_users`, `refresh_tokens` | `auth_db` |
| User/Profile | `profiles`, `photos` | `profile_db` |
| Match | `match_scores`, `interests` | `match_db` |
| Chat | `chat_rooms`, `messages` | `chat_db` (sharded) |
| Notification | `notification_logs` | `notification_db` |
| Payment | `subscriptions`, `transactions` | `payment_db` (Postgres) |
| Admin | `admin_users`, `audit_logs` | `admin_db` |

### Repository Pattern

All database access is wrapped in repository classes. Services never touch Mongoose models directly. This is the key abstraction that enables seamless migration to microservices.

```typescript
// BEFORE (monolith) — ProfileRepository queries MongoDB
async findByUserId(userId: string) {
  return this.profileModel.findOne({ userId }).lean();
}

// AFTER (microservice) — only this file changes
async findByUserId(userId: string) {
  const response = await this.httpService
    .get(`http://profile-service/api/v1/profiles/${userId}`)
    .toPromise();
  return response.data.data;
}
// Business logic in ProfileService does NOT change at all.
```

### Redis Key Patterns

| Pattern | TTL | Usage |
|---|---|---|
| `auth:otp:{phone}` | 5 min | OTP verification |
| `auth:session:{userId}` | 15 min | Access token blacklist |
| `auth:refresh:{userId}` | 30 days | Refresh token store |
| `match:cache:{userId}` | 1 hour | Cached recommendations |
| `chat:presence:{userId}` | 30 sec | Online status |
| `chat:typing:{roomId}` | 5 sec | Typing indicator |
| `rl:{ip}:{endpoint}` | 1 min | Rate limit counters |

---

## 🔐 Security

### Rate Limiting

| Endpoint | Limit | Window |
|---|---|---|
| `POST /auth/login` | 5 requests | 15 min |
| `POST /auth/register/phone` | 3 requests | 1 hour |
| `POST /auth/verify-otp` | 5 attempts | 5 min |
| `POST /payments/*` | 10 requests | 1 min |
| Authenticated (global) | 300 requests | 1 min |
| Anonymous (global) | 60 requests | 1 min |

### Security Checklist (Enforced in CI)

- [x] JWT access tokens signed RS256, 15-min TTL
- [x] Passwords hashed with bcrypt (cost factor ≥ 12)
- [x] Secrets in AWS Secrets Manager — never in code
- [x] Helmet.js security headers on all responses
- [x] CORS restricted to known origins only
- [x] Idempotency keys on all payment and webhook endpoints
- [x] PII fields (phone, email) encrypted at rest with AES-256
- [x] WAF + DDoS protection via Cloudflare in front of API Gateway
- [x] GDPR / PDPB compliance — right to erasure, data portability, consent tracking
- [x] AI nudity detection on all photo uploads (AWS Rekognition)
- [x] Phone number extraction blocking in chat messages
- [x] `npm audit` run in CI — critical vulnerabilities block merge
- [x] `truffleHog` secret scan in CI — no secrets committed

### Frontend Security

- JWT stored in `expo-secure-store` (mobile) — **never** in AsyncStorage or localStorage
- All API calls over HTTPS only
- Correlation ID (UUIDv4) attached to every request for end-to-end traceability

---

## 📱 Frontend

### React Native (Expo) Setup

```bash
npm install -g expo-cli
npx create-expo-app match-mate-mobile --template expo-template-blank-typescript
cd match-mate-mobile
npm install @react-navigation/native @react-navigation/native-stack \
  @react-navigation/bottom-tabs react-native-safe-area-context \
  react-native-screens @reduxjs/toolkit react-redux axios \
  @tanstack/react-query socket.io-client expo-secure-store \
  react-native-paper
```

### Navigation Structure

```
RootNavigator
├── AuthNavigator (Stack) — unauthenticated
│   ├── LoginScreen
│   ├── RegisterScreen
│   └── OtpVerificationScreen
│
└── AppNavigator (Bottom Tabs) — authenticated
    ├── Home → HomeScreen (discovery swipe cards)
    ├── Matches → MatchListScreen → MatchDetailScreen
    ├── Chat → ChatListScreen → ConversationScreen
    ├── Profile → ViewProfileScreen → EditProfileScreen
    └── Settings → SettingsScreen → SubscriptionScreen
```

### State Management

| State Type | Tool | Examples |
|---|---|---|
| Global Auth | Redux Toolkit | JWT token, userId, isAuthenticated |
| Global Profile | Redux Toolkit | Own profile, subscription status |
| Server State | React Query | Match list, messages, search results |
| UI State | useState / useReducer | Modals, loading, form values |
| Real-time | Socket.io + Redux | Presence, incoming messages, typing |

---

## 🧪 Testing

### Test Strategy

| Level | Tool | Coverage Target | When |
|---|---|---|---|
| Unit Tests | Jest | 80%+ per module | Every commit |
| Integration Tests | Jest + Supertest | All API endpoints | Every PR |
| Contract Tests | Pact | Inter-service APIs | Pre service extraction |
| E2E Mobile | Detox | Critical flows | Pre-release |
| E2E Web | Cypress | Critical flows | Pre-release |
| Load Tests | k6 | Match / Chat / Search | Weekly + pre-launch |

```bash
# Unit tests
npm test

# With coverage
npm run test:cov

# Watch mode
npm run test:watch

# E2E
npm run test:e2e

# Load test (requires k6)
k6 run tests/load/match-recommendations.js
```

### Load Test Targets

- Match recommendations: p95 < 500ms at 1,000 concurrent users
- Chat message delivery: p99 < 200ms
- Profile search: p95 < 800ms at 500 concurrent users

---

## 🚢 CI/CD & Deployment

### Pipeline

```
Push / PR  →  Lint  →  Unit Tests  →  Build  →  Docker Image
                                                      │
Merge to main  →  Deploy Staging  →  Smoke Tests  →  Slack Notification
                                                      │
Git tag v*.*.*  →  Canary Deploy (5%)  →  Full Rollout  →  Slack Notification
```

### Docker

```bash
# Build image
docker build -t matchmate-api ./apps/api

# Run container
docker run -p 3000:3000 --env-file .env matchmate-api

# Full local stack
docker-compose up --build
```

### Kubernetes

```bash
# Apply manifests
kubectl apply -f infrastructure/k8s/

# Check rollout
kubectl rollout status deployment/matchmate-api

# Scale manually
kubectl scale deployment matchmate-api --replicas=5
```

### Production Deploy

Triggered automatically on Git release tag:

```bash
git tag v1.0.0
git push origin v1.0.0
# GitHub Actions picks this up → canary → full rollout
```

---

## 🔄 Microservices Migration Path

The monolith is designed so any module can be extracted with minimal effort. No business logic changes — only the repository implementation and event bus swap.

### When to Migrate

Trigger migration when you observe:
- One module consuming > 60% of server resources
- Deployments in one module breaking unrelated modules
- Team size requiring independent ownership of domains
- User base reaching 500K+

### Extraction Order

| Phase | Services | Reason |
|---|---|---|
| 2A | Auth Service | High security sensitivity, stateless, clear boundaries |
| 2B | Chat Service | Most CPU/memory intensive — WebSocket stateful |
| 2C | Notification Service | Pure async, event-driven — easiest to extract |
| 2D | Matchmaking Service | Isolated algorithm, benefits from independent scaling |
| 3 | Search (ElasticSearch) | Separate indexing infrastructure |
| 3 | Media Service | Separate processing pipeline (Lambda) |
| 3 | Payment Service | PCI compliance isolation |

### How to Extract a Module (8 Steps)

1. Move the module folder to a new NestJS project
2. Create a dedicated MongoDB database — copy the module's schemas
3. Replace `Repository` Mongoose calls with HTTP/gRPC calls to the new service
4. Replace local `EventBus.emit()` with Kafka producer; `EventBus.on()` with Kafka consumer
5. Add the new service to `docker-compose.yml` and K8s manifests
6. Update API Gateway routing to direct relevant paths to the new service
7. Run Pact contract tests to verify integrations hold
8. Deploy to staging → smoke tests → canary to production

### Future Microservices Architecture

```
                     ┌─────────────────────┐
                     │    API Gateway       │
                     │  (Kong / AWS APIGW)  │
                     └──────────┬──────────┘
                                │
        ┌───────────────────────┼────────────────────────┐
        │                       │                        │
┌───────▼───┐          ┌────────▼────┐          ┌───────▼────────┐
│   Auth    │          │   Profile   │          │  Matchmaking   │
│  Service  │          │   Service   │          │    Service     │
└───────────┘          └─────────────┘          └────────────────┘
        │                                                │
┌───────▼───┐          ┌─────────────┐          ┌───────▼────────┐
│   Chat    │          │ Notification│          │    Payment     │
│  Service  │          │   Service   │          │    Service     │
└───────────┘          └─────────────┘          └────────────────┘
                                │
                     ┌──────────▼──────────┐
                     │   Kafka Event Bus   │
                     └─────────────────────┘
```

---

## 🗺 Development Roadmap

### Phase 1 — MVP (Weeks 1–12)

| Week | Deliverable |
|---|---|
| 1–2 | Project scaffolding, CI/CD pipeline, Docker setup, Auth module (email + OTP) |
| 3–4 | User/Profile module — create, edit, photo upload (S3), profile schema |
| 5–6 | Match module — basic recommendations, send / accept / decline interest |
| 7–8 | Chat module — Socket.io gateway, messages, read receipts |
| 9–10 | Notification module — FCM push, email (SendGrid), BullMQ queues |
| 11–12 | Payment module — Razorpay integration, plan gating, subscription management |

### Phase 2 — AI & Verification (Weeks 13–24)

- [ ] AI matchmaking compatibility score + explanation
- [ ] Aadhaar eKYC via DigiLocker + selfie verification (AWS Rekognition)
- [ ] Apple + Facebook OAuth
- [ ] Admin panel v1 — user moderation, KYC queue, content moderation
- [ ] ElasticSearch integration for advanced search
- [ ] WhatsApp notifications via Meta WABA
- [ ] Mixpanel / Amplitude event tracking

### Phase 3 — Scale & Microservices (Weeks 25+)

- [ ] Extract Auth and Chat as independent microservices
- [ ] Kafka event bus replacing local EventBus
- [ ] Video calling (WebRTC / Twilio Video)
- [ ] AI-powered icebreaker and conversation starter suggestions
- [ ] Full Kubernetes autoscaling with custom metrics
- [ ] A/B testing framework for product experiments
- [ ] Regional language support (Hindi, Tamil, Telugu, Bengali)

---

## 🤝 Contributing

### Branch Strategy

```
main          → production
develop       → staging integration branch
feature/*     → new features
fix/*         → bug fixes
chore/*       → maintenance, deps, config
```

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add Google OAuth strategy
fix: resolve OTP expiry race condition
chore: update mongoose to 8.x
breaking: rename /matches to /recommendations
```

### Pull Request Checklist

- [ ] Tests written and passing (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] New endpoints documented with Swagger decorators
- [ ] New env vars added to `.env.example`
- [ ] Security checklist reviewed (no secrets, validation added, rate limit configured)
- [ ] At least one PR review approval before merge

### Coding Standards

- TypeScript strict mode — no `any` types without explicit justification
- ESLint + Prettier enforced via Husky pre-commit hooks
- All database access through repository classes — never direct model queries in services
- Cross-module communication via `EventBus` only — no direct service-to-service imports
- Every new feature paired with unit tests (target 80%+ coverage per module)

---

## 📜 License

This project is proprietary and confidential. All rights reserved.

© 2026 MatchMate. Unauthorized copying, distribution, or use of this software, via any medium, is strictly prohibited.

---

<div align="center">

Built with ❤️ for India &nbsp;|&nbsp; NestJS · MongoDB · Redis · React Native · AWS

</div>