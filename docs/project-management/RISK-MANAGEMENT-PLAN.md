# Risk Management Plan

Last reviewed: 2026-08-01

## Risk Method

Risks are scored by probability and impact:

| Score | Probability | Impact |
| --- | --- | --- |
| 1 | Low | Minor inconvenience |
| 2 | Medium | Release or workflow impact |
| 3 | High | Business, security, revenue, compliance, or launch impact |

Risk exposure = probability x impact.

## Risk Categories

- Product scope.
- Technical architecture.
- Data and tenant isolation.
- Security and compliance.
- Provider/vendor dependency.
- Payment and revenue leakage.
- AI safety and moderation.
- Quality and release readiness.
- Operations and support.

## Response Strategies

| Strategy | Use when |
| --- | --- |
| Avoid | Risk is unacceptable, such as data leakage or illegal processing. |
| Mitigate | Risk can be reduced through code, controls, QA, or process. |
| Transfer | Risk belongs to vendor/insurance/contractual SLA. |
| Accept | Risk is known, low enough, and approved. |

## Critical Risk Threshold

Any risk with exposure 6 or higher requires owner assignment, mitigation plan, and weekly review.

Any risk involving student safety, payment loss, tenant data leakage, auth bypass, or legal non-compliance blocks production until closed or formally accepted by the sponsor and security/compliance owner.
