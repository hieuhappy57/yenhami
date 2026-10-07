# Design System Master File — Yến Sào Hà Mi (UI/UX Pro Max)

> **LOGIC:** When building or reviewing a specific page, first check `design-system/yen-sao-ha-mi/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Yến Sào Hà Mi (`yenhami.vercel.app`)
**Category:** Luxury Wellness Food & Gift E-commerce
**Engine:** UI/UX Pro Max + Modern Web Guidance

---

## Global Rules

### 1. Brand Color Palette & Contrast Ratios

| Role | Hex | CSS Variable | WCAG Contrast Note |
|------|-----|--------------|--------------------|
| Primary (Canopy Green) | `#155132` | `--canopy-green` | > 8.9:1 against `#FFFCF4` / `#FFFFFF` |
| Primary Hover | `#0E3B23` | `--canopy-green-dark` | > 11.5:1 against `#FFFCF4` |
| On Primary | `#FFFCF4` | `--ivory` | Warm ivory text on green surfaces |
| Heritage Gold (Borders / Badges) | `#BD9342` | `--heritage-gold` | 3.1:1 non-text border/accent token |
| Dark Gold (Accessible Text Accent) | `#8A6632` | `--dark-gold` | >= 4.7:1 against `#FFFCF4` / `#FFFFFF` |
| Background | `#FFFFFF` | `--color-background` | Clean editorial surface |
| Secondary Surface | `#FFFCF4` | `--ivory` | Warm cream card/section surface |
| Body Foreground (Grove Ink) | `#2B433A` | `--grove-ink` | > 9.8:1 against `#FFFFFF` |
| Destructive / Error | `#B91C1C` | `--color-destructive` | >= 6.4:1 against `#FEF2F2` |
| Focus Ring | `#155132` | `--canopy-green` | 2px solid with 2px offset (`:focus-visible`) |

### 2. Typography & Vietnamese Readability

- **Heading Font:** `Plus Jakarta Sans` (`--font-heading`) — geometric-humanist display font with full Vietnamese diacritic support.
- **Body Font:** `Be Vietnam Pro` (`--font-be-vietnam`) — engineered specifically for Vietnamese legibility at 12px–18px.
- **Heading Line Balance:** All `h1, h2, h3` use `text-wrap: balance` to prevent single-word orphan lines across mobile and desktop viewports.
- **Body Copy Wrapping:** Long-form paragraphs (`p`) use `text-wrap: pretty` and `line-height: 1.5–1.7` (`leading-relaxed`).

### 3. Spacing, Touch Targets & Safe Areas

- **Touch Target Minimum:** All interactive controls on mobile (header menu/cart buttons, quantity `-`/`+`, delete item, filter tabs, add-to-cart buttons) maintain a minimum `40px–44px` hit target (`min-h-[40px]` to `min-h-[44px]`).
- **Tactile Press Feedback:** Interactive buttons provide immediate 100–150ms visual feedback (`active:scale-[0.97]` + color transition) and explicit `"Đã chọn ✓"` confirmation when adding dishes to cart.
- **Safe Area & Sticky Coexistence:** Bottom sticky bars (`MobileStickyCartBar`) and floating rails (`FloatingActionRail`) respect `env(safe-area-inset-bottom)` and automatically hide or shift when modals/drawers open or inputs are focused.

---

## Pre-Delivery Checklist (UI/UX Pro Max Verified)

- [x] No emojis used as structural UI icons (Lucide SVG icons used consistently with `aria-hidden="true"` on decorative icons)
- [x] `cursor-pointer` on all clickable buttons, tabs, and summary elements
- [x] Smooth hover & press transitions (`150ms–250ms`) without layout shift
- [x] Immediate visual + screen-reader (`aria-live="polite"`) feedback when adding products to cart
- [x] Light mode text contrast >= 4.5:1 across all primary and secondary text
- [x] Keyboard `:focus-visible` ring visible on all interactive elements
- [x] `@media (prefers-reduced-motion: reduce)` respected globally
- [x] Form fields linked to inline error messages via `aria-invalid` and `aria-describedby`, plus focusable top error summary with anchor links
- [x] Responsive across `375px`, `768px`, `1024px`, `1440px` with zero horizontal overflow
