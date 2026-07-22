# Mentora Color Palette

## Recommendation

Use the **Heritage Rose** palette for Mentora.

It is better for a AI tutoring product than the older bright rose palette because
it feels more premium, trustworthy, family-friendly, and marriage-oriented while
still keeping enough warmth for profiles, invitations, and match actions.

The system uses three brand roles:

- **Heritage Rose** for primary actions and emotional brand moments.
- **Trust Teal** for verification, safety, support, and information states.
- **Antique Gold** for premium membership, plan value, and celebratory accents.

Avoid making every screen pink. Rose should lead CTAs, teal should add trust and
operational clarity, and gold should stay selective so the app feels premium
rather than decorative.

## Light Theme

| Usage          | Name            | Hex       | Token                                      |
| -------------- | --------------- | --------- | ------------------------------------------ |
| Primary Brand  | Heritage Rose   | `#C7365F` | `primary`, `chatBtn`                       |
| Primary Soft   | Bridal Blush    | `#FCE8EE` | `primaryLight`, `backgroundLight`          |
| Primary Border | Rose Veil       | `#E6A9BB` | `primaryBorder`                            |
| Secondary      | Trust Teal      | `#1F7A74` | `secondary`, `info`, `verified`            |
| Secondary Soft | Teal Mist       | `#E7F4F2` | `secondaryLight`, `infoLight`              |
| Accent         | Antique Gold    | `#B8872E` | `accent`, `gold`                           |
| Accent Soft    | Champagne Wash  | `#FFF2D4` | `accentLight`, `shortlistBg`               |
| App Background | Warm Ivory      | `#FFF8F3` | `backgroundPage`                           |
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
| Primary Brand    | Rose Glow        | `#FF7A9E`                | `primary`, `chatBtn`            |
| Primary Soft     | Rose Glow Wash   | `rgba(255,122,158,0.16)` | `primaryLight`                  |
| Primary Border   | Rose Glow Border | `rgba(255,122,158,0.38)` | `primaryBorder`                 |
| Secondary        | Teal Glow        | `#5FC4BD`                | `secondary`, `info`, `verified` |
| Secondary Soft   | Deep Teal Mist   | `#183331`                | `secondaryLight`                |
| Accent           | Soft Gold        | `#E0B45A`                | `accent`, `gold`                |
| Accent Soft      | Soft Gold Wash   | `rgba(224,180,90,0.14)`  | `accentLight`                   |
| App Background   | Night Plum       | `#100D0F`                | `backgroundPage`                |
| Base Background  | Charcoal Plum    | `#171214`                | `background`                    |
| Surface          | Deep Plum        | `#1E171A`                | `surface`, `inputBackground`    |
| Elevated Surface | Raised Plum      | `#2A2024`                | `surfaceElevated`               |
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
linear-gradient(135deg, #C7365F 0%, #B8872E 100%)

/* Romantic highlight */
linear-gradient(135deg, #F5B8C7 0%, #C7365F 100%)

/* Light soft background */
linear-gradient(135deg, #FFF8F3 0%, #FCE8EE 100%)

/* Dark premium */
linear-gradient(135deg, #FF7A9E 0%, #E0B45A 100%)
```

## Component Guidance

| Component / State       | Light Theme                          | Dark Theme                           |
| ----------------------- | ------------------------------------ | ------------------------------------ |
| Primary button          | `#C7365F` background, white text     | `#FF7A9E` background                 |
| Secondary button        | `#FCE8EE` background, `#C7365F` text | Rose wash background, `#FF9AB7` text |
| Verification badge      | `#1F7A74`                            | `#5FC4BD`                            |
| Premium/membership cue  | `#B8872E`                            | `#E0B45A`                            |
| Page background         | `#FFF8F3`                            | `#100D0F`                            |
| Card/surface background | `#FFFFFF`                            | `#1E171A` / `#2A2024`                |

## Usage Rules

- Use rose for one clear primary action per screen.
- Use teal for trust signals: verified, safe, support, info, privacy, security.
- Use gold for paid plans, premium status, rewards, and celebration only.
- Keep form-heavy and admin-like screens calm: more ivory/surface, less gradient.
- Avoid neon pink, aggressive red, Tinder-style swipe-only cues, and heavy gold
  fills across entire screens.
- Avoid one-color screens. A AI tutoring app should feel warm, credible, and
  guided, not loud.

## Implementation

The palette is implemented in:

- `mentora-mobile-app/src/core/theme/colors.ts`
- `mentora-api-server/src/common/static-pages/static-page-renderer.ts`

When adding new screens, use theme tokens rather than hardcoded hex values.
