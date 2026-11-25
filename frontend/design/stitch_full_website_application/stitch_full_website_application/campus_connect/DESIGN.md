---
name: Campus Connect
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464e'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#75777f'
  outline-variant: '#c6c6cf'
  surface-tint: '#515d82'
  primary: '#071637'
  on-primary: '#ffffff'
  primary-container: '#1e2b4d'
  on-primary-container: '#8693bb'
  inverse-primary: '#b9c5f0'
  secondary: '#1840e6'
  on-secondary: '#ffffff'
  secondary-container: '#3d5dff'
  on-secondary-container: '#f4f3ff'
  tertiary: '#001c19'
  on-tertiary: '#ffffff'
  tertiary-container: '#00332e'
  on-tertiary-container: '#2ea498'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b9c5f0'
  on-primary-fixed: '#0c1a3b'
  on-primary-fixed-variant: '#394669'
  secondary-fixed: '#dee0ff'
  secondary-fixed-dim: '#bac3ff'
  on-secondary-fixed: '#00105b'
  on-secondary-fixed-variant: '#002fc9'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  gutter-mobile: 1rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system establishes an energetic, trusted, and structured digital campus environment. Geared toward university students, student organizations, faculty coordinators, and campus administrators, the aesthetic bridges collegiate authority with the momentum of modern student life. 

The visual style blends **Modern Corporate Clarity** with **Vibrant Editorial Accentuation**:
- **Structured and Dependable:** Crisp layouts, systematic card hierarchies, and disciplined spacing evoke institutional trust without feeling bureaucratic.
- **Dynamic & Social:** Electric accent colors, expressive date badge tokens, and rounded interactive components project vitality, encouraging serendipitous campus engagement and community discovery.
- **Clutter-Free Utility:** Clean, breathable surfaces and high-contrast typography reduce cognitive friction during fast scanning between classes or while curating semester calendars.

## Colors

The palette balances traditional collegiate prestige with high-contrast, modern application clarity:

- **Primary (`#1E2B4D` - Collegiate Navy):** Anchors headers, primary interactive states, dark container surfaces, and critical navigational structures. Represents institutional authority and grounded stability.
- **Secondary (`#3B5BFD` - Electric Indigo / Bright Blue):** Drives primary actions, highlighted calendar dates, active tabs, focused inputs, and prominent CTAs. Infuses the platform with contemporary kinetic energy.
- **Tertiary (`#0D9488` - Emerald / Teal):** Reserved for category tags, verified status badges, active attendance indicators, and confirmation moments. Provides an organic contrast to the deep blues.
- **Neutral (`#F8FAFC` - Crisp Off-White):** Provides an expansive, warm architectural canvas. Paired with pure white (`#FFFFFF`) card containers, cool slate borders (`#E2E8F0`), and deep charcoal body copy (`#0F172A`) for maximum legibility and spatial relief.

## Typography

The type system pairs **Plus Jakarta Sans** for headlines and interactive labels with **Inter** for sustained reading contexts:

- **Headlines (Plus Jakarta Sans):** Geometric curves and distinct terminals provide an approachable, modern academic identity. Negative letter-spacing in display and large variants maintains optical tension and structural presence across large dashboards.
- **Body (Inter):** Highly legible, neutral sans-serif that excels in dense layouts, event metadata tables, descriptive blurbs, and user comments.
- **Labels & Badges (Plus Jakarta Sans):** Elevated font weights with deliberate tracking optimize micro-copy, tag chips, calendar month tickers, and tab labels for rapid legibility.

## Layout & Spacing

The system implements a fixed-width fluid container framework designed primarily for desktop productivity and responsive consumption:

- **Desktop Framework (1200px - 1440px+):** Operates on a structured 12-column grid with a fixed 260px persistent sidebar for primary campus navigation, accompanied by a dynamic workspace utilizing `gutter` (1.5rem) and standard section `margin` (2rem).
- **Responsive Adaptations:**
  - **Desktop (1024px+):** Full 12-column grid; event cards populate 3- or 4-column configurations (span 4 or span 3).
  - **Tablet (768px - 1023px):** 8-column layout. The persistent sidebar collapses into an icon-rail (72px) or off-canvas drawer. Card grids reflow to 2 columns (span 4).
  - **Mobile (<768px):** 4-column layout with `gutter-mobile` (1rem) and `margin-mobile` (1rem). Navigation translates to a fixed bottom navigation bar with a compact top header; cards collapse into single-column vertical feeds or horizontal carousels.

## Elevation & Depth

Visual hierarchy uses a refined hybrid of **tonal layering** and **soft ambient shadows** tinted by the primary navy hue:

- **Base Layer:** The canvas sits at `#F8FAFC`. Secondary panels, sidebars, and inactive widgets use tonal shifts (`#FFFFFF` to `#F1F5F9`) with ultra-fine borders (`1px solid #E2E8F0`).
- **Resting Elevation (Cards, Widgets):** Surface `#FFFFFF` elevated with a double-drop ambient shadow: `0 1px 3px rgba(30, 43, 77, 0.05), 0 4px 12px rgba(30, 43, 77, 0.03)`. Subtle border treatment ensures boundary definition against light backgrounds.
- **Hover & Interactive State:** Interactive cards lift physically: `translateY(-2px)` coupled with an expanded shadow: `0 12px 24px -4px rgba(30, 43, 77, 0.08), 0 4px 8px -2px rgba(30, 43, 77, 0.04)`.
- **Floating Overlays (Modals, Popovers, Flyouts):** Strong spatial depth achieved via: `0 20px 35px -5px rgba(30, 43, 77, 0.16), 0 8px 16px -4px rgba(30, 43, 77, 0.08)`, bounded by subtle 1px border highlights.

## Shapes

The design system enforces a **Rounded** (Level 2) shape philosophy:

- **Base Radius (0.5rem / 8px):** Applied to buttons, form inputs, calendar date sub-boxes, and context menus. Delivers a friendly, modern feel while keeping structural integrity.
- **Large Radius (1rem / 16px):** Standard across all primary content surfaces, event feed cards, modal containers, and dashboard widget blocks.
- **Extra-Large Radius (1.5rem / 24px):** Utilized for major featured event hero banners and search bar wrapper pods.
- **Full Pill (`9999px`):** Reserved exclusively for status chips, tags, attendee avatars, and quick-filter pills.

## Components

### Event Cards
- **Structure:** Encased in a `rounded-lg` (16px) white container with a 1px border (`#E2E8F0`). Contains an aspect-ratio-locked event visual (16:9), embedded calendar date badge in the upper left, categorical chips, event title (`headline-sm`), time/location metadata, and attendee social proof avatars.
- **State Behavior:** Elevates with a smooth 200ms ease transition on hover, deepening the navy-tinted ambient shadow.

### Calendar Date Badges
- **Structure:** Compact square modules (48px × 48px or 56px × 56px) placed inside cards or headers. 
- **Palette:** Crisp `#FFFFFF` surface with an upper highlight bar of Secondary Indigo (`#3B5BFD`) or Primary Navy (`#1E2B4D`).
- **Typography:** Month abbreviation rendered in `label-sm` uppercase, while the day number uses bold `headline-md` centered underneath.

### Category Chips & Badges
- **Structure:** Pill-shaped (`rounded-full`) horizontal tags with vertical padding (`space-xs`) and horizontal padding (`space-sm`).
- **Palette:** Soft pastel background tones paired with saturated typography:
  - *Academic / Career:* Navy tint (`#EEF2F6` text `#1E2B4D`).
  - *Social / Campus Life:* Indigo tint (`#EEF2FF` text `#3B5BFD`).
  - *Athletics / Wellness:* Emerald tint (`#ECFDF5` text `#0D9488`).

### Buttons
- **Primary:** Background `#3B5BFD` (Secondary) or `#1E2B4D` (Primary), text `#FFFFFF`, radius `rounded` (8px). Hover state deepens background by 8% and adds subtle translation.
- **Secondary / Outline:** Background transparent, border 1.5px `#E2E8F0`, text `#1E2B4D`. On hover: surface `#F8FAFC`, border `#CBD5E1`.
- **Tertiary / Ghost:** Borderless, text `#3B5BFD` or `#1E2B4D`. Active and focus states present an indigo outline ring.

### Input Fields & Search
- **Height & Padding:** 44px height for accessibility, `space-md` horizontal interior padding.
- **Appearance:** Background `#FFFFFF`, 1px border `#E2E8F0`, `rounded` (8px).
- **Focus State:** 2px ring in `#3B5BFD` with zero outline offset, transitioning with 150ms ease.

### Selection Controls (Checkboxes & Radios)
- **Checkboxes:** 20px squares, `rounded` (4px), checked background `#3B5BFD` with white check glyph.
- **Radios:** 20px circles, selected state exhibits a centered 8px `#3B5BFD` inner circle with 2px white separation ring.

### Navigation Sidebar & Header
- **Sidebar:** Fixed width 260px, surface `#FFFFFF`, right-border 1px `#E2E8F0`. Nav links use `label-lg`, resting text `#64748B`, active state styled with `#3B5BFD` text and `#EEF2FF` pill background.
- **Top Header:** 64px height, sticky top surface with 80% opacity blur effect (`backdrop-blur-md`), encompassing global campus search, notification bells with unread badge pings, and student profile quick-switchers.