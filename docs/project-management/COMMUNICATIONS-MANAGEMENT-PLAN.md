# Communications Management Plan

Last reviewed: 2026-08-01

## Communication Goals

- Keep scope, schedule, risk, and production readiness visible.
- Separate code-side readiness from live-production readiness.
- Escalate blockers early.
- Give stakeholders a clear go/no-go view before demo, staging, and production releases.

## Communication Matrix

| Audience | Information | Frequency | Format |
| --- | --- | --- | --- |
| Sponsor/Product Owner | Scope, milestones, blockers, decisions, budget risks. | Weekly and before releases | Status report |
| Engineering team | Current work, technical blockers, quality gates, code risks. | Daily or per work session | Standup/update |
| QA | Release scope, acceptance criteria, test data, defect priority. | Per release cycle | Test plan and defect report |
| DevOps/Ops | Environment, secrets, deployment, monitoring, rollback, provider readiness. | Per release gate | Runbook/release checklist |
| Security/Compliance | Data handling, consent, legal pages, audit, retention, access controls. | Before staging and production | Security review |
| Customer/demo stakeholders | Demo scope, known limitations, production blockers, next milestones. | Per demo | Demo notes |

## Standard Reports

| Report | Contents |
| --- | --- |
| Weekly project status | Completed, in progress, next, risks, issues, decisions needed. |
| Release readiness report | Build checks, QA status, provider readiness, blockers, go/no-go. |
| RAID report | Top risks, assumptions, issues, dependencies, owners, due dates. |
| Change report | Approved/rejected changes and impact. |

## Escalation Path

1. Team owner identifies blocker.
2. PM records in RAID log.
3. Technical Lead confirms impact.
4. Sponsor decides scope/schedule/budget tradeoff where needed.
5. Security/Compliance owner approves when blocker affects legal, data, auth, or safety.

## Communication Rules

- Do not describe demo data or provider placeholders as production-ready.
- Always include production blockers in customer-facing demo notes.
- Use exact dates for release and review status.
- Record decisions in the relevant project-management document.
