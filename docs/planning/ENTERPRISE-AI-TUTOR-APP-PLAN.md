# Mentora Enterprise AI Tutor App Plan

## Product Positioning

Mentora should compete with modern tutoring and learning platforms by combining:

- Parent-managed student accounts similar to family learning platforms.
- Scheduled live classes and learner spaces similar to online class marketplaces.
- Human tutor scheduling, chat, and classroom tools similar to tutoring marketplaces.
- AI tutoring, guardrails, summaries, and parent visibility similar to AI learning assistants.
- Enterprise-grade audit, safety, entitlement, and compliance foundations.

The product should support online, offline, chat-based, audio/video-based, AI-led, human-led, and hybrid learning.

## Roles

| Role            | Primary Jobs                                                                      |
| --------------- | --------------------------------------------------------------------------------- |
| Parent/Guardian | Manage children, subscriptions, schedules, AI access, safety alerts, and progress |
| Student         | View schedule, join live classes, use AI tutor, practice, track progress          |
| Adult Student   | Self-manage profile, payments, schedules, AI tutor, and progress                  |
| Tutor/Mentor    | Manage availability, accept sessions, teach live classes, add notes/homework      |
| Admin           | Manage users, catalogue, plans, tutors, payments, safety, reports                 |
| Support         | Resolve tickets, payment issues, class access issues, safety escalations          |

## Mobile App Experience

### Parent Dashboard

Parents should land on a dashboard with:

- Child switcher and all-child summary.
- Today and tomorrow schedule.
- Join-as-learner action for younger children.
- Pending approvals: tutor-suggested reschedule, new class, AI safety alert.
- Subscription usage: remaining minutes, sessions, subjects, plan expiry.
- Progress cards by child and subject.
- Recent AI tutor summaries and flagged conversations.
- Messages from tutors/support.

### Student Home

Students should see:

- Next class with countdown and join status.
- Continue learning card.
- AI tutor availability status.
- Subject tiles.
- Assigned homework/practice.
- Recent progress and streak.
- Safe help button for reporting or parent support.

### Student Profile

Student Profile should be a complete, enterprise-level learner record with:

- Personal
- Academic
- Parents
- Address
- Previous Education
- Exam Scores
- Course Preference
- Documents
- Payments
- Communication History
- Activity Timeline

This is required because AI tutoring, human tutor review, parent dashboards, support, billing, safety, and audit all need a shared student context. Mobile should show a compact overview first, then section tabs or cards for the full profile. Parent mode should show the same sections for each child, but write access must follow relationship permissions.

### Learn

Learn should include:

- My subjects.
- AI tutor chat/audio/video.
- Practice questions.
- Assessments.
- Study materials, uploads, recordings.
- Recommended topics from progress gaps.

### Schedule

Schedule should include:

- Calendar and list views.
- Upcoming, past, cancelled, and missed sessions.
- Single session scheduling.
- Recurring weekly scheduling.
- Reschedule/cancel rules.
- Teacher/tutor suggested times.
- Join button enabled only within the allowed class window.
- Timezone awareness and external calendar sync.

### Classroom

The classroom should support:

- Chat, audio, video, and AI text modes.
- Whiteboard and drawing.
- File/photo/homework upload.
- Shared notes/canvas.
- Screen share where supported.
- Live captions/transcript where supported.
- Network/device preflight.
- Parent-visible attendance, summary, transcript policy, and safety flags.

### Progress

Progress should include:

- Subject progress.
- Topic mastery.
- Assessment scores.
- Tutor minutes.
- Attendance.
- Homework completion.
- AI tutor usage.
- Recommendations.
- Parent-friendly weekly reports.

### Tutor App Mode

Tutor mode should include:

- Today schedule.
- Availability calendar.
- Session requests: accept, decline, propose time.
- Student profile and academic context.
- Student previous education, course preference, exam scores, documents, communication history, and timeline when permission allows.
- Classroom launch.
- Session notes and homework.
- Attendance, summaries, invoices, and earnings.

## Scheduling Rules

Mentora should model sessions as explicit learning events:

```text
studentProfileId
subjectId
topicId?
tutorType: ai | human | hybrid
tutorUserId?
deliveryMode: chat | audio | video | offline | in_person
startAt
endAt
timezone
status
recurrenceRule?
joinWindowBeforeMinutes
joinWindowAfterMinutes
entitlementId
```

The `Join` action should be based on server time and only become active when:

- Session is scheduled and not cancelled.
- User can act for the student.
- Current time is inside join window.
- Entitlement is active and has remaining usage.
- Subject/topic is included.
- Parental controls allow the tutor type and delivery mode.
- Safety or account status does not block the student.

## Enterprise Safety

Required controls:

- Pre- and post-response moderation for AI tutor.
- Parent-visible safety alerts for minors.
- Configurable transcript visibility by age/consent/relationship.
- Immutable audit logs for user actions, tutor messages, billing, and safety events.
- Message retention and export policy.
- Quiet hours and notification controls.
- Tutor verification/background-check fields if human tutors are enabled.
- Class recording policy and consent.
- PII minimization for minors.
- Admin safety review queue.

## API Modules To Complete

Priority modules:

1. Students and parent-student relationships.
2. Academic catalogue and student subject enrollment.
3. Learning schedules and recurring sessions.
4. Learning entitlements and usage counters.
5. AI tutor session/message APIs.
6. Classroom session lifecycle APIs.
7. Progress, assessments, summaries, and reports.
8. Tutor availability, requests, notes, and payouts.
9. Safety events, moderation, audit, and admin review.

## Mobile Implementation Priority

1. Replace placeholder dashboard data with `/students`, `/schedules`, `/learning-entitlements`, `/progress`.
2. Build Student/Children list and detail screens.
3. Build complete student profile sections: personal, academic, parents, address, previous education, exam scores, course preference, documents, payments, communication history, and activity timeline.
4. Build Schedule calendar/list/create/reschedule/cancel.
5. Build AI Tutor launch screen with server-side access guard.
6. Build AI chat session with transcript, summary, and parent visibility.
7. Build tutor mode only after B2C parent/student flow is stable.
8. Remove old discovery-marketplace modules from navigation and services.

## Enterprise Launch Checklist

- Mobile typecheck/lint/test pass.
- API typecheck/lint/test pass.
- Seeder contains only Mentora data.
- OpenAPI contract includes Mentora endpoints.
- Safety test cases exist for blocked AI access.
- Payment and entitlement integration has sandbox evidence.
- Logs include correlation IDs and audit records.
- Parent can manage two child profiles end-to-end.
- Adult student can self-register end-to-end.
- Join class button behavior is validated against server time.
