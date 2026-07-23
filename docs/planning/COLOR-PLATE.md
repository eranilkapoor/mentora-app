# Mentora Color Palette

## Recommendation

Use the **Learning Aurora** palette for Mentora.

It is designed for an AI tutoring product: calm enough for parents and enterprise review, energetic enough for students, and modern enough to signal AI-assisted learning without feeling like a game or marketplace.

The system uses three brand roles:

- **Mentora Blue** for primary actions, learning flow, and brand moments.
- **Trust Teal** for safety, support, verification, and parent controls.
- **Achievement Amber** for premium membership, milestones, and celebratory accents.

Avoid making every screen one color. Blue should lead CTAs, teal should add trust and operational clarity, and amber should stay selective so the app feels premium rather than decorative.

## Light Theme

| Usage          | Name            | Hex       | Token                                      |
| -------------- | --------------- | --------- | ------------------------------------------ |
| Primary Brand  | Mentora Blue    | `#2563EB` | `primary`, `chatBtn`                       |
| Primary Soft   | Blue Mist       | `#EAF2FF` | `primaryLight`, `backgroundLight`          |
| Primary Border | Blue Veil       | `#BBD3FF` | `primaryBorder`                            |
| Secondary      | Trust Teal      | `#1F7A74` | `secondary`, `info`, `verified`            |
| Secondary Soft | Teal Mist       | `#E7F4F2` | `secondaryLight`, `infoLight`              |
| Accent         | Achievement Amber | `#B7791F` | `accent`, `gold`                         |
| Accent Soft    | Amber Wash      | `#FFF4D6` | `accentLight`, `shortlistBg`               |
| App Background | Learning White  | `#F7FAFF` | `backgroundPage`                           |
| Surface        | Pure White      | `#FFFFFF` | `background`, `surface`, `surfaceElevated` |
| Text Primary   | Ink Plum        | `#252126` | `textPrimary`                              |
| Text Body      | Soft Plum       | `#4B4147` | `textBody`                                 |
| Text Secondary | Muted Mauve     | `#61545A` | `textSecondary`                            |
| Text Muted     | Dusty Mauve     | `#8F8188` | `textMuted`                                |
| Border         | Blush Gray      | `#E8D7DC` | `border`                                   |
| Divider        | Pale Blush Gray | `#EDDFE3` | `divider`                                  |
| Strong Border  | Rose Gray       | `#D7B8C2` | `borderStrong`, `inputBorder`              |
| Success        | Ceremony Green  | `#2E7D57` | `success`                                  |
| Warning        | Saffron Amber   | `#B7791F` | `warning`                                  |
| Error / Danger | Sindoor Red     | `#B4233C` | `error`, `danger`                          |
| Link           | Deep Rose Link  | `#B02E55` | `link`                                     |

## Dark Theme

| Usage            | Name             | Hex / Value              | Token                           |
| ---------------- | ---------------- | ------------------------ | ------------------------------- |
| Primary Brand    | Blue Glow        | `#7BA7FF`                | `primary`, `chatBtn`            |
| Primary Soft     | Blue Glow Wash   | `rgba(123,167,255,0.16)` | `primaryLight`                  |
| Primary Border   | Blue Glow Border | `rgba(123,167,255,0.38)` | `primaryBorder`                 |
| Secondary        | Teal Glow        | `#5FC4BD`                | `secondary`, `info`, `verified` |
| Secondary Soft   | Deep Teal Mist   | `#183331`                | `secondaryLight`                |
| Accent           | Soft Gold        | `#E0B45A`                | `accent`, `gold`                |
| Accent Soft      | Soft Gold Wash   | `rgba(224,180,90,0.14)`  | `accentLight`                   |
| App Background   | Night Navy       | `#0B1120`                | `backgroundPage`                |
| Base Background  | Deep Navy        | `#111827`                | `background`                    |
| Surface          | Slate Surface    | `#172033`                | `surface`, `inputBackground`    |
| Elevated Surface | Raised Slate     | `#1F2A44`                | `surfaceElevated`               |
| Text Primary     | Pearl White      | `#FFF7FA`                | `textPrimary`                   |
| Text Body        | Pearl Mauve      | `#F0E6EA`                | `textBody`                      |
| Text Secondary   | Soft Pearl Mauve | `#E6D8DE`                | `textSecondary`                 |
| Text Muted       | Muted Pearl      | `#BAA8B1`                | `textMuted`                     |
| Border           | Plum Border      | `#42323A`                | `border`                        |
| Strong Border    | Strong Plum      | `#5E4852`                | `borderStrong`, `inputBorder`   |
| Success          | Fresh Green      | `#5AD18A`                | `success`                       |
| Warning          | Gold Warning     | `#F0C15A`                | `warning`                       |
| Error / Danger   | Soft Coral Red   | `#FF7A7A`                | `error`, `danger`               |
| Link             | Rose Link Glow   | `#FF9AB7`                | `link`                          |

## Gradients

Use gradients sparingly, mostly for membership headers, onboarding moments, and
premium CTAs. Standard screens should rely on solid surfaces and tokenized
states.

```css
/* Primary brand */
linear-gradient(135deg, #2563EB 0%, #1F7A74 100%)

/* Learning highlight */
linear-gradient(135deg, #BBD3FF 0%, #2563EB 100%)

/* Light soft background */
linear-gradient(135deg, #F7FAFF 0%, #EAF2FF 100%)

/* Dark premium */
linear-gradient(135deg, #7BA7FF 0%, #5FC4BD 100%)
```

## Component Guidance

| Component / State       | Light Theme                          | Dark Theme                           |
| ----------------------- | ------------------------------------ | ------------------------------------ |
| Primary button          | `#2563EB` background, white text     | `#7BA7FF` background                 |
| Secondary button        | `#EAF2FF` background, `#2563EB` text | Blue wash background, `#AFC7FF` text |
| Verification badge      | `#1F7A74`                            | `#5FC4BD`                            |
| Premium/membership cue  | `#B8872E`                            | `#E0B45A`                            |
| Page background         | `#FFF8F3`                            | `#100D0F`                            |
| Card/surface background | `#FFFFFF`                            | `#1E171A` / `#2A2024`                |

## Usage Rules

- Use blue for one clear primary action per screen.
- Use teal for trust signals: verified, safe, support, info, privacy, security.
- Use gold for paid plans, premium status, rewards, and celebration only.
- Keep form-heavy and admin-like screens calm: more ivory/surface, less gradient.
- Avoid neon purple, aggressive red, swipe-only marketplace cues, and heavy amber
  fills across entire screens.
- Avoid one-color screens. An AI tutoring app should feel focused, credible, and
  guided, not loud.

## Implementation

The palette is implemented in:

- `mentora-mobile-app/src/core/theme/colors.ts`
- `mentora-api-server/src/common/static-pages/static-page-renderer.ts`

When adding new screens, use theme tokens rather than hardcoded hex values.
