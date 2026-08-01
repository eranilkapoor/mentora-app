# Change Control Plan

Last reviewed: 2026-08-01

## Purpose

Change control protects Mentora from uncontrolled scope growth, data model churn, provider surprises, and production-readiness confusion.

## Change Categories

| Category | Examples | Approval |
| --- | --- | --- |
| Scope | Add/remove module, change MVP launch scope, add tutor marketplace. | Sponsor/Product Owner |
| Architecture | Change database, split microservice, replace auth model. | Technical Lead and Sponsor |
| Security/compliance | Change consent, retention, RBAC, tenant isolation, AI safety policy. | Security/Compliance and Sponsor |
| Provider | Add or replace AI, payment, SMS, WhatsApp, storage, monitoring provider. | Product, DevOps, Security where needed |
| Schedule | Change milestone/release date. | PM and Sponsor |
| Cost | Add recurring SaaS/vendor cost. | Sponsor/Finance |

## Change Request Template

```text
Title:
Requester:
Date:
Category:
Reason:
Affected applications:
Affected modules:
Business impact:
Technical impact:
Security/compliance impact:
Cost impact:
Schedule impact:
Alternatives:
Recommendation:
Decision:
Approver:
```

## Approval Flow

1. Submit change request.
2. PM logs the request.
3. Technical Lead assesses implementation and risk.
4. Security/Compliance reviews if data, auth, payments, AI safety, or legal scope changes.
5. Sponsor approves, rejects, or defers.
6. Roadmap and docs are updated.
7. Implementation proceeds only after approval for major changes.

## Emergency Changes

Emergency fixes for outage, security, payment, data leak, or student safety issues can be implemented immediately with Technical Lead approval, then documented after stabilization.
