# Mentora Learning Plan Packaging

## Goal

Package Mentora plans around learning access, parent controls, AI tutor minutes, schedules, progress reporting, and optional mentor support.

## Plan Families

| Family | Intended User | Billing Terms | Core Value |
| --- | --- | --- | --- |
| Free | Trial users, parents evaluating the app | Free | Basic profile, limited schedule preview, limited AI tutor samples |
| Self-Service | Independent students and parents | Monthly, quarterly, half-yearly, yearly | Scheduled AI tutor access, subject entitlements, learning history |
| Mentor Support | Families needing guided help | Half-yearly, yearly, custom | Human mentor support, periodic review, priority support |
| Enterprise / Custom | Large family plans, institutions later | Custom | Governance, reporting, support SLA, configurable entitlements |

## Feature Groups

- Student profiles and parent-managed child profiles.
- Academic records, subjects, goals, course preferences, and accessibility needs.
- Learning schedules, reminders, and recurring sessions.
- AI tutor minutes, subject entitlements, and session limits.
- Parent controls: schedule windows, daily limits, blocked subjects, history visibility.
- Progress: session summaries, topic progress, assessment attempts, reports.
- Support: priority support, mentor review, safety escalation.
- Billing: subscription, invoices, refunds, restore purchase, entitlement audit.

## Suggested Self-Service Tiers

| Feature | Free | Silver | Gold | Platinum |
| --- | ---: | ---: | ---: | ---: |
| Student profiles | 1 | 1 | 2 | 4 |
| Included subjects | 1 sample | 2 | 4 | Unlimited within catalogue |
| AI tutor minutes/month | Limited sample | 300 | 900 | 1800 |
| Scheduled sessions/week | 1 sample | 3 | 7 | 14 |
| Session summaries | Limited | Yes | Yes | Yes |
| Parent progress report | Basic | Monthly | Weekly | Weekly + detailed |
| Assessment attempts | No | Basic | Standard | Advanced |
| Priority support | No | No | Yes | Yes |

## Mentor Support Packaging

- Dedicated mentor review cadence.
- Parent/student learning plan setup.
- Monthly progress consultation.
- Custom subject plan and revision calendar.
- Priority support and safety review escalation.

## Revenue Leakage Controls

- Entitlement must be checked per student, subject, schedule, session, and device.
- Parent accounts can manage and review but cannot consume student AI tutor minutes directly.
- A student profile should not run parallel paid sessions beyond plan/device rules.
- Session starts must create usage records atomically.
- Store and server subscriptions must reconcile before granting paid entitlements.
- Refund/cancel/chargeback events must revoke future entitlements without deleting historical records.

## Open Decisions

- Final AI tutor minute allowances by tier.
- Whether multiple child profiles share a family pool or receive per-student quotas.
- Whether human mentor support launches in MVP or after AI tutor stability.
- Country-specific child data and billing rules.
