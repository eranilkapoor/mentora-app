# Cost Management Plan

Last reviewed: 2026-08-01

## Cost Categories

| Category | Examples |
| --- | --- |
| Engineering | Backend, mobile, CRM, website, QA, DevOps, security. |
| Infrastructure | API hosting, MongoDB, Redis, queues, storage, CDN, monitoring. |
| Provider services | AI model, email, SMS, WhatsApp, push, payments, OCR, dialer, calendar, geo, webinar, accounting. |
| Compliance and legal | Privacy policy, terms, child/student data review, app-store compliance, contracts. |
| QA and release | Devices, test accounts, app-store fees, staging environments, test automation. |
| Operations | Support tools, incident response, backup storage, uptime monitoring. |

## Cost Estimation Approach

Estimate each module by:

- Build effort.
- QA effort.
- Provider setup effort.
- Monthly provider/infrastructure cost.
- Support and maintenance cost.
- Compliance review cost.

## Cost Controls

- Do not enable paid providers without launch-scope approval.
- Track AI usage, SMS, WhatsApp, email, storage, and payment gateway costs separately.
- Use organization-level cost attribution where possible.
- Require approval for new recurring SaaS subscriptions.
- Monitor cost per lead, cost per enrolled student, AI cost per learning session, and support cost per active organization.

## Budget Risks

| Risk | Control |
| --- | --- |
| AI usage cost grows faster than subscription revenue | Enforce entitlements, usage metering, plan limits, and alerts. |
| SMS/WhatsApp bulk campaigns overrun budget | Require campaign approval and spend caps. |
| Storage and recordings grow unexpectedly | Define retention, archiving, and deletion policy. |
| Provider pricing changes | Keep provider abstraction and quarterly cost review. |

## Cost Reporting

Monthly cost report should include:

- Infrastructure spend.
- Provider spend by category.
- Cost per organization.
- Cost per lead/admission.
- Cost per active learner.
- Budget variance and corrective actions.
