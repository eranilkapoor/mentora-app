# Notification Template Samples

This folder contains sample notification templates for common matrimonial app events.

The sample records match the `NotificationTemplate` schema fields and can be used as reference data for API payloads or database seeding scripts.

## Files

- `notification-template-samples.json`: Unified template objects that include in-app, push, email, and SMS content.
- `email-only-samples.json`: Extracted email subject/body examples by event.
- `sms-only-samples.json`: Short SMS examples by event.
- `push-only-samples.json`: Push title/body examples by event.

## Notes

- `{{variable}}` placeholders are intended for runtime rendering.
- `category` values are aligned with current allowed categories.
- Channel defaults are set per event use case and can be adjusted.
