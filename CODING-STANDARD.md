# Commonly accepted industry-standard naming rules used in professional NestJS applications.

---

# 1. General Naming Conventions

| Item                  | Convention              | Example                   |
| --------------------- | ----------------------- | ------------------------- |
| Folders               | kebab-case              | `user-profile/`           |
| File names            | kebab-case              | `user-profile.service.ts` |
| Classes               | PascalCase              | `UserProfileService`      |
| Interfaces            | PascalCase              | `UserProfile`             |
| Enums                 | PascalCase              | `UserRole`                |
| Variables             | camelCase               | `userProfile`             |
| Functions/Methods     | camelCase               | `getUserProfile()`        |
| Constants             | UPPER_SNAKE_CASE        | `MAX_RETRY_COUNT`         |
| DTOs                  | PascalCase + Dto suffix | `CreateUserDto`           |
| Entities/Schemas      | PascalCase              | `UserEntity`              |
| Types                 | PascalCase              | `UserPayload`             |
| Decorators            | PascalCase              | `CurrentUser`             |
| Environment Variables | UPPER_SNAKE_CASE        | `DATABASE_URL`            |

---

# 2. Folder Structure Standard

Professional NestJS projects usually follow:

```bash
src/
│
├── common/
├── config/
├── modules/
├── shared/
├── database/
├── main.ts
└── app.module.ts
```

---

# 3. Module Naming

## Folder

```bash
users/
auth/
payment-gateway/
```

## Files

```bash
users.module.ts
users.service.ts
users.controller.ts
users.repository.ts
```

---

# 4. Controller Naming

## File

```bash
users.controller.ts
```

## Class

```ts
export class UsersController {}
```

### Rules

* Always plural resource naming preferred
* Controller suffix mandatory

---

# 5. Service Naming

## File

```bash
users.service.ts
```

## Class

```ts
export class UsersService {}
```

### Rules

* Business logic belongs here
* Service suffix mandatory

---

# 6. DTO Naming

DTOs are one of the most standardized parts of NestJS.

## Files

```bash
create-user.dto.ts
update-user.dto.ts
login.dto.ts
```

## Classes

```ts
export class CreateUserDto {}
export class UpdateUserDto {}
```

### Common DTO Patterns

| Purpose    | Naming            |
| ---------- | ----------------- |
| Create     | `CreateUserDto`   |
| Update     | `UpdateUserDto`   |
| Response   | `UserResponseDto` |
| Query      | `UserQueryDto`    |
| Filter     | `UserFilterDto`   |
| Pagination | `PaginationDto`   |

---

# 7. Entity / Schema Naming

## TypeORM

```bash
user.entity.ts
```

```ts
export class UserEntity {}
```

## Mongoose

```bash
user.schema.ts
```

```ts
export class User {}
export const UserSchema = SchemaFactory.createForClass(User);
```

---

# 8. Interface Naming

Modern TypeScript style usually avoids `I` prefix.

## Recommended

```ts
export interface UserPayload {}
```

## Avoid

```ts
IUserPayload
```

---

# 9. Enum Naming

## File

```bash
user-role.enum.ts
```

## Enum

```ts
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}
```

---

# 10. Constants Naming

## File

```bash
app.constants.ts
auth.constants.ts
```

## Variables

```ts
export const MAX_LOGIN_ATTEMPTS = 5;
```

---

# 11. Environment Variables

Always:

```env
DATABASE_URL=
JWT_SECRET=
REDIS_HOST=
AWS_ACCESS_KEY_ID=
```

---

# 12. Variable Naming

## Standard

```ts
const userProfile = {};
const accessToken = '';
const isActive = true;
```

## Boolean Variables

Use:

* `is`
* `has`
* `can`
* `should`

Examples:

```ts
isVerified
hasPermission
canDelete
shouldRetry
```

---

# 13. Function Naming

Functions should always describe actions.

## Good

```ts
createUser()
findUserById()
validateOtp()
sendEmail()
```

## Bad

```ts
userData()
process()
handle()
```

---

# 14. Async Function Naming

Not mandatory, but many teams use action-based naming:

```ts
async getUser()
async createOrder()
```

Avoid unnecessary:

```ts
getUserAsync()
```

(TypeScript already knows it returns Promise.)

---

# 15. Repository Naming

## File

```bash
users.repository.ts
```

## Class

```ts
export class UsersRepository {}
```

---

# 16. Guard Naming

## File

```bash
jwt-auth.guard.ts
roles.guard.ts
```

## Class

```ts
export class JwtAuthGuard {}
```

---

# 17. Interceptor Naming

```bash
logging.interceptor.ts
transform.interceptor.ts
```

```ts
export class LoggingInterceptor {}
```

---

# 18. Middleware Naming

```bash
logger.middleware.ts
```

```ts
export class LoggerMiddleware {}
```

---

# 19. Pipe Naming

```bash
validation.pipe.ts
parse-object-id.pipe.ts
```

```ts
export class ValidationPipe {}
```

---

# 20. Exception Filter Naming

```bash
http-exception.filter.ts
```

```ts
export class HttpExceptionFilter {}
```

---

# 21. Decorator Naming

## File

```bash
current-user.decorator.ts
roles.decorator.ts
```

## Function

```ts
export const CurrentUser = createParamDecorator(...)
```

---

# 22. Test File Naming

## Unit Test

```bash
users.service.spec.ts
```

## E2E Test

```bash
app.e2e-spec.ts
```

---

# 23. API Route Naming

REST standards:

```ts
/users
/users/:id
/orders
/payment-transactions
```

### Rules

* lowercase
* kebab-case
* plural resources

---

# 24. Database Collection/Table Naming

## Recommended

### MongoDB Collections

```bash
users
payment_transactions
```

### SQL Tables

```bash
users
order_items
```

---

# 25. Common Professional Best Practices

## Use Singular Class Names

```ts
UserEntity
OrderService
```

## Use Plural Module Names

```bash
users/
orders/
products/
```

---

# 26. Example Full Module Structure

```bash
users/
│
├── dto/
│   ├── create-user.dto.ts
│   └── update-user.dto.ts
│
├── schemas/
│   └── user.schema.ts
│
├── interfaces/
│   └── user-payload.interface.ts
│
├── enums/
│   └── user-role.enum.ts
│
├── users.controller.ts
├── users.service.ts
├── users.repository.ts
├── users.module.ts
└── users.constants.ts
```

---

# 27. Recommended Enterprise Architecture

For large-scale projects:

```bash
src/
│
├── common/
├── config/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── payments/
│   └── notifications/
│
├── shared/
├── infrastructure/
├── database/
├── queues/
├── websocket/
└── main.ts
```

---

# 28. Naming Mistakes to Avoid

## ❌ Bad

```bash
UserService.ts
userService.ts
USER_SERVICE.ts
```

## ✅ Correct

```bash
users.service.ts
```

---

# 29. Most Important Rule

The best naming convention is:

* predictable
* consistent
* descriptive
* scalable

A consistent codebase is more important than personal preference.

---

# 30. Official References

* [NestJS Official Documentation](https://nestjs.com/?utm_source=chatgpt.com)
* [TypeScript Naming Conventions Guide](https://www.typescriptlang.org/docs/?utm_source=chatgpt.com)
* [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript?utm_source=chatgpt.com)





# EXPO BASED REACT NATIVE APPLICATION INDUSTRY USED STANDARD RULES :

Yes. For your **Expo React Native matrimonial app**, follow this enterprise rulebook.

## 1. Recommended folder structure

```bash
src/
├── app/
│   ├── navigation/
│   ├── providers/
│   └── store/
│
├── assets/
├── common/
│   ├── components/
│   ├── constants/
│   ├── hooks/
│   ├── utils/
│   ├── theme/
│   ├── types/
│   └── validations/
│
├── features/
│   ├── auth/
│   ├── onboarding/
│   ├── profiles/
│   ├── matches/
│   ├── chats/
│   ├── membership/
│   ├── notifications/
│   └── settings/
│
├── services/
│   ├── api/
│   ├── socket/
│   ├── storage/
│   └── analytics/
│
└── config/
```

Use `features/` for business screens, and `common/` for reusable code.

## 2. Naming rules

```bash
login.screen.tsx
profile-card.component.tsx
use-auth.hook.ts
auth.api.ts
auth.slice.ts
auth.types.ts
auth.validation.ts
app-theme.constants.ts
```

Classes/types/components:

```ts
LoginScreen
ProfileCard
useAuth
AuthState
UserProfile
CreateProfilePayload
```

Variables/functions:

```ts
const userProfile = {};
const isVerified = true;

const getUserProfile = () => {};
const submitOnboardingForm = () => {};
```

## 3. Feature module structure

Example:

```bash
features/
└── profiles/
    ├── screens/
    │   ├── profile-details.screen.tsx
    │   └── edit-profile.screen.tsx
    ├── components/
    │   └── profile-card.component.tsx
    ├── hooks/
    │   └── use-profile.hook.ts
    ├── store/
    │   └── profile.slice.ts
    ├── api/
    │   └── profile.api.ts
    ├── types/
    │   └── profile.types.ts
    └── validations/
        └── profile.validation.ts
```

## 4. Best coding rules

Use **TypeScript strictly**. Expo officially supports TypeScript, and React Native also recommends TypeScript for modern projects. ([Expo Documentation][1])

Use **functional components only**:

```tsx
export function ProfileCard() {}
```

Avoid default export for most files:

```ts
export { ProfileCard };
```

Use `default export` only for Expo Router pages if required.

## 5. Theme standard

Create one theme system:

```bash
common/theme/
├── colors.ts
├── spacing.ts
├── typography.ts
├── radius.ts
├── shadows.ts
└── index.ts
```

Use tokens, not hardcoded values:

```tsx
backgroundColor: colors.background
padding: spacing.md
borderRadius: radius.lg
```

Avoid this:

```tsx
backgroundColor: '#ffffff'
padding: 17
```

## 6. API rules

Use one API layer:

```bash
services/api/
├── base-api.ts
├── endpoints.ts
├── api-error-handler.ts
└── auth-token-handler.ts
```

Use environment variables for API URLs. Expo documents environment variables for different app behavior across environments, and EAS supports env values for builds. ([Expo Documentation][2])

Recommended:

```env
EXPO_PUBLIC_API_BASE_URL=https://api.matchmate.com
EXPO_PUBLIC_API_VERSION=/api/v1
EXPO_PUBLIC_ENV=production
```

## 7. Storage rules

Use:

```bash
SecureStore
```

for tokens.

Use:

```bash
AsyncStorage
```

for non-sensitive preferences only.

React Native’s security guide specifically highlights secure storage, authentication, and network security as important areas. ([React Native][3])

## 8. Performance rules

React Native targets smooth native UI, ideally around 60 FPS, so avoid unnecessary re-renders. ([React Native][4])

Use:

```tsx
React.memo()
useMemo()
useCallback()
FlatList
FlashList
```

Avoid:

```tsx
ScrollView
```

for long lists like profiles, matches, chats.

## 9. Screen naming

For your app:

```bash
auth/
├── login.screen.tsx
├── register.screen.tsx
├── forgot-password.screen.tsx
└── otp-verification.screen.tsx

onboarding/
├── personal-details.screen.tsx
├── physical-details.screen.tsx
├── education-career.screen.tsx
├── family-details.screen.tsx
├── partner-preferences.screen.tsx
├── upload-photos.screen.tsx
└── review-profile.screen.tsx

matches/
├── matches.screen.tsx
├── match-details.screen.tsx
└── match-filters.screen.tsx

chats/
├── chat-list.screen.tsx
└── chat-room.screen.tsx
```

## 10. Final rule

For your Match Mate app, use this standard:

| Area        | Rule                    |
| ----------- | ----------------------- |
| folders     | `kebab-case`            |
| screens     | `name.screen.tsx`       |
| components  | `name.component.tsx`    |
| hooks       | `use-name.hook.ts`      |
| api files   | `feature.api.ts`        |
| store files | `feature.slice.ts`      |
| types       | `feature.types.ts`      |
| validations | `feature.validation.ts` |
| constants   | `feature.constants.ts`  |
| components  | `PascalCase`            |
| functions   | `camelCase`             |
| booleans    | `is/has/can/should`     |

Final recommendation: use **feature-based architecture**, strict TypeScript, centralized theme, centralized API layer, secure token storage, and avoid hardcoded UI values.

[1]: https://docs.expo.dev/guides/typescript/?utm_source=chatgpt.com "Using TypeScript"
[2]: https://docs.expo.dev/guides/environment-variables/?utm_source=chatgpt.com "Environment variables in Expo"
[3]: https://reactnative.dev/docs/security?utm_source=chatgpt.com "Security"
[4]: https://reactnative.dev/docs/performance?utm_source=chatgpt.com "Performance Overview"
