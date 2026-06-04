
## 🧱 Example NestJS Module Structure

```
src/
│
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── schemas/user.schema.ts
│   │
│   ├── profile/
│   │   ├── profile.controller.ts
│   │   ├── profile.service.ts
│   │   ├── profile.module.ts
│   │   ├── schemas/profile.schema.ts
│   │
│   ├── matchmaking/
│   │   ├── matchmaking.controller.ts
│   │   ├── matchmaking.service.ts
│   │   ├── matchmaking.module.ts
│   │
│   └── chat/
│       ├── chat.gateway.ts
│       ├── chat.module.ts
│       ├── chat.service.ts
│
├── common/
│   ├── guards/
│   ├── interceptors/
│   ├── decorators/
│
├── main.ts
└── app.module.ts
```

---

# Microservices architecture — high level overview

Design goals:

* **Single Responsibility per service** (clear data ownership)
* **Independent deployability & scaling**
* **Polyglot-friendly** (but stick to a primary stack to start)
* **Event-driven integration** for eventual consistency
* **Secure, observable, and testable**

Core approach:

* Use **API Gateway** for external requests (auth, rate-limit, routing).
* Use **synchronous RPC (gRPC/HTTP REST)** for simple short-lived calls, and **event bus (Kafka/RabbitMQ)** for state-change events.
* Each service owns its own database (Database-per-service).
* Use **Redis** per environment for caching, sessions, OTPs, presence.
* Use **Kubernetes** for orchestration, Docker for containers.
* Implement **CI/CD pipelines**, IaC (Terraform), monitoring (Prometheus/Grafana), logging (ELK).

---

# Recommended Microservice List (with responsibilities)

1. **API Gateway / Edge**
  * Route /auth /users /matches /chat etc to backing services.
  * Enforce TLS, rate-limits, auth token verification, request logging.
  * Tech: **Kong / Traefik / AWS API Gateway**.

2. **Auth Service (central auth & identity)**
  * Handles login, token (access + refresh), OAuth callbacks, 2FA, token revocation/blacklist.
  * Stores users' auth records (password hash, social ids, refresh tokens metadata).
  * Issues JWTs; validates tokens; exposes userinfo.
  * Tech: **NestJS**, **Passport strategies**, **Mongoose** for auth-store, **Redis** for refresh-token blacklist/OTP.

3. **User/Profile Service**
  * Full user profiles, photos metadata, preferences, verification status.
  * CRUD for profiles and profile search indexes (light).
  * Responsible for profile-level validation and privacy settings.
  * Tech: **NestJS**, **MongoDB (Mongoose)**.

4. **Matchmaking Service**
  * Responsible for matching algorithm, scoring, ranking.
  * Produces recommended lists; stores match scores; caches result sets.
  * Subscribes to profile-update events to refresh scores.
  * Tech: **Node/Python microservice** (NestJS for API, Python for ML if needed), **MongoDB / ElasticSearch** (for fast queries), **Redis** for cache.

5. **Search Service**
  * Full-text and faceted search with complex filters (location, caste, education, age).
  * Indexes data from Profile Service into **ElasticSearch / OpenSearch**.
  * Offers search API for web/mobile and matchmaking queries.

6. **Chat Service**
  * Real-time messaging (WebSocket / Socket.io / native ws), message persistence.
  * Handles presence, typing indicators, delivery receipts.
  * Stores messages in DB (Mongo) and caches recent messages in Redis.
  * Tech: **NestJS Gateway** or a dedicated service using **Socket.io** or **NATS + WebSocket proxy**.

7. **Interest / Request Service**
  * Manages sending/accepting/rejecting interests, request statuses, blocks.
  * Emits events (interest.sent, interest.accepted) for notifications and matchmaking.

8. **Notification Service**
  * Sends push notifications (FCM/APNs), emails (SendGrid) and SMS (Twilio).
  * Receives events (user.registered, interest.sent, message.received, plan.expired).
  * Manages templates, throttling, and resend policies.

9. **Payments & Subscription Service**
  * Handle plans, subscriptions, invoices, payment verification webhooks (Stripe/Razorpay).
  * Manage trial periods, renewals, cancellations.
  * Tech: secure vaulting for payment references (no card storage).

10. **Admin Service**
  * Admin portal APIs: user moderation, reports, content moderation workflows.
  * Audit logs and privilege checks.

11. **Reports / Fraud & Moderation Service**
  * Processes reports, runs fraud detection (behavioral patterns), ML-based anomaly detection.
  * Integrates with Admin Service for workflow.

12. **Media Service**
  * Handles upload, processing (thumbs, validation), scanning (malicious content), CDN pre-signed URL generation.
  * Uses S3, Lambda for processing, and virus/sexually-explicit content detection if required.

13. **Analytics / Events Service**
  * Collects events (Kafka) for analytics, KPI dashboards (Mixpanel/Amplitude).
  * Exposes aggregated metrics to product/marketing.

14. **Gateway Auth / Token Introspection** (optional)
  * Lightweight service or middleware to introspect tokens if central token validation required.

---

# Data ownership & DB-per-service

* Each service **owns** its data and DB schema. Only that service reads/writes its DB.
* Recommended DBs:

  * **MongoDB** for Profile, Chat (document model fits profiles/messages).
  * **ElasticSearch/OpenSearch** for Search.
  * **Postgres** (optional) for Payments, Audit (relational fits).
  * **Redis** for cache, OTP, sessions, presence.
  * **Kafka/RabbitMQ** for event streaming.

Example ownership:

* Profile Service → profiles collection (MongoDB)
* Auth Service → auth_users collection (MongoDB) (only minimal auth fields)
* Chat Service → messages collection (sharded MongoDB) and message metadata
* Payment Service → payments (Postgres)
* Matchmaking → match_scores (Mongo / Redis)

> Note: Do **not** let multiple services write to the same DB for ownership reasons.

---

# Communication patterns

1. **Synchronous (request/response)** — REST or gRPC for:
  * Client → API Gateway → Service
  * Service A → Service B for low-latency calls (userinfo, token validation)
  * Prefer **gRPC** for internal high-perf calls (binary + contract + health).

2. **Asynchronous (event-driven)** — Event bus for eventual consistency:
  * Kafka/RabbitMQ pub/sub for events such as `user.created`, `profile.updated`, `interest.sent`, `payment.succeeded`.
  * Services subscribe to relevant topics and update local caches/indexes.

3. **Choreography vs Orchestration**:
  * Prefer **choreography** (services emit events) for most flows.
  * Use **orchestration** (Saga Orchestrator) for complex distributed transactions (e.g., payment + subscription activation + analytics).

---

# Distributed transactions & consistency

* Use **Saga pattern** for multi-step operations that touch multiple services (e.g., purchase subscription: payment → update subscription → notify).

  * Choreography-based sagas (each service listens and emits compensating events) are simpler.
  * Orchestration-based sagas use an orchestrator service for complex control.

* For strong consistency operations (rare), call authoritative service via gRPC and keep operations synchronous.

---

# Caching & data duplication

* Use Redis for caching hot results:
  * Match suggestions cache keyed per user
  * Search results cache
  * Session / refresh token blacklists
* Use read-replicas and indices for frequent reads.
* Accept controlled denormalization: some read-model copies of profile data in the Matchmaking or Search service to optimize queries.

---

# Security & auth

* Central **Auth Service** issues signed JWTs (RS256) with short TTL access tokens and longer refresh tokens.
* API Gateway validates tokens for public routes; services also validate tokens (defense in depth).
* Use **mTLS** between internal services or mutual-auth for high security.
* Secrets stored in **Vault** / AWS Secrets Manager / SSM Parameter Store.
* Rate-limit critical endpoints (OTP send, login).
* WAF in front of API Gateway for DDoS protection.
* RBAC for admin endpoints.

---

# Scalability & deployment

* Containerize each service; deploy on **Kubernetes (EKS/GKE/AKS)**.
* Use **Horizontal Pod Autoscaling** for CPU/Memory and custom metrics (queue length).
* Stateful sets for databases (or managed DBs like MongoDB Atlas).
* Use **Helm charts** for templated deployments.
* Use **Blue-Green** or **Canary** deployments for safe releases.

---

# Observability

* **Metrics**: Prometheus + Grafana (per-service metrics)
* **Logging**: Structured logs (JSON) shipped to ELK / OpenSearch (via Fluentd/Fluentbit)
* **Tracing**: Distributed tracing with **Jaeger / OpenTelemetry** (trace user request through services)
* **Alerting**: Alertmanager for metric thresholds and error rates

---

# Testing & QA

* Unit Tests for each service (Jest for Node/NestJS)
* Contract Testing (Pact) for inter-service API contracts
* Integration Tests (Spin local docker-compose or k8s test cluster)
* End-to-end tests for flows (Cypress or Detox for mobile)
* Load testing (k6, Gatling) for matchmaking/search/chat

---

# CI/CD & Infra

* Repo per service (or mono-repo with per-service pipelines)
* CI pipeline:
  * Lint → Unit Tests → Build → Docker Image → Push to Registry → Integration Tests → Deploy to staging → Canary → Prod
* Use GitHub Actions / GitLab CI / Jenkins
* IaC with Terraform (VPC, clusters, managed DBs)
* Policy as code (OPA/Gatekeeper) for security enforcement

---

# Example service tech stack (standardized)

* Language: **TypeScript**
* Framework: **NestJS** (modular pattern fits microservices)
* DB driver/ODM: **Mongoose** for MongoDB (or Prisma where SQL required)
* Message broker: **Kafka** (confluent) or **RabbitMQ** — choose Kafka for high-throughput event stream and durable storage.
* Cache: **Redis (ioredis)**
* Auth: **Passport** strategies within Auth Service
* Realtime: **Socket.io** for Chat (stateless gateway or sticky sessions via load balancer + Redis adapter)

---

# Sample service-to-service API overview (short)

Auth Service:

* `POST /auth/login` (email/password) → returns access & refresh tokens
* `POST /auth/verify-otp` (phone) → returns token
* `GET /auth/user/:id` (internal) → returns user auth info

Profile Service:

* `GET /profiles/:id`
* `PUT /profiles/:id`
* emits `profile.updated` to Kafka

Matchmaking Service:

* `GET /matches/recommendations?userId=xxx` (reads local cache or rebuilds scores)
* Subscribes to `profile.updated`, `interest.accepted`

Chat Service:

* Websocket connect `/ws?token=xxx`
* REST `GET /chat/rooms/:userId`

Notification Service:

* `POST /notifications/send` (internal usage) — consumed by other services via events

Payment Service:

* `POST /payments/create`
* webhook `/payments/webhook` (idempotent) → emits `payment.succeeded`

---

# Example DB Collections (per service) — high-level

**Profile Service (Mongo)**

* profiles: `{ _id, userId, name, dob, gender, photos[], education, profession, location, religion, caste, preferences, privacyFlags, createdAt }`

**Auth Service**

* auth_users: `{ _id, userId, email, phone, passwordHash, socialIds: { google, fb, apple }, createdAt }`
* refresh_tokens: `{ id, userId, tokenHash, expiresAt }` (optional in Redis)

**Chat Service**

* chat_rooms: `{ _id, participants[], lastMessage, lastUpdated }`
* messages: `{ _id, roomId, senderId, content, type, createdAt }`

**Matchmaking**

* match_scores: `{ userId, candidateId, score, lastComputed }`
* recommendation_cache: Redis sorted sets or hashes per user

**Payments**

* subscriptions (Postgres): `{ id, userId, planId, startAt, endAt, status, paymentRef }`

---

# Reliability & resilience patterns

* **Circuit breaker** (eg. opossum or Resilience4j equivalent) for external calls.
* **Retries with exponential backoff** for transient errors.
* **Bulkheads**: separate critical pools for chat vs. non-critical services.
* **Idempotency keys** for webhooks and payment calls.
* **Graceful shutdown** and draining in K8s.

---

# Governance, standards, and developer guidelines

* API standards: OpenAPI/Swagger for REST; protobuf for gRPC.
* Versioning policy: `/v1/`, `/v2/` paths + header-based versioning for breaking changes.
* Lint + Prettier + Commit lint + PR reviews.
* Use shared libraries for DTOs / interfaces if mono-repo; otherwise use contract testing.
* Security reviews and penetration testing before launch.

---

# Migration & rollout plan (how to start)

1. **MVP services**: Auth, Profile, Matchmaking (simple), Interest, Chat (basic), Notifications, Payments (basic).
2. Deploy on a small k8s cluster; use managed MongoDB and Kafka if possible.
3. Use API Gateway + single-sign-on JWT via Auth Service.
4. Iteratively extract admin, search, analytics services.
5. Monitor and tune.

---

# Cost / operational considerations

* Managed services (MongoDB Atlas, Confluent Cloud, AWS managed infra) cost more but drastically reduce ops overhead.
* Chat and matchmaking are high-throughput — anticipate scaling and choose autoscaling rules accordingly.

---

# Quick decision cheatsheet (what to build first)

* Use **NestJS + Mongoose** for services that use MongoDB (Auth, Profile, Chat).
* Use **Kafka** for event streaming (Matchmaking, Notifications, Analytics).
* Use **ElasticSearch** for Search service.
* Use **Redis** for OTP, cache, presence.
* Deploy on **Kubernetes**, CI/CD with GitHub Actions, IaC with Terraform.

---

Excellent question — and this is **exactly the right approach** 👏. Starting with a **modular monolith (standalone app)** and evolving later into **microservices** is a proven enterprise strategy. It gives you faster MVP delivery, lower DevOps overhead, and a smoother migration path once the system grows.

Let’s go step by step.

---

## 🧱 1. Architectural Goal

✅ **Phase 1:** Build as a **modular monolith** (standalone Node.js application)
✅ **Phase 2:** Seamlessly evolve to **microservices**, without rewriting core logic

We’ll design it so that each domain module (e.g., Auth, Profile, Matchmaking, Chat) behaves **like a separate service** already — isolated folders, independent data access layers, and clear boundaries.

---

## 🧩 2. Recommended Stack

| Layer                | Technology                                          | Reason                                                                                            |
| -------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Backend Framework    | **Nest.js**                                         | Enforces modular architecture, DI, and service separation. Easy to split later into microservices |
| Database             | **MongoDB** (via Mongoose ODM)                      | Scalable, schema-flexible, well-supported in Nest                                                 |
| Cache / Queues       | **Redis**                                           | For session store, caching, rate limiting, and pub/sub (chat, notifications)                      |
| Messaging (later)    | **NATS / Kafka / RabbitMQ**                         | Only needed once microservices are separated                                                      |
| Auth                 | **Passport.js / NextAuth / custom JWT with OAuth2** | Handles email/phone + Google, FB, Apple login                                                     |
| API Gateway (future) | **Nest Gateway or Kong / Nginx**                    | To route across services in microservice phase                                                    |

---

## 🧩 3. Modular Monolith Folder Structure

Here’s a boilerplate directory structure that supports future migration:

```
/src
 ├── main.ts                 # Nest.js bootstrap
 ├── app.module.ts           # Root module
 ├── common/                 # Shared utilities (interceptors, guards, pipes, constants)
 │    ├── filters/
 │    ├── interceptors/
 │    ├── utils/
 │    ├── decorators/
 │    └── constants/
 ├── config/                 # Config files (env, DB, Redis)
 ├── modules/
 │    ├── auth/              # Handles all login/register flows
 │    │    ├── auth.controller.ts
 │    │    ├── auth.service.ts
 │    │    ├── auth.module.ts
 │    │    ├── strategies/   # Passport strategies for Google, Apple, etc.
 │    │    └── schemas/
 │    ├── user/              # Profile management, photos, preferences
 │    ├── match/             # Matchmaking, recommendations
 │    ├── chat/              # Real-time chat (socket.io or gateway)
 │    ├── notification/      # Email/SMS/Push
 │    ├── admin/             # Admin portal APIs
 │    ├── payment/           # Subscription, wallet
 │    └── analytics/         # Reports, metrics
 ├── infrastructure/
 │    ├── database/          # Mongo + Redis setup
 │    ├── jobs/              # Background tasks (BullMQ)
 │    ├── events/            # Domain event bus (for future service separation)
 │    └── integrations/      # 3rd-party services (email, payment, etc.)
 └── tests/
```

---

## 🧠 4. Design Principles for Easy Migration

| Principle                        | Description                                                                                                 |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Domain isolation**             | Each module (Auth, Chat, etc.) has its own controller, service, repository, and schema.                     |
| **Repository pattern**           | Access to DB happens only through a repository class. Later, you can replace Mongo with a service endpoint. |
| **Event-based communication**    | Within the monolith, use a local event emitter. Later replace it with a message broker.                     |
| **DTOs (Data Transfer Objects)** | Explicitly define input/output contracts between modules — later these become API payloads.                 |
| **Service abstraction**          | Services talk to each other via interfaces, not direct imports. Makes remote calls easy later.              |

---

## 🚀 5. Example Migration Path

| Stage                            | Description                                                                                                      |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Stage 1 (Monolith)**           | All modules live in one Nest app. Communication via direct imports. Single MongoDB instance.                     |
| **Stage 2 (Split Services)**     | Extract modules like Chat, Auth, Match into separate Nest services. Use Redis Pub/Sub or NATS for communication. |
| **Stage 3 (Full Microservices)** | Deploy independently with Docker + Kubernetes. Add API Gateway, service discovery, centralized logging, etc.     |

---

## 🔧 6. Minimal Boilerplate (Simplified Example)

```ts
// src/modules/user/user.service.ts
@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async createProfile(dto: CreateUserDto) {
    return this.userRepo.create(dto);
  }

  async getMatches(userId: string) {
    // internally call match service (or event later)
    return this.matchService.findRecommendations(userId);
  }
}

// src/modules/match/match.service.ts
@Injectable()
export class MatchService {
  async findRecommendations(userId: string) {
    // query MongoDB or ML service
  }
}
```

Later, when split into microservices, you can replace:

```ts
this.matchService.findRecommendations(userId)
```

with:

```ts
await this.httpService.post('http://match-service/recommend', { userId });
```

No logic rewrite — just replace the injection binding.

---

## 📦 7. Deployment Flow (Later Phase)

1. **Dockerize** each module separately
2. **Use shared library** for DTOs and types (`@matrimony/common`)
3. **Introduce NATS or RabbitMQ** for inter-service messages
4. **Add API Gateway** to route all frontend traffic
5. **Add centralized auth & monitoring**

---

---

## 🧱 1. Current Phase: Modular Monolith Database Architecture

You’re using:

* **MongoDB** (Primary DB)
* **Redis** (Cache, Session, Queues)

So, in this phase:

* You’ll have **one logical MongoDB database**.
* But **collections (schemas)** should be **namespaced** and **owned by individual modules** — so they’re easy to separate later.

---

## 🧩 2. Key Design Goals for Migration Safety

| Goal                           | Description                                                                                                                             |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Data Ownership per Module**  | Each module (Auth, Profile, Chat, etc.) has its own schemas and repositories. No module directly queries another module’s data.         |
| **Repository Pattern**         | All DB queries happen inside repository classes. Later, those repositories can call APIs instead of DB queries.                         |
| **No Cross-Collection Joins**  | Avoid `$lookup` (Mongo joins) between modules. Use IDs and query by reference instead.                                                  |
| **Shared Schema Library**      | Define DTOs and Schemas in a shared package (`@matrimony/common`) so you can reuse them when split into microservices.                  |
| **Event-driven Communication** | Publish local domain events when data changes instead of cross-module writes (e.g., user created → emit event → match service updates). |

---

## 🧱 3. Folder & Layered Architecture

Example:

```
src/
 ├── modules/
 │   ├── auth/
 │   │   ├── auth.module.ts
 │   │   ├── auth.service.ts
 │   │   ├── repositories/
 │   │   │    ├── user.repository.ts
 │   │   └── schemas/
 │   │        ├── user.schema.ts
 │   │
 │   ├── profile/
 │   │   ├── profile.module.ts
 │   │   ├── profile.service.ts
 │   │   ├── repositories/
 │   │   │    ├── profile.repository.ts
 │   │   └── schemas/
 │   │        ├── profile.schema.ts
 │   │
 │   ├── match/
 │   │   ├── match.repository.ts
 │   │   ├── match.service.ts
 │   │   ├── schemas/
 │   │   │    ├── match.schema.ts
 │   │
 │   └── chat/
 │       ├── chat.repository.ts
 │       ├── chat.service.ts
 │       └── schemas/
 │            ├── chat.schema.ts
 │
 ├── infrastructure/
 │   ├── database/
 │   │   ├── mongoose.config.ts
 │   │   ├── redis.config.ts
 │   │   ├── db-connection.provider.ts
 │   ├── events/
 │   │   ├── event-emitter.ts
 │   │   └── handlers/
 │   └── ...
```

Each repository interacts with **only its schema**.

---

## 🧠 4. Example Repository Pattern (Mongoose + NestJS)

```ts
// src/modules/profile/repositories/profile.repository.ts
@Injectable()
export class ProfileRepository {
  constructor(
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
  ) {}

  async create(profileData: CreateProfileDto): Promise<Profile> {
    return this.profileModel.create(profileData);
  }

  async findByUserId(userId: string): Promise<Profile | null> {
    return this.profileModel.findOne({ userId });
  }

  async updatePreferences(userId: string, prefs: any) {
    return this.profileModel.updateOne({ userId }, { $set: { preferences: prefs } });
  }
}
```

Later, when you move to microservices:

```ts
// Instead of querying MongoDB directly:
return this.profileModel.findOne({ userId });

// Replace with API call:
return this.httpService.get(`http://profile-service/api/profile/${userId}`);
```

So your **service layer** (`ProfileService`) doesn’t change — only repository implementation swaps out.

---

## ⚙️ 5. MongoDB Strategy for Monolith-to-Microservice Migration

### Phase 1: Monolith

* One DB, multiple collections.
* Example DB: `matrimony_main`

  * `users`
  * `profiles`
  * `matches`
  * `chats`
  * `notifications`
  * `payments`

### Phase 2: Split by Bounded Context

* Each microservice gets its **own MongoDB database**, using the same schemas.
* For example:
  * **Auth Service DB:** `auth.users`
  * **Profile Service DB:** `profile.profiles`
  * **Match Service DB:** `match.matches`
  * **Chat Service DB:** `chat.chats`
* Data synchronization done via event bus (Kafka/NATS).

---

## 🔄 6. Redis Management Approach

Redis can remain **shared** initially, then split later:

| Module | Usage                   | Example                 |
| ------ | ----------------------- | ----------------------- |
| Auth   | Session tokens, OTPs    | `auth:session:<userId>` |
| Match  | Cache matches           | `match:cache:<userId>`  |
| Chat   | Message queue / pub-sub | `chat:room:<roomId>`    |

Later, you can move each namespace to separate Redis instances for scaling.

---

## 🧩 7. Shared Schema / DTO Library

In monolith:

```
src/common/dto/
 ├── user.dto.ts
 ├── profile.dto.ts
 ├── match.dto.ts
 └── chat.dto.ts
```

Later, move it to a shared NPM workspace:

```
libs/common/
 ├── dto/
 ├── constants/
 ├── events/
 ├── interfaces/
```

All services import the same package (`@matrimony/common`).

---

## 🚀 8. Migration Steps (When Ready)

1. **Identify module boundaries** (Auth, Profile, etc.)
2. **Duplicate database schemas** into separate DBs
3. **Replace direct repository calls** with HTTP/gRPC calls
4. **Add event bus for async communication**
5. **Introduce API Gateway** to unify access

You won’t touch business logic — just rewire data sources.

---

## ✅ Summary: Golden Rules for Future-Proof Database Design

| Rule                              | Description                                      |
| --------------------------------- | ------------------------------------------------ |
| 🔸 1. One module = one data owner | No cross-module writes                           |
| 🔸 2. Repository abstraction      | Never access models directly from services       |
| 🔸 3. Events, not joins           | Publish/subscribe to domain changes              |
| 🔸 4. Shared DTO library          | Reuse schemas between monolith and microservices |
| 🔸 5. No implicit dependencies    | Use interfaces, not direct imports               |

---


1. commands to bootstrap the project
2. recommended folder structure and why
3. critical packages to install (Mongo, Redis, Passport/JWT, Socket.io, etc.)
4. sample code for core files (main.ts, app.module.ts, config, repository pattern, event abstraction, a sample module)
5. Docker + docker-compose for local dev (Mongo + Redis)
6. scripts (lint/test/dev) and basic CI hint
7. migration tips (how to swap repo → HTTP/gRPC later)

I keep code snippets minimal and copy-paste ready.

---

## 0) Assumptions

* You’ll use **TypeScript**, **NestJS**, **MongoDB (Mongoose)**, and **Redis (ioredis)**.
* Use **npm** (you can adapt to yarn/pnpm).
* Project name: `match-mate-app`.

---

## 1) Bootstrap the Nest project

(If you don't have Nest CLI: `npm i -g @nestjs/cli`)

```bash
# create project
nest new match-mate-app
# choose npm when prompted (or yarn)
cd match-mate-app
```

---

## 2) Install recommended packages

```bash
# database + redis
npm install mongoose @nestjs/mongoose ioredis

# auth + security
npm install @nestjs/passport passport passport-local passport-jwt @nestjs/jwt bcryptjs

# validation, config, websockets, queues, docs
npm install class-validator class-transformer @nestjs/config @nestjs/platform-socket.io socket.io socket.io-client bullmq ioredis

# dev helpers
npm install -D eslint prettier eslint-config-prettier eslint-plugin-prettier husky
```

Notes:

* `bullmq` requires Redis and is useful for background jobs (optional).
* You can add `@nestjs/terminus`, `@nestjs/axios`, `swagger-ui-express` later.

---

## 3) Recommended folder structure (modular monolith)

Create modules in `src/modules/*` and an infrastructure layer for technical concerns.

```
/src
  /common              # shared DTOs, interfaces, constants, events
  /config              # config files, env validation
  /infrastructure
    /database          # mongoose connection provider
    /redis             # redis client provider
    /events            # local event emitter abstraction
    /jobs              # background jobs
    /libs              # shared utility libraries
  /modules
    /auth
    /user
    /profile
    /match
    /chat
    /notification
    /payment
    /admin
  main.ts
  app.module.ts
```

Why this structure:

* Each domain is self-contained. Later you can extract any folder into its own microservice.
* `infrastructure` contains pluggable pieces (DB, redis, event bus) you’ll swap for remote services later.

---

## 4) Configuration (env + @nestjs/config)

Create `.env` at project root (example):

```
PORT=3000
MONGO_URI=mongodb://mongo:27017/matrimony
JWT_SECRET=supersecret
JWT_EXPIRES_IN=900s
REDIS_HOST=redis
REDIS_PORT=6379
```

Add `src/config/configuration.ts`:

```ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  mongoUri: process.env.MONGO_URI,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  }
});
```

In `app.module.ts` import `ConfigModule`:

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    // Modules...
  ],
})
export class AppModule {}
```

---

## 5) Database provider (Mongoose config)

`src/infrastructure/database/mongoose.config.ts`:

```ts
import { MongooseModule } from '@nestjs/mongoose';

export const MongooseConfig = MongooseModule.forRoot(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
```

Then add `MongooseConfig` to `imports` in `AppModule`.

---

## 6) Redis provider (ioredis) + service wrapper

`src/infrastructure/redis/redis.provider.ts`:

```ts
import Redis from 'ioredis';
import { Provider } from '@nestjs/common';

export const REDIS = 'REDIS';

export const RedisProvider: Provider = {
  provide: REDIS,
  useFactory: () => {
    return new Redis({
      host: process.env.REDIS_HOST,
      port: +process.env.REDIS_PORT,
    });
  }
};
```

Use injection:

```ts
constructor(@Inject(REDIS) private readonly redisClient: Redis) {}
```

Wrap conversions into `RedisService` for convenience (set/get with JSON).

---

## 7) Repository pattern (abstraction around Mongoose models)

Create repository inside each module. Example `src/modules/profile/repositories/profile.repository.ts`:

```ts
@Injectable()
export class ProfileRepository {
  constructor(@InjectModel(Profile.name) private profileModel: Model<ProfileDocument>) {}

  async create(dto: CreateProfileDto) {
    return this.profileModel.create(dto);
  }

  async findByUserId(userId: string) {
    return this.profileModel.findOne({ userId }).lean();
  }

  async update(userId: string, patch: Partial<Profile>) {
    return this.profileModel.updateOne({ userId }, { $set: patch });
  }
}
```

**Why:** later you can replace `ProfileRepository` implementation with an HTTP client that talks to a `profile` microservice without changing business logic.

---

## 8) Local event emitter abstraction (prepare for event bus)

Create `src/infrastructure/events/event-bus.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

@Injectable()
export class EventBus {
  private emitter = new EventEmitter2({ wildcard: true });

  emit(event: string, payload: any) {
    this.emitter.emit(event, payload);
  }

  on(event: string, cb: (payload: any) => void) {
    this.emitter.on(event, cb);
  }
}
```

Usage:

* When a profile is created: `eventBus.emit('profile.created', { userId, profile })`
* Later: swap this implementation with Kafka/NATS producer/consumer.

---

## 9) Sample `main.ts` (enable global validation + swagger)

`src/main.ts`:

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder().setTitle('Matrimony API').setVersion('1.0').build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, doc);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
```

---

## 10) Sample Auth module skeleton (controller/service/strategy)

Create `src/modules/auth/` with:

* `auth.controller.ts`
* `auth.service.ts`
* `strategies/local.strategy.ts` (passport-local)
* `strategies/jwt.strategy.ts` (passport-jwt)
* `schemas/user.schema.ts`
* `repositories/user.repository.ts`

Minimal `auth.service.ts`:

```ts
@Injectable()
export class AuthService {
  constructor(private readonly userRepo: UserRepository, private readonly jwtService: JwtService) {}

  async validateUser(email: string, pass: string) {
    const user = await this.userRepo.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) return user;
    return null;
  }

  async login(user: any) {
    const payload = { sub: user._id, email: user.email };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
```

Nest provides `@nestjs/jwt` and `@nestjs/passport` integrations.

---

## 11) Socket.io (Chat) basic gateway

`src/modules/chat/chat.gateway.ts`:

```ts
@WebSocketGateway({ namespace: '/chat', cors: true })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    // Validate token, associate client.id with userId in Redis for presence
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, payload: any) {
    // persist via ChatService (repositories)
    this.server.to(payload.room).emit('message', payload);
  }
}
```

When migrating to microservices, chat may become its own service exposing WebSocket endpoints; keep chat logic isolated inside `modules/chat` for easy extraction.

---

## 12) Docker & docker-compose (local dev)

`Dockerfile` (simple):

```dockerfile
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

`docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    env_file: .env
    ports:
      - '3000:3000'
    depends_on:
      - mongo
      - redis
  mongo:
    image: mongo:6
    ports:
      - '27017:27017'
    volumes:
      - mongo-data:/data/db
  redis:
    image: redis:7
    ports:
      - '6379:6379'
volumes:
  mongo-data:
```

Run:

```bash
docker-compose up --build
```

---

## 13) Useful npm scripts (package.json)

```json
"scripts": {
  "start": "nest start",
  "start:dev": "nest start --watch",
  "build": "nest build",
  "lint": "eslint '{src,test}/**/*.ts' --fix",
  "test": "jest"
}
```

Add Husky pre-commit hooks for linting and tests (optional).

---

## 14) Testing & Contract Safety

* Unit tests: **Jest** (Nest default).
* Integration tests: spin local Mongo/Redis via test docker-compose or use in-memory Mongo.
* Contract tests: **Pact** or simple OpenAPI contract tests later when you split services.

---

## 15) Basic GitHub Actions CI (starter)

`.github/workflows/ci.yml` snippet:

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage
```

---

## 16) Migration-ready practices to follow from day 1

1. **Repository + Service abstraction**: services call other domains only via interfaces (not direct model queries).
2. **Publish domain events** using your local `EventBus`. When migrating, replace with Kafka/NATS.
3. **Shared DTO library**: move `src/common` into `libs/common` or a private npm package so all services use the same DTOs/events.
4. **Avoid DB JOINs across module collections** and `$lookup` between domain collections. Use IDs and events.
5. **Use environment configs** for endpoints (so swapping local DB for a remote service endpoint is just config change).
6. **Keep operations idempotent and use idempotency keys** for webhooks and payments.
7. **Use feature flags** if you need to route to new microservice early.

---

## 17) Example: How you later replace a repository with an HTTP client

Current monolith `ProfileRepository`:

```ts
class ProfileRepository {
  async findByUserId(userId: string) { return profileModel.findOne({ userId }); }
}
```

When extracting `profile` service, create an alternative implementation:

```ts
class ProfileHttpRepository {
  constructor(private readonly http: HttpService) {}
  async findByUserId(userId: string) {
    const r = await this.http.get(`http://profile-service/api/profiles/${userId}`).toPromise();
    return r.data;
  }
}
```

Swap provider in Nest DI (no change to `ProfileService`).

### ✅ 1. Folder Structure

---
```
match-mate-api-server/
  dist/
  node_modules/
  src/
    common/
      constants/
      decorators/
      dto/
      filters/
      guards/
      interceptors/
      interfaces/
      utils/
      constants.ts
      response.dto.ts
    config/
      configuration.ts
    infrastructure/
      databases/
        mongo/
          mongo.module.ts
        redis/
          redis.module.ts
          redis.provider.ts
          redis.service.ts
      events/
      integrations/
      jobs/
      libs/
    modules/
      admin/
      auth/
        schemas/
          user.schema.ts
        strategies/
          google.strategy.ts
          jwt.strategy.ts
          local.strategy.ts
        auth.controller.ts
        auth.module.ts
        auth.service.ts
        otp.service.ts
        user.repository.ts
      chat/
        dto/
          join-room.dto.ts
          send-message.dto.ts
        schemas/
          chat-message.schema.ts
          chat-room.schema.ts
        chat.controller.ts
        chat.gateway.ts
        chat.module.ts
        chat.repository.ts
        chat.service.ts
      match/
        dto/
          respond-interest.dto.ts
          send-interest.dto.ts
        schemas/
          interest.schema.ts
          match.schema.ts
        match.controller.ts
        match.module.ts
        match.repository.ts
        match.service.ts
      notification/
        dto/
          create-notification.dto.ts
          mark-read.dto.ts
        schemas/
          notification.schema.ts
        notification.controller.ts
        notification.module.ts
        notification.repository.ts
        notification.service.ts
      payment/
        dto/
          create-order.dto.ts
          subscription.dto.ts
          verify-payment.dto.ts
        enums/
          payment.status.enum.ts
        schemas/
          payment.schema.ts
        payment.controller.ts
        payment.gateway.ts
        payment.module.ts
        payment.repository.ts
        payment.service.ts
      profile/
        dto/
          create-profile.dto.ts
          update-profile.dto.ts
        schemas/
          profile.schema.ts
        profile.controller.ts
        profile.module.ts
        profile.repository.ts
        profile.service.ts
      user/
        dto/
          create-user.dto.ts
          login-user.dto.ts
        schemas/
          user.schema.ts
        user.controller.ts
        user.module.ts
        user.repository.ts
        user.service.ts
    shared-dto/
      auth.dto.ts
      chat.dto.ts
      index.dto.ts
      match.dto.ts
      profile.dto.ts
      user.dto.ts
    app.controller.ts
    app.module.ts
    app.service.ts
    main.ts
  test/
    app.e2e.json
    jest-e2e.json
  .env
  .gitignore
  .prettierrc
  eslint.config.mjs
  nest-cli.json
  package-lock.json
  package.json
  README.md
  tsconfig.build.json
  tsconfig.json
```
---














************************* FRONTEND DOCUMENTS & SETUP *************************

## 🧱 1. Project Structure Overview

We’ll create one unified React Native codebase using **Expo + TypeScript** that can run on:

* ✅ Android
* ✅ iOS
* ✅ Web (via Expo Web)

---

### 📦 Folder structure (clean architecture ready)

```
match-mate-app/
  ├── src/
  │   ├── api/
  │   │   └── httpClient.ts
  │   ├── components/
  │   │   ├── Button.tsx
  │   │   ├── Input.tsx
  │   │   └── Avatar.tsx
  │   ├── constants/
  │   │   └── colors.ts
  │   ├── hooks/
  │   │   └── useAuth.ts
  │   ├── navigation/
  │   │   ├── AppNavigator.tsx
  │   │   └── AuthNavigator.tsx
  │   ├── screens/
  │   │   ├── Auth/
  │   │   │   ├── LoginScreen.tsx
  │   │   │   ├── RegisterScreen.tsx
  │   │   ├── Home/
  │   │   │   ├── HomeScreen.tsx
  │   │   ├── Matches/
  │   │   │   ├── MatchListScreen.tsx
  │   │   │   └── MatchDetailScreen.tsx
  │   │   ├── Profile/
  │   │   │   └── EditProfileScreen.tsx
  │   │   └── Settings/
  │   │       └── SettingsScreen.tsx
  │   ├── services/
  │   │   ├── authService.ts
  │   │   ├── matchService.ts
  │   │   └── profileService.ts
  │   ├── store/
  │   │   ├── index.ts
  │   │   ├── authSlice.ts
  │   │   └── profileSlice.ts
  │   ├── theme/
  │   │   └── theme.ts
  │   ├── utils/
  │   │   └── validators.ts
  │   └── App.tsx
  ├── app.json
  ├── package.json
  ├── tsconfig.json
  └── .env
```

---

## 🚀 2. Create Base Project

### Step 1 — Install Expo CLI

```bash
npm install -g expo-cli
```

### Step 2 — Create new project

```bash
npx create-expo-app match-mate-app --template expo-template-blank-typescript
```

Move into the project:

```bash
cd match-mate-app
```

---

## 🧩 3. Install Essential Dependencies

### Core libraries

```bash
npm install @react-navigation/native @react-navigation/native-stack \
@react-navigation/bottom-tabs react-native-safe-area-context \
react-native-screens react-native-gesture-handler
```

### State management (Redux Toolkit)

```bash
npm install @reduxjs/toolkit react-redux
```

### Networking & Utils

```bash
npm install axios @react-native-async-storage/async-storage
```

### Authentication

```bash
npm install expo-auth-session expo-secure-store
```

### UI Library

```bash
npm install react-native-paper react-native-vector-icons
```

### Type definitions

```bash
npm install -D @types/react @types/react-native
```

---

## 🌐 4. Enable Web Support

Expo automatically supports web — test it:

```bash
npx expo start --web
```

You can access it at:
👉 [http://localhost:19006](http://localhost:19006)

---

## 🧠 5. Setup Navigation

**`src/navigation/AppNavigator.tsx`**

```tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/Home/HomeScreen';
import MatchListScreen from '../screens/Matches/MatchListScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any;
          switch (route.name) {
            case 'Home': iconName = 'home'; break;
            case 'Matches': iconName = 'heart'; break;
            case 'Profile': iconName = 'person'; break;
            case 'Settings': iconName = 'settings'; break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#e91e63',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Matches" component={MatchListScreen} />
      <Tab.Screen name="Profile" component={EditProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
```

---

## 🔐 6. Auth Flow (Login + Register)

**`src/navigation/AuthNavigator.tsx`**

```tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
```

---

## 🔧 7. API Setup

**`src/api/httpClient.ts`**

```ts
import axios from 'axios';
import Constants from 'expo-constants';

const API_BASE = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

export const httpClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});
```

Example service:
**`src/services/authService.ts`**

```ts
import { httpClient } from '../api/httpClient';

export const AuthService = {
  login: (data: { email: string; password: string }) =>
    httpClient.post('/auth/login', data),
  register: (data: any) => httpClient.post('/auth/register', data),
};
```

---

## 🧭 8. Store Setup (Redux Toolkit)

**`src/store/authSlice.ts`**

```ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
}

const initialState: AuthState = { token: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    logout: (state) => {
      state.token = null;
    },
  },
});

export const { setToken, logout } = authSlice.actions;
export default authSlice.reducer;
```

**`src/store/index.ts`**

```ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

export const store = configureStore({
  reducer: { auth: authReducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

In `App.tsx`:

```tsx
import { Provider } from 'react-redux';
import { store } from './store';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </Provider>
  );
}
```

---

## 📱 9. Run on Devices

### Run on Android Emulator

```bash
npx expo start --android
```

### Run on iOS Simulator (Mac)

```bash
npx expo start --ios
```

### Run on Web

```bash
npx expo start --web
```

---

## 🧩 10. Next Steps / Extensions

| Goal              | Tech                    | Description                         |
| ----------------- | ----------------------- | ----------------------------------- |
| 🔐 Social Login   | `expo-auth-session`     | Google, Facebook, Apple sign-in     |
| 💬 Real-time Chat | `socket.io-client`      | Connect to NestJS Socket.io gateway |
| 🕸 API Env Config | `.env + expo-constants` | Different URLs for dev/stage/prod   |
| 🧠 Local Cache    | `AsyncStorage`          | Save session, tokens                |
| 🌗 Theme          | `react-native-paper`    | Dark/light theme support            |

---

## ⚙️ Summary

You now have:
✅ TypeScript-based Expo project
✅ Ready for Android, iOS, Web
✅ Redux state & Axios API integration
✅ Auth + Tabs navigation
✅ Folder structure aligned with your NestJS backend

---

Register Steps :- 

1. Create Profile For
  - Self
  - Son
  - Daughter
  - Brother
  - Sister
  - Friend
  - Relative
  - Client
2. Personal Details
  - Gender (Male / Female / Other)
  - Date Of Birth
  - Height
  - Weight
  - Country
  - State
  - City
3. Career Details
  - Education
    - Highest Education
  - Work Experince
    - Employed in
    - Occupation
    - Income
4. Social Details
  - Marital Status
  - Mother Tounge
  - Religion
  - Caste
  - Horoscope
  - Manglik
5. Login Details
  - First Name
  - Last Name
  - Email
  - Phone Number
  - Password
  - Agree Terms & Condition
  - Receive Notifications
6. Phone OTP Verification
  - Enter OTP for Phone
  - Enter OTP for Email
7. Add Photo
  - Add Photos
8. Bio 
  - About me
9. Family Details
  - Family Status
  - Family Values
  - Family Type
  - Family Income
  - Father's Occupation
  - Mother's Occupation
  - Brother's
  - Sister's
  - Family Based Out of 
    - Country
    - State
    - City
  - Gothra

## 📦 Recommended Tech Stack

### Core
- **React Native** (0.73+)
- **Expo SDK** (50+)
- **TypeScript** (5.x)
- **Expo Router** (v3) - File-based routing

### State Management
- **Redux Toolkit** - Modern Redux with less boilerplate
- **RTK Query** - Powerful data fetching & caching

### API & Data Fetching
- **Axios** - HTTP client
- **TanStack Query (React Query)** - Server state management
- **Socket.io-client** - Real-time chat

### Form Management
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### UI Components & Styling
- **React Native StyleSheet** - Native styling
- **React Native Paper** - Material Design components (Optional)
- **React Native Elements** - UI component library (Optional)
- **React Native Reanimated** - Animations
- **React Native Gesture Handler** - Gestures
- **React Native Bottom Sheet** - Bottom sheets
- **React Native Fast Image** - Image optimization

### Authentication & Backend
- **Firebase Auth** - Social logins, OTP
- **Supabase** - Backend (Alternative to Firebase)
- **JWT** - Token management

### Navigation
- **Expo Router** - File-based routing (built on React Navigation)

### Payments
- **Stripe** or **Razorpay**
- **react-native-iap** - In-app purchases

### Push Notifications
- **Expo Notifications**
- **Firebase Cloud Messaging**

### Additional Tools
- **React Native MMKV** - Fast key-value storage
- **Date-fns** - Date manipulation
- **React Native Image Crop Picker** - Image selection
- **React Native SVG** - SVG support
- **Sentry** - Error tracking
- **Mixpanel/Amplitude** - Analytics

## 🚀 Key Features Implementation

### 1. Authentication Flow
- Email/Password with Firebase Auth
- Phone OTP verification
- Social logins (Google, Facebook, Apple)
- JWT token management
- Secure storage with Expo Secure Store

### 2. Onboarding
- Multi-step form with React Hook Form
- Progress indicator
- Image upload with compression
- Validation with Zod schemas

### 3. Matches System
- Swipe cards (Tinder-style)
- Filter and sort options
- Infinite scroll with RTK Query
- Caching and optimistic updates with Redux

### 4. Real-time Chat
- Socket.io for real-time messaging
- Message read receipts
- Typing indicators
- Image/media sharing

### 5. Activity Tracking
- Interest sent/received
- Profile views
- Online status
- Match notifications

### 6. Membership & Payments
- Plan comparison
- Stripe/Razorpay integration
- In-app purchases for mobile
- Subscription management

## 🎨 Best Practices Implemented

1. **Type Safety**: Full TypeScript coverage
2. **Code Splitting**: Lazy loading with Expo Router
3. **Performance**: Memoization, FlatList optimization
4. **Error Handling**: Global error boundaries
5. **Security**: Secure token storage, API key protection
6. **Testing**: Jest + React Native Testing Library setup ready
7. **CI/CD**: EAS Build configuration
8. **Accessibility**: Screen reader support, proper labeling
9. **Offline Support**: Redux Persist for state persistence
10. **Analytics**: Event tracking integrated

## 📱 File-based Routing Example (Expo Router)

```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="matches" options={{ title: 'Matches' }} />
      {/* ... */}
    </Tabs>
  );
}
```

## 🔧 Configuration Files

### app.json
```json
{
  "expo": {
    "name": "MatrimonialApp",
    "slug": "matchmate-app",
    "scheme": "matchmateapp",
    "plugins": [
      "expo-router",
      "expo-secure-store",
      "@react-native-firebase/app"
    ]
  }
}
```

## 🏗️ Redux Toolkit Setup Examples

### store/index.ts
```typescript
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import matchesReducer from './slices/matchesSlice';
import { authApi } from './services/authApi';
import { matchesApi } from './services/matchesApi';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'user'], // Only persist these reducers
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    user: userReducer,
    matches: matchesReducer,
    [authApi.reducerPath]: authApi.reducer,
    [matchesApi.reducerPath]: matchesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(authApi.middleware, matchesApi.middleware),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### store/hooks.ts
```typescript
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### store/slices/authSlice.ts
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id: string;
    email: string;
    phone?: string;
  } | null;
}

const initialState: AuthState = {
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; refreshToken: string; user: any }>
    ) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
```

### store/services/authApi.ts (RTK Query)
```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../index';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    verifyOTP: builder.mutation({
      query: (otpData) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body: otpData,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: { email },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyOTPMutation,
  useForgotPasswordMutation,
} = authApi;
```

### store/services/matchesApi.ts
```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../index';

export const matchesApi = createApi({
  reducerPath: 'matchesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Matches', 'Match'],
  endpoints: (builder) => ({
    getMatches: builder.query({
      query: ({ page = 1, limit = 20, filters }) => ({
        url: '/matches',
        params: { page, limit, ...filters },
      }),
      providesTags: ['Matches'],
    }),
    getMatchById: builder.query({
      query: (id) => `/matches/${id}`,
      providesTags: (result, error, id) => [{ type: 'Match', id }],
    }),
    sendInterest: builder.mutation({
      query: (matchId) => ({
        url: `/matches/${matchId}/interest`,
        method: 'POST',
      }),
      invalidatesTags: ['Matches'],
    }),
    acceptInterest: builder.mutation({
      query: (matchId) => ({
        url: `/matches/${matchId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: ['Matches'],
    }),
  }),
});

export const {
  useGetMatchesQuery,
  useGetMatchByIdQuery,
  useSendInterestMutation,
  useAcceptInterestMutation,
} = matchesApi;
```

### app/_layout.tsx (Root Layout with Redux)
```typescript
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store';
import { ActivityIndicator } from 'react-native';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={<ActivityIndicator />} persistor={persistor}>
        <Stack screenOptions={{ headerShown: false }} />
      </PersistGate>
    </Provider>
  );
}
```

### Usage Example in Components
```typescript
// app/(auth)/login.tsx
import { useAppDispatch } from '../../store/hooks';
import { useLoginMutation } from '../../store/services/authApi';
import { setCredentials } from '../../store/slices/authSlice';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const [login, { isLoading, error }] = useLoginMutation();

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials(result));
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    // Your login UI
  );
}
```


# Complete API Security Guide for Matrimonial App

## 🔐 Overview of API Security Layers

```
┌─────────────────────────────────────────────────────────┐
│  1. Request Headers (Authentication, Correlation ID)    │
├─────────────────────────────────────────────────────────┤
│  2. Rate Limiting (Prevent abuse)                       │
├─────────────────────────────────────────────────────────┤
│  3. Input Validation (Sanitization, Schema validation)  │
├─────────────────────────────────────────────────────────┤
│  4. Authorization (Permission checks)                   │
├─────────────────────────────────────────────────────────┤
│  5. Business Logic (Your app code)                      │
├─────────────────────────────────────────────────────────┤
│  6. Response Filtering (Data sanitization)              │
├─────────────────────────────────────────────────────────┤
│  7. Logging & Monitoring (Track everything)             │
└─────────────────────────────────────────────────────────┘
```

---
# Complete NestJS Backend Security Guide for Matrimonial App

## 🏗️ Security Architecture: Frontend vs Backend

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React Native)                  │
│  - Generates Correlation ID                                      │
│  - Sends headers (Auth, Device ID, Platform)                     │
│  - Basic validation (UX only - CAN BE BYPASSED!)                │
│  - Shows rate limit warnings                                     │
│  - Handles errors gracefully                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND (NestJS)                         │
│  ✅ RECEIVES Correlation ID & propagates it                      │
│  ✅ ENFORCES rate limiting (Redis/Memory)                        │
│  ✅ VALIDATES all inputs (NEVER trust client!)                   │
│  ✅ VERIFIES authentication (JWT validation)                     │
│  ✅ CHECKS authorization (permissions)                           │
│  ✅ SANITIZES all data (SQL injection, XSS prevention)          │
│  ✅ LOGS everything (with Correlation ID)                        │
│  ✅ ENCRYPTS sensitive data                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Complete NestJS Project Structure

```
matchmate-api/
├── src/
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── correlation-id.decorator.ts
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── roles.decorator.ts
│   │   │   └── rate-limit.decorator.ts
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   └── all-exceptions.filter.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── rate-limit.guard.ts
│   │   ├── interceptors/
│   │   │   ├── correlation-id.interceptor.ts
│   │   │   ├── logging.interceptor.ts
│   │   │   ├── transform.interceptor.ts
│   │   │   └── sanitize.interceptor.ts
│   │   ├── middleware/
│   │   │   ├── correlation-id.middleware.ts
│   │   │   ├── rate-limit.middleware.ts
│   │   │   └── security-headers.middleware.ts
│   │   ├── pipes/
│   │   │   ├── validation.pipe.ts
│   │   │   └── sanitization.pipe.ts
│   │   └── validators/
│   │       ├── is-adult.validator.ts
│   │       ├── is-valid-phone.validator.ts
│   │       └── is-safe-string.validator.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── guards/
│   │   │   ├── strategies/
│   │   │   ├── dto/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   │
│   │   ├── user/
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   └── update-user.dto.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.repository.ts
│   │   │   └── user.module.ts
│   │   │
│   │   ├── match/
│   │   ├── chat/
│   │   └── payment/
│   │
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   ├── redis.config.ts
│   │   └── rate-limit.config.ts
│   │
│   ├── app.module.ts
│   └── main.ts
│
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 1️⃣ Correlation ID Implementation (NestJS)

### Middleware - Extract/Generate Correlation ID

```typescript
// src/common/middleware/correlation-id.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extract correlation ID from request header or generate new one
    const correlationId = 
      req.headers['x-correlation-id'] as string || 
      uuidv4();

    // Generate request ID (unique per request)
    const requestId = uuidv4();

    // Attach to request object for later use
    req['correlationId'] = correlationId;
    req['requestId'] = requestId;

    // Add to response headers (send back to client)
    res.setHeader('X-Correlation-ID', correlationId);
    res.setHeader('X-Request-ID', requestId);

    // Store in async context for logging (optional but recommended)
    // This allows you to access correlationId anywhere in the request lifecycle
    
    next();
  }
}
```

### Interceptor - Log All Requests with Correlation ID

```typescript
// src/common/interceptors/logging.interceptor.ts

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, headers } = request;
    const correlationId = request['correlationId'];
    const requestId = request['requestId'];
    const userAgent = headers['user-agent'] || 'unknown';
    const clientVersion = headers['x-client-version'] || 'unknown';
    const platform = headers['x-platform'] || 'unknown';
    const deviceId = headers['x-device-id'] || 'unknown';

    const startTime = Date.now();

    // Log incoming request
    this.logger.log({
      type: 'REQUEST',
      correlationId,
      requestId,
      method,
      url,
      clientVersion,
      platform,
      deviceId,
      userAgent,
      timestamp: new Date().toISOString(),
      body: this.sanitizeBody(body),
    });

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const duration = Date.now() - startTime;

          // Log successful response
          this.logger.log({
            type: 'RESPONSE',
            correlationId,
            requestId,
            method,
            url,
            statusCode: response.statusCode,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;

          // Log error response
          this.logger.error({
            type: 'ERROR',
            correlationId,
            requestId,
            method,
            url,
            error: error.message,
            stack: error.stack,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
          });
        },
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return {};

    // Remove sensitive data from logs
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'creditCard', 'cvv'];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }
}
```

### Decorator - Access Correlation ID in Controllers

```typescript
// src/common/decorators/correlation-id.decorator.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CorrelationId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request['correlationId'];
  },
);

// Usage in controller:
// async createUser(@CorrelationId() correlationId: string) { ... }
```

---

## 2️⃣ Rate Limiting (NestJS)

### Rate Limit Configuration

```typescript
// src/config/rate-limit.config.ts

export const RATE_LIMIT_CONFIG = {
  // Authentication endpoints
  AUTH_LOGIN: {
    ttl: 900, // 15 minutes in seconds
    limit: 5,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  
  AUTH_REGISTER: {
    ttl: 3600, // 1 hour
    limit: 3,
    message: 'Too many registration attempts.',
  },
  
  AUTH_OTP_SEND: {
    ttl: 3600,
    limit: 5,
    message: 'Too many OTP requests.',
  },
  
  AUTH_FORGOT_PASSWORD: {
    ttl: 3600,
    limit: 3,
    message: 'Too many password reset requests.',
  },

  // User profile endpoints
  USER_UPDATE: {
    ttl: 3600,
    limit: 10,
    message: 'Profile update limit reached.',
  },

  USER_AVATAR_UPLOAD: {
    ttl: 3600,
    limit: 5,
    message: 'Too many avatar uploads.',
  },

  // Match endpoints
  MATCH_SEND_INTEREST: {
    ttl: 86400, // 1 day
    limit: 50, // Free tier
    limitPremium: 200, // Premium tier
    message: 'Daily interest limit reached. Upgrade for more.',
  },

  MATCH_VIEW_PROFILE: {
    ttl: 86400,
    limit: 100,
    limitPremium: 500,
    message: 'Daily profile view limit reached.',
  },

  MATCH_SEARCH: {
    ttl: 3600,
    limit: 30,
    message: 'Too many search requests.',
  },

  // Chat endpoints
  CHAT_SEND_MESSAGE: {
    ttl: 3600,
    limit: 100,
    limitPremium: 500,
    message: 'Message rate limit exceeded.',
  },

  // General API
  GENERAL: {
    ttl: 3600,
    limit: 1000,
    message: 'API rate limit exceeded.',
  },
};
```

### Rate Limit Guard (Using Redis)

```typescript
// src/common/guards/rate-limit.guard.ts

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { RATE_LIMIT_KEY } from '../decorators/rate-limit.decorator';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get rate limit config from decorator
    const rateLimitConfig = this.reflector.get(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    if (!rateLimitConfig) {
      return true; // No rate limit defined
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Create unique key per user/IP
    const identifier = this.getIdentifier(request);
    const key = `rate-limit:${rateLimitConfig.name}:${identifier}`;

    // Get current count from Redis
    const currentCount = await this.redis.get(key);
    const count = currentCount ? parseInt(currentCount, 10) : 0;

    // Get limit based on user membership
    const limit = this.getLimit(request, rateLimitConfig);

    // Calculate reset time
    const ttl = rateLimitConfig.ttl;
    const resetAt = Date.now() + ttl * 1000;

    // Set rate limit headers
    response.setHeader('X-RateLimit-Limit', limit);
    response.setHeader('X-RateLimit-Remaining', Math.max(0, limit - count - 1));
    response.setHeader('X-RateLimit-Reset', Math.floor(resetAt / 1000));

    // Check if limit exceeded
    if (count >= limit) {
      const retryAfter = await this.redis.ttl(key);
      response.setHeader('Retry-After', retryAfter);

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: rateLimitConfig.message,
          retryAfter,
          resetAt,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Increment counter
    if (count === 0) {
      // First request - set with expiry
      await this.redis.setex(key, ttl, 1);
    } else {
      // Increment existing
      await this.redis.incr(key);
    }

    return true;
  }

  private getIdentifier(request: any): string {
    // Use user ID if authenticated, otherwise use IP
    const userId = request.user?.id;
    const ip = request.ip || request.connection.remoteAddress;
    return userId || ip;
  }

  private getLimit(request: any, config: any): number {
    // Check if user is premium
    const isPremium = request.user?.membership?.tier !== 'free';
    return isPremium && config.limitPremium 
      ? config.limitPremium 
      : config.limit;
  }
}
```

### Rate Limit Decorator

```typescript
// src/common/decorators/rate-limit.decorator.ts

import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rate-limit';

export interface RateLimitOptions {
  name: string;
  ttl: number; // seconds
  limit: number;
  limitPremium?: number;
  message: string;
}

export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);

// Usage in controller:
/*
@RateLimit({
  name: 'login',
  ttl: 900,
  limit: 5,
  message: 'Too many login attempts',
})
@Post('login')
async login() { ... }
*/
```

---

## 3️⃣ Input Validation & Sanitization (NestJS)

### DTOs with Class Validator

```typescript
// src/modules/user/dto/create-user.dto.ts

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsDate,
  MinLength,
  MaxLength,
  Matches,
  IsPhoneNumber,
  IsOptional,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsAdult } from '../../../common/validators/is-adult.validator';
import { IsSafeString } from '../../../common/validators/is-safe-string.validator';

export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: 'StrongP@ss123' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(50, { message: 'Password must not exceed 50 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message:
        'Password must contain uppercase, lowercase, number and special character',
    },
  )
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Matches(/^[a-zA-Z\s]+$/, { message: 'Name can only contain letters and spaces' })
  @Transform(({ value }) => value?.trim())
  @IsSafeString({ message: 'Name contains invalid characters' })
  fullName: string;

  @ApiProperty({ example: '+919876543210' })
  @IsPhoneNumber('IN', { message: 'Invalid phone number for India' })
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: '1995-06-15' })
  @Type(() => Date)
  @IsDate({ message: 'Invalid date format' })
  @IsAdult({ message: 'You must be at least 18 years old' })
  dateOfBirth: Date;

  @ApiProperty({ example: 'male', enum: ['male', 'female', 'other'] })
  @IsEnum(['male', 'female', 'other'], { message: 'Invalid gender' })
  gender: 'male' | 'female' | 'other';

  @ApiProperty({ example: true })
  @Transform(({ value }) => value === true || value === 'true')
  termsAccepted: boolean;
}
```

### Custom Validators

```typescript
// src/common/validators/is-adult.validator.ts

import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsAdultConstraint implements ValidatorConstraintInterface {
  validate(dateOfBirth: Date) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= 18 && age <= 100;
  }

  defaultMessage() {
    return 'You must be between 18 and 100 years old';
  }
}

export function IsAdult(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAdultConstraint,
    });
  };
}
```

```typescript
// src/common/validators/is-safe-string.validator.ts

import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsSafeStringConstraint implements ValidatorConstraintInterface {
  validate(text: string) {
    if (!text) return true;

    // Check for SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
      /(UNION.*SELECT)/gi,
      /(\bOR\b.*=.*)/gi,
      /(;|--|\/\*|\*\/)/g,
    ];

    // Check for XSS patterns
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
    ];

    const hasSQLInjection = sqlPatterns.some((pattern) => pattern.test(text));
    const hasXSS = xssPatterns.some((pattern) => pattern.test(text));

    return !hasSQLInjection && !hasXSS;
  }

  defaultMessage() {
    return 'Text contains invalid or dangerous characters';
  }
}

export function IsSafeString(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsSafeStringConstraint,
    });
  };
}
```

### Sanitization Pipe

```typescript
// src/common/pipes/sanitization.pipe.ts

import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import * as sanitizeHtml from 'sanitize-html';

@Injectable()
export class SanitizationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'body') {
      return this.sanitizeObject(value);
    }
    return value;
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = this.sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }

    return obj;
  }

  private sanitizeString(str: string): string {
    // Remove HTML tags
    let sanitized = sanitizeHtml(str, {
      allowedTags: [], // No HTML tags allowed
      allowedAttributes: {},
    });

    // Remove SQL injection patterns
    sanitized = sanitized.replace(/['";]/g, '');

    // Trim whitespace
    sanitized = sanitized.trim();

    return sanitized;
  }
}
```

---

## 4️⃣ Authentication & Authorization (NestJS)

### JWT Strategy

```typescript
// src/modules/auth/strategies/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Payload contains: { sub: userId, email: string, iat: number, exp: number }
    
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // This user object will be attached to request.user
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      membership: user.membership,
    };
  }
}
```

### JWT Auth Guard

```typescript
// src/common/guards/jwt-auth.guard.ts

import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}
```

### Roles Guard (Authorization)

```typescript
// src/common/guards/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // No roles required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Check if user has required role
    return requiredRoles.some((role) => user.role === role);
  }
}
```

### Decorators

```typescript
// src/common/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
```

## 6️⃣ Global Error Handling
```typescript
// src/common/filters/all-exceptions.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const correlationId = request['correlationId'];
    const requestId = request['requestId'];

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        errors = (exceptionResponse as any).errors;
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log error with correlation ID
    this.logger.error({
      correlationId,
      requestId,
      path: request.url,
      method: request.method,
      statusCode: status,
      message,
      stack: exception instanceof Error ? exception.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Send error response
    response.status(status).json({
      statusCode: status,
      message,
      errors,
      correlationId,
      requestId,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

---

## 7️⃣ Main Application Setup
```typescript
// src/main.ts

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // ==========================================
  // SECURITY MIDDLEWARE
  // ==========================================
  
  // Helmet - Security headers
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Correlation-ID',
      'X-Request-ID',
      'X-Client-Version',
      'X-Platform',
      'X-Device-ID',
    ],
    exposedHeaders: [
      'X-Correlation-ID',
      'X-Request-ID',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ],
  });

  // Compression
  app.use(compression());

  // ==========================================
  // GLOBAL PIPES
  // ==========================================
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error for extra properties
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ==========================================
  // GLOBAL FILTERS
  // ==========================================
  
  app.useGlobalFilters(new AllExceptionsFilter());

  // ==========================================
  // GLOBAL INTERCEPTORS
  // ==========================================
  
  app.useGlobalInterceptors(new LoggingInterceptor());

  // ==========================================
  // API PREFIX
  // ==========================================
  
  app.setGlobalPrefix('api/v1');

  // ==========================================
  // SWAGGER DOCUMENTATION
  // ==========================================
  
  const config = new DocumentBuilder()
    .setTitle('Matrimonial API')
    .setDescription('API documentation for Matrimonial App')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // ==========================================
  // START SERVER
  // ==========================================
  
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Server running on: http://localhost:${port}`);
  console.log(`📚 API Docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();
```

---

## 8️⃣ App Module Configuration
```typescript
// src/app.module.ts

import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
    }),

    // Redis for rate limiting & caching
    RedisModule.forRoot({
      config: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD,
      },
    }),

    // Global rate limiting (fallback)
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Feature modules
    AuthModule,
    UserModule,
    // ... other modules
  ],
  providers: [
    // Apply JWT Guard globally
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply correlation ID middleware to all routes
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
```

---

## 9️⃣ Environment Variables
```bash
# .env.example

# Application
NODE_ENV=development
PORT=3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=matchmate_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRATION=7d

# API Keys
API_KEY_ADMIN=admin-secret-key

# File Upload
MAX_FILE_SIZE=5242880  # 5MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# External Services
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=

# Monitoring
SENTRY_DSN=
```

---

## 🎯 Security Best Practices Summary

### Frontend (React Native)
✅ Generate Correlation ID  
✅ Send security headers  
✅ Basic validation (UX)  
✅ Handle rate limit responses  
✅ Store tokens securely  
⚠️ **DO NOT** trust client validation  

### Backend (NestJS)
✅ **RECEIVE** and propagate Correlation ID  
✅ **ENFORCE** rate limiting with Redis  
✅ **VALIDATE** all inputs (CRITICAL!)  
✅ **SANITIZE** all data  
✅ **VERIFY** JWT tokens  
✅ **CHECK** permissions (authorization)  
✅ **LOG** everything with Correlation ID  
✅ **ENCRYPT** sensitive data  
✅ Use HTTPS only  
✅ Set security headers (Helmet)  

---

## 🚀 Quick Start Checklist

**Week 1: Foundation**
- [ ] Set up Correlation ID middleware
- [ ] Implement logging interceptor
- [ ] Add JWT authentication
- [ ] Configure Redis

**Week 2: Security**
- [ ] Implement rate limiting
- [ ] Add input validation (DTOs)
- [ ] Create custom validators
- [ ] Add sanitization pipe

**Week 3: Authorization**
- [ ] Implement role-based guards
- [ ] Add permission checks
- [ ] Create admin endpoints

**Week 4: Monitoring**
- [ ] Set up Sentry
- [ ] Add comprehensive logging
- [ ] Create health check endpoints
- [ ] Monitor rate limit usage

This gives you enterprise-grade security for your matchmate app! 🔐</parameter>



src/
│
├── app/                      # App-level config
│   ├── store.ts
│   ├── rootReducer.ts
│   ├── navigation.tsx
│
├── assets/
│   ├── images/
│   ├── fonts/
│
├── core/                     # Shared logic (GLOBAL)
│   ├── api/                  # API client (axios, interceptors)
│   ├── services/             # global services (socket, analytics)
│   ├── hooks/                # reusable hooks
│   ├── utils/
│   ├── constants/
│   ├── types/
│
├── features/                 # 🔥 MAIN CHANGE
│   ├── auth/
│   │   ├── api/
│   │   │   ├── authAPI.ts
│   │   │
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │
│   │   ├── screens/
│   │   │   ├── LoginScreen.tsx
│   │   │
│   │   ├── store/
│   │   │   ├── authSlice.ts
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │
│   │   ├── types.ts
│   │
│   ├── user/
│   ├── chat/
│   ├── payments/
│
├── shared/                   # Reusable UI components
│   ├── components/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Loader/
│   │
│   ├── styles/
│   ├── theme/
│
├── navigation/
│   ├── RootNavigator.tsx
│   ├── TabNavigator.tsx
│
├── App.tsx

---

====================================================================

# 1. Core Philosophy Difference

| Platform      | Focus                                            |
| ------------- | ------------------------------------------------ |
| Jeevansathi   | Traditional matrimony                            |
| Shaadi.com    | Serious matchmaking + family involvement         |
| Tinder        | Fast modern dating + instant engagement          |
| Your App Goal | Modern AI-powered matrimony for Gen Z + families |

Your biggest opportunity:

* Combine trust + serious matchmaking
* With modern UX like Tinder
* Plus AI + safety + personalization

That is where current market is moving.

---

# 2. Enterprise-Level Feature Architecture

You should organize your app into major domains/modules.

---

# A. AUTH & ONBOARDING MODULE

## Must Have

✅ Email login
✅ Mobile OTP login
✅ Social login
✅ Forgot password
✅ Refresh token auth
✅ Device/session management

## Enterprise Additions

✅ Apple Login
✅ Google Login
✅ Face verification
✅ Government ID verification
✅ Selfie verification
✅ Multi-step onboarding
✅ Profile completion percentage
✅ AI onboarding recommendations

---

# B. PROFILE MANAGEMENT MODULE

## You Already Have

✅ Edit profile
✅ Photos
✅ Preferences

## Enterprise Additions

### Basic Profile

* Bio/About Me
* Education
* Career
* Salary
* Religion
* Community
* Languages
* Lifestyle
* Family Details
* Horoscope

### Modern Gen Z Additions

* Voice intro
* Video intro
* Instagram-style prompts
* Personality badges
* Interests & hobbies
* Spotify integration
* Travel history
* Fitness level
* Pets
* Relationship goals

### Trust Features

* Verified badge
* LinkedIn verification
* Employment verification
* Photo moderation AI

---

# C. MATCHMAKING ENGINE

✅ Age
✅ Height
✅ Religion
✅ Community
✅ Education
✅ Location

## Advanced AI Matching

### Recommended

* Behavioral matching
* Interest similarity
* Communication style
* Activity score
* Compatibility scoring
* AI-generated compatibility explanation

Example:

> "You both value family, fitness, and travel."

### Tinder-like Features

* Swipe cards
* Smart suggestions
* Nearby matches
* Recently active users

---

# D. DISCOVERY MODULE

## Must Have

* Search filters
* Advanced search
* Saved searches
* Recent profiles
* Premium filters

## Enterprise Additions

### AI Discovery

* Smart recommendations
* "People like you"
* "Trending profiles"
* Compatibility ranking

### Real-time Discovery

* Online now
* Nearby users
* Recently joined
* Recently verified


## Enterprise Features

### Messaging

* Read receipts
* Typing indicators
* Voice messages
* Image sharing
* Video sharing
* GIFs/stickers
* Message reactions

### Calling

* Audio call
* Video call

### Engagement

* Ice breaker prompts
* Suggested openers
* AI conversation starters

### Per-category Preferences

* Matches
* Messages
* Interests
* Marketing
* Security
* Subscription
* Promotions

---

# G. SAFETY & TRUST MODULE

### User Safety

* Block/report
* Fake profile detection
* AI moderation
* Nudity detection
* Harassment filtering

### Trust Verification

* Mobile verified
* Email verified
* Aadhaar/ID verified
* Selfie verified
* LinkedIn verified

---

# H. SUBSCRIPTION & MONETIZATION

## Shaadi/Jeevansathi Model

* Premium memberships
* Contact unlocks

## Tinder Model

* Boosts
* Super likes
* Visibility upgrades

## Enterprise Revenue Features

### Plans

* Free
* Gold
* Platinum
* VIP

### Features

* Unlimited chat
* See who viewed you
* Profile boost
* Advanced filters
* Read receipts
* Priority support

### Add-ons

* Profile spotlight
* AI matchmaking assistant
* Horoscope matching
* Personal relationship coach

---

### Biodata

* PDF biodata generation
* Printable profile

This is VERY important for India.

---

# J. ADMIN PANEL (ENTERPRISE CRITICAL)

Most developers underestimate this.

You NEED:

## User Management

* Ban users
* Verify users
* Moderation queue

## Content Moderation

* Report handling
* Image moderation
* AI moderation review

## Analytics

* User growth
* Conversion
* Revenue
* Retention
* Match success

## CRM

* Customer support
* Tickets
* Refunds
* Complaints

---

# K. AI FEATURES (2026 STANDARD)

This is now expected by Gen Z users.

## Strong AI Features

### AI Match Assistant

> "Why this profile suits you"

### AI Chat Assistant

* Suggest replies
* Icebreakers

### AI Fraud Detection

* Fake profile detection
* Scam detection

### AI Profile Scoring

* Improve profile suggestions

### AI Photo Ranking

* Best photo selection

## Enterprise Engagement

* Daily recommendations
* Streaks
* Match score
* Activity badges
* Profile strength
* Rewards



<div align="center">

# 💍 Enterprise Matrimonial App

### A production-grade, full-stack matrimonial platform built for scale

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

[![Build Status](https://img.shields.io/github/actions/workflow/status/YOUR_ORG/YOUR_REPO/ci.yml?branch=main&style=flat-square)](https://github.com/YOUR_ORG/YOUR_REPO/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
[![API Docs](https://img.shields.io/badge/API-Swagger-85EA2D?style=flat-square&logo=swagger)](http://localhost:3000/api/docs)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
- [API Documentation](#-api-documentation)
- [Task Roadmap & Status](#-task-roadmap--status)
- [Phase Build Order](#-phase-build-order)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

A scalable, enterprise-grade matrimonial platform designed for the Indian market — supporting millions of users with real-time chat, AI-powered match recommendations, KYC verification, and a robust subscription/monetization system.

> **India-first** — Built with OTP login, Aadhaar eKYC, UPI payments, WhatsApp notifications, regional language support, and caste/community-based matching out of the box.

---

## ✨ Features

| Category | Highlights |
|---|---|
| 🔐 **Auth** | Email, Phone OTP, Google/Facebook/Apple OAuth, JWT + Refresh Tokens, Device Tracking |
| 👤 **Profiles** | Multi-step onboarding, KYC verification, Kundli/horoscope, photo/video upload |
| ❤️ **Matching** | ML-based recommendations, compatibility score, filters, interest/accept flow |
| 💬 **Chat** | Real-time Socket.io messaging, read receipts, typing indicators, media sharing |
| 🔔 **Notifications** | FCM push, WhatsApp (WABA), SMS, in-app alerts, drip campaigns |
| 💰 **Monetization** | Tiered plans (Free/Premium/Gold), Razorpay/UPI, referral system, coin wallet |
| 🛡️ **Security** | Rate limiting, brute force protection, PII encryption, GDPR/PDPB compliance |
| 📊 **Analytics** | Funnel tracking, cohort analysis, A/B testing, match success metrics |
| ⚙️ **Admin** | Role-based admin panel, KYC approval queue, content moderation, dashboards |

---

## 🛠 Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | [NestJS](https://nestjs.com/) (Node.js + TypeScript) |
| Database | [MongoDB](https://www.mongodb.com/) + Mongoose |
| Cache | [Redis](https://redis.io/) (sessions, feeds, rate limits) |
| Real-time | [Socket.io](https://socket.io/) |
| Queue | [BullMQ](https://bullmq.io/) + Redis |
| Auth | JWT (access + refresh), Passport.js, OAuth 2.0 |
| Storage | AWS S3 + CloudFront CDN |
| Email | Nodemailer / SendGrid |
| SMS / OTP | Twilio / MSG91 |
| Payments | Razorpay (UPI, cards, net banking) |
| Logging | Winston + ELK Stack |
| Monitoring | Sentry + Datadog |
| Validation | class-validator + Joi |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React Native (mobile) / Next.js (web) |
| State | Redux Toolkit / Zustand |
| API Client | Axios + React Query |
| Real-time | Socket.io Client |
| UI Library | Custom Design System + Tailwind CSS |
| Auth Storage | Secure Storage (mobile) / HttpOnly Cookie (web) |

### Infrastructure
| Layer | Technology |
|---|---|
| Containers | Docker + Kubernetes (EKS) |
| CI/CD | GitHub Actions |
| IaC | Terraform |
| Cloud | AWS (Mumbai region primary) |
| CDN | CloudFront / Cloudflare |

---

## 🏗 Architecture

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
│  │  Subs.   │ │  Notif.  │ │  Admin   │ │  Analytics   │  │
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

---

## 📁 Project Structure

```
matrimonial-app/
├── apps/
│   ├── api/                        # NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/           # JWT, OAuth, OTP, sessions
│   │   │   │   ├── users/          # Profile, media, preferences
│   │   │   │   ├── matching/       # Discovery, filters, interactions
│   │   │   │   ├── chat/           # Messages, Socket.io, receipts
│   │   │   │   ├── notifications/  # Push, email, SMS, WhatsApp
│   │   │   │   ├── subscriptions/  # Plans, payments, wallet
│   │   │   │   ├── admin/          # Admin panel APIs
│   │   │   │   └── analytics/      # Events, funnels, metrics
│   │   │   ├── common/
│   │   │   │   ├── decorators/
│   │   │   │   ├── filters/        # Global exception filters
│   │   │   │   ├── guards/         # Auth, RBAC, subscription guards
│   │   │   │   ├── interceptors/   # Logging, transform, correlation-id
│   │   │   │   ├── pipes/          # Validation pipes
│   │   │   │   └── middleware/     # Rate limit, helmet, sanitization
│   │   │   ├── config/             # @nestjs/config + Joi schema
│   │   │   ├── database/           # MongoDB connection, migrations
│   │   │   ├── queue/              # BullMQ workers & processors
│   │   │   └── main.ts
│   │   ├── test/
│   │   └── Dockerfile
│   │
│   ├── mobile/                     # React Native App
│   │   ├── src/
│   │   │   ├── screens/
│   │   │   ├── components/
│   │   │   ├── navigation/
│   │   │   ├── store/
│   │   │   ├── hooks/
│   │   │   └── services/           # API clients, socket, storage
│   │   └── package.json
│   │
│   └── web/                        # Next.js Web App
│       ├── src/
│       │   ├── app/                # App router pages
│       │   ├── components/
│       │   └── lib/
│       └── package.json
│
├── packages/
│   ├── shared-types/               # Shared TypeScript interfaces
│   ├── ui-kit/                     # Shared component library
│   └── config/                     # Shared ESLint/TS config
│
├── infrastructure/
│   ├── terraform/                  # IaC for AWS
│   ├── k8s/                        # Kubernetes manifests
│   └── docker-compose.yml          # Local dev stack
│
├── docs/
│   ├── api/                        # OpenAPI specs
│   ├── architecture/               # Diagrams
│   └── ROADMAP.md                  # Full task roadmap
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                  # Test + lint on PR
│   │   ├── cd-staging.yml          # Deploy to staging on merge
│   │   └── cd-prod.yml             # Deploy to prod on release tag
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 20.x`
- npm `>= 10.x` or pnpm `>= 9.x`
- MongoDB `>= 7.x` (or Atlas connection string)
- Redis `>= 7.x`
- Docker + Docker Compose (for local infra)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_ORG/YOUR_REPO.git
cd matrimonial-app

# Install dependencies (monorepo)
pnpm install

# Start local infrastructure (MongoDB + Redis)
docker-compose up -d mongo redis
```

### Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

<details>
<summary>📄 Full .env.example reference</summary>

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
EMAIL_FROM=no-reply@yourapp.com

# ── AWS S3 ───────────────────────────────────────────
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=matrimonial-media
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

### Running the App

```bash
# Development (with hot reload)
pnpm run dev:api

# Run all apps in parallel (API + web)
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm run start:prod
```

**Or with Docker Compose (full stack):**

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| API | http://localhost:3000 |
| Swagger Docs | http://localhost:3000/api/docs |
| Web App | http://localhost:3001 |
| MongoDB Express | http://localhost:8081 |
| Bull Dashboard | http://localhost:3000/queues |

---

## 📖 API Documentation

API is documented with **Swagger / OpenAPI 3.0**.

- **Local:** http://localhost:3000/api/docs
- **Staging:** https://api-staging.yourapp.com/api/docs

### Response Envelope

All API responses follow a standard envelope:

```json
{
  "success": true,
  "data": { },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 450,
    "correlationId": "uuid-v4"
  },
  "error": null
}
```

### Error Format

```json
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

### Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register/email` | Email registration |
| `POST` | `/api/v1/auth/register/phone` | Phone + OTP registration |
| `POST` | `/api/v1/auth/login` | Login (email / phone) |
| `POST` | `/api/v1/auth/refresh` | Refresh access token |
| `POST` | `/api/v1/auth/logout` | Logout (current device) |
| `GET` | `/api/v1/users/me` | Get own profile |
| `PUT` | `/api/v1/users/me` | Update profile |
| `GET` | `/api/v1/matches` | Get recommended matches |
| `POST` | `/api/v1/interactions/interest` | Send interest |
| `GET` | `/api/v1/chat` | Chat list |
| `GET` | `/api/v1/subscriptions/plans` | Available plans |

---

## 📊 Task Roadmap & Status

> Full detailed roadmap: [`docs/ROADMAP.md`](docs/ROADMAP.md)

### Status Legend

| Icon | Meaning |
|---|---|
| ✅ | Done / Completed |
| ⏳ | In Progress |
| 📂 | Not Started |
| ⚠️ | Blocked / Issue |
| 🚫 | Not Assigned |
| 🔥 | High Priority |
| 💤 | On Hold |

### High-Level Phase Status

| Phase | Area | Status | Progress |
|---|---|---|---|
| Phase 1 | Core Auth & Sessions | ✅ Complete | ![100%](https://progress-bar.xyz/100) |
| Phase 2 | User & Profile System | ✅ Complete | ![100%](https://progress-bar.xyz/100) |
| Phase 3 | Discovery & Interactions | ✅ Complete | ![90%](https://progress-bar.xyz/90) |
| Phase 4 | Chat System | ⚠️ In Progress | ![75%](https://progress-bar.xyz/75) |
| Phase 5 | Subscription & Payments | ⏳ In Progress | ![60%](https://progress-bar.xyz/60) |
| Phase 6 | Analytics & Tracking | ⏳ In Progress | ![40%](https://progress-bar.xyz/40) |
| Phase 7 | Security & Compliance | ✅ Mostly Done | ![85%](https://progress-bar.xyz/85) |
| Phase 8 | Performance & Scale | ⏳ In Progress | ![50%](https://progress-bar.xyz/50) |
| Phase 9 | Notifications System | 📂 Not Started | ![0%](https://progress-bar.xyz/0) |
| Phase 10 | Admin Panel | 📂 Not Started | ![0%](https://progress-bar.xyz/0) |

---

## 🗺 Phase Build Order

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

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# Integration tests
pnpm run test:e2e

# Test coverage report
pnpm run test:cov

# Watch mode (during development)
pnpm run test:watch
```

### Coverage Targets

| Layer | Target |
|---|---|
| Services (unit) | ≥ 80% |
| Controllers (integration) | ≥ 70% |
| E2E critical flows | Auth, Match, Chat, Payment |

---

## 🚢 Deployment

### Staging

Triggered automatically on merge to `main`:

```bash
# Manual trigger (if needed)
pnpm run deploy:staging
```

### Production

Triggered on Git release tag `v*.*.*`:

```bash
git tag v1.0.0
git push origin v1.0.0
```

### Docker

```bash
# Build image
docker build -t matrimonial-api ./apps/api

# Run container
docker run -p 3000:3000 --env-file .env matrimonial-api
```

### Kubernetes

```bash
# Apply manifests
kubectl apply -f infrastructure/k8s/

# Check rollout
kubectl rollout status deployment/matrimonial-api
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature-name`
3. Follow the [Conventional Commits](https://www.conventionalcommits.org/) spec
4. Write tests for new functionality
5. Submit a Pull Request against `develop`

> See [`CONTRIBUTING.md`](CONTRIBUTING.md) for full guidelines.

### Commit Convention

```
feat(auth): add Apple Sign-In support
fix(chat): resolve message delivery race condition
docs(api): update swagger annotations for match endpoints
chore(deps): upgrade NestJS to v11
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).