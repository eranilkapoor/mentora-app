# MatchMate Prompt Audit Tracker

Last reviewed: 2026-06-18

## Fixed In This Pass


## Recommended Enum Rule

- Put enums in `common/enums` only when two or more bounded contexts own the
  contract together, such as roles, permissions, plan tiers, feature keys,
  subscription status, user profile taxonomy, and shared media/MIME values.
- Put enums in `src/modules/<module>/enums` when the concept belongs to one
  module, even if other modules read it. Example: verification status belongs
  to safety, media moderation status belongs to profiles, and consent type
  belongs to settings.
- Keep tiny schema-only literals inline only when they are not exported,
  repeated, validated in DTOs, or queried by services.
