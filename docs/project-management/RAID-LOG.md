# RAID Log

Last reviewed: 2026-08-01

## Risks

| ID | Risk | Probability | Impact | Exposure | Owner | Response | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R1 | Live provider credentials and callbacks are not ready for AI, payments, communications, push, OCR, dialer, geo, or monitoring. | 3 | 3 | 9 | DevOps/Ops | Configure selected providers and run smoke tests before production. | Open |
| R2 | Tenant/branch/role access is not fully verified in staging. | 2 | 3 | 6 | QA/Tech Lead | Run tenant matrix UAT and access review. | Open |
| R3 | AI tutor safety, moderation, and usage metering are not production-validated. | 3 | 3 | 9 | Product/Security | Select provider, validate moderation, add escalation SOP. | Open |
| R4 | Mobile native release issues appear after only web/typecheck validation. | 2 | 3 | 6 | Mobile/QA | Run Android/iOS release builds and device QA. | Open |
| R5 | CRM scope expands faster than QA and documentation can keep up. | 2 | 2 | 4 | PM | Use change control and release slicing. | Open |

## Assumptions

| ID | Assumption | Validation needed | Owner | Status |
| --- | --- | --- | --- | --- |
| A1 | MongoDB remains acceptable as primary operational datastore for current scale. | Load and slow-query test in staging. | Tech Lead | Open |
| A2 | CRM customers will use desktop/tablet, not phone-first CRM. | Demo feedback and usage analytics. | Product | Open |
| A3 | Providers can be activated by environment variables and tenant-level configs. | Provider smoke tests. | DevOps | Open |
| A4 | English and Hindi are enough for initial mobile launch. | Market validation. | Product | Open |

## Issues

| ID | Issue | Impact | Owner | Due | Status |
| --- | --- | --- | --- | --- | --- |
| I1 | Production infrastructure is not yet documented as provisioned and tested. | Blocks production launch. | DevOps | Before staging | Open |
| I2 | Legal/security sign-off evidence is not yet attached. | Blocks live student/parent launch. | Security/Compliance | Before production | Open |
| I3 | Provider smoke-test evidence is not yet recorded. | Blocks provider-backed modules. | DevOps/Ops | Before production | Open |

## Dependencies

| ID | Dependency | Needed for | Owner | Status |
| --- | --- | --- | --- | --- |
| D1 | AI provider credentials and moderation policy | AI tutor production launch | Product/DevOps | Open |
| D2 | Payment gateway and store billing setup | Revenue and subscriptions | Finance/DevOps | Open |
| D3 | Email/SMS/WhatsApp approvals | Communications and campaigns | Ops | Open |
| D4 | Production domain and SSL | Public website/legal URLs | DevOps | Open |
| D5 | Monitoring/APM and backup provider | Production operations | DevOps | Open |
