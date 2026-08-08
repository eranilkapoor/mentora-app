# Mentora SaaS Billing Plan

Last reviewed: 2026-08-08

Mentora supports two billing audiences:

- Consumer billing for students and parents using the mobile app/public website.
- Organization billing for education organizations using the CRM, mobile companion flows, integrations, admissions, finance, reporting, and learning handoff.

## Plan Catalog

All plans live in the shared `plans` collection, but each plan has an audience:

| Audience       | Plan type                                    | Used by                                                                                       |
| -------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `consumer`     | `self_service`, `assisted`, `learning_boost` | Students, parents, guardians, and direct learning subscriptions                               |
| `organization` | `organization`                               | Schools, colleges, universities, coaching brands, institutes, franchises, and education teams |

Customer-facing APIs must only show consumer plans. Admin CRM APIs can list both consumer and organization plans.

Seeded organization plans:

| Plan                    | Billing | Intended customer                             | Key limits                                         |
| ----------------------- | ------- | --------------------------------------------- | -------------------------------------------------- |
| `ORG_STARTER_MONTHLY`   | Monthly | Small institute or single-city branch network | 25 users, 3 branches, 10k leads, 50 GB storage     |
| `ORG_GROWTH_MONTHLY`    | Monthly | Multi-branch admissions/marketing team        | 100 users, 15 branches, 100k leads, 250 GB storage |
| `ORG_ENTERPRISE_YEARLY` | Yearly  | Large education group or franchise network    | 1000 users, 100 branches, 1M leads, 2 TB storage   |

## Organization Subscription Model

Organization subscriptions are stored in `subscriptions` with:

- `organizationId`
- `userId` as the actor/admin who created or purchased the subscription
- `planId`
- `status`
- `startDate`
- `endDate`
- `autoRenew`
- `paymentProvider`
- audit metadata

Only one active/trial/grace organization subscription should exist per organization at a time. Assigning a new organization subscription expires the previous active organization subscription.

## Payments And Invoices

Payments and invoices support both ownership styles:

- Consumer payment: `userId` only
- Organization payment: `userId` plus `organizationId`

Organization payments use purpose `organization_subscription`. Generated invoices also store `organizationId`, so CRM finance teams can filter, export, reconcile, and audit by organization.

## Admin CRM Operations

Platform super admins and authorized platform finance/admin users can:

- List organization SaaS plans.
- View selected organization billing summary.
- Assign a manual/offline organization subscription.
- Filter payments by organization.
- View organization invoices and payment history.
- Reconcile payments and export finance ledgers.

Organization admins and finance users can view billing within their assigned organization if RBAC permits.

## Implemented Enterprise Billing Capabilities

The code-side enterprise billing foundation is implemented with dummy/sandbox-ready configuration:

- Razorpay-style checkout payloads for organization subscriptions.
- Stripe-style PaymentIntent payloads for organization subscriptions.
- Provider webhook endpoints:
  - `POST /api/v1/payments/webhook/razorpay`
  - `POST /api/v1/payments/webhook/stripe`
- Provider HMAC verification using configured dummy or real secrets.
- Organization payment purpose: `organization_subscription`.
- Organization-scoped payments, subscriptions, invoices, contracts, dunning events, and credit notes.
- Proration preview API for plan upgrades/downgrades.
- Usage/limit API for seats, branches, leads, storage, and AI credits.
- Contract records with purchase order, legal entity, billing contact, tax number, value, dates, terms, and plan limits.
- Dunning records for payment failures, renewal reminders, grace period, overdue, and suspension workflows.
- Refund-triggered credit note creation.
- Immutable invoice metadata with demo storage key, URL, checksum, and generated timestamp.

Admin APIs:

- `GET /api/v1/admin/payments/organization/usage?organizationId=...`
- `GET /api/v1/admin/payments/organization/proration?organizationId=...&newPlanId=...`
- `POST /api/v1/admin/payments/organization/contracts`
- `POST /api/v1/admin/payments/organization/dunning`

## Live Production Switches

The flows are code-ready with dummy configuration. To process real money, configure:

- Razorpay key ID, key secret, webhook secret, and live webhook URL.
- Stripe publishable key, secret key, webhook signing secret, and live webhook URL.
- Production invoice/PDF object storage bucket and retention policy.
- Legal invoice numbering rules, GST/tax validation, and credit note policy.
- Payment gateway settlement reports and accounting export credentials.
- Dunning notification templates and finance approval routing.
