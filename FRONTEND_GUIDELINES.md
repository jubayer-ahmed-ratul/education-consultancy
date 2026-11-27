# Frontend Design System & Engineering Guidelines
**Brand Identity:** Zero Compile  
**Design Paradigm:** Clean Editorial Light Mode — Structured, high-trust academic consultancy aesthetic with crisp surfaces, deep emerald-navy authority, warm amber highlights, and disciplined whitespace.

---

## 1. Visual Design Tokens

### 1.1 Color Palette
All colors are defined as CSS custom properties in `client/src/index.css` and mapped into Tailwind CSS theme tokens.

| Token | Hex | Usage |
|---|---|---|
| `--bg-canvas` | `#FAF9F6` | Warm off-white primary page canvas |
| `--bg-surface` | `#FFFFFF` | Cards, modals, inputs, sticky header, CMS panels |
| `--bg-subtle` | `#F3F1EC` | Secondary bands, table headers, subtle hover states |
| `--border-hairline` | `#E5E2DC` | Crisp 1px card & divider borders |
| `--border-strong` | `#CFCAC0` | Input borders, active outlines |
| `--ink-primary` | `#111827` | Headings, primary body copy |
| `--ink-secondary` | `#4B5563` | Descriptions, metadata, table subtext |
| `--ink-muted` | `#6B7280` | Captions, placeholders, timestamps |
| `--brand-primary` | `#0D3B2E` | Deep Forest Emerald — primary CTAs, active nav, brand authority |
| `--brand-primary-hover` | `#092A20` | Primary button hover state |
| `--brand-secondary` | `#132A4A` | Deep Academic Navy — secondary badges, footer/hero contrast |
| `--brand-accent` | `#D97706` | Warm Amber — highlights, key stats, attention badges |
| `--brand-accent-soft` | `#FEF3C7` | Soft amber pill background |

### 1.2 Inquiry Status Semantic Palette
Used consistently across the Admin Triage Dashboard and Public Application Tracker:
- `new`: Sky (`#EFF6FF` bg / `#1D4ED8` text / `#BFDBFE` border)
- `assigned`: Indigo (`#EEF2FF` bg / `#4338CA` text / `#C7D2FE` border)
- `in-review`: Amber (`#FFFBEB` bg / `#B45309` text / `#FDE68A` border)
- `documents-requested`: Orange (`#FFF7ED` bg / `#C2410C` text / `#FED7AA` border)
- `documents-received`: Teal (`#F0FDFA` bg / `#0F766E` text / `#99F6E4` border)
- `processing`: Violet (`#F5F3FF` bg / `#6D28D9` text / `#DDD6FE` border)
- `approved`: Emerald (`#ECFDF5` bg / `#047857` text / `#A7F3D0` border)
- `rejected`: Rose (`#FFF1F2` bg / `#BE123C` text / `#FECDD3` border)
- `closed`: Slate (`#F1F5F9` bg / `#475569` text / `#CBD5E1` border)

---

## 2. Typography System

- **Display & Headings:** `'Plus Jakarta Sans', system-ui, sans-serif` (weights 600, 700, 800; tight tracking `-0.02em`).
- **Body & UI Controls:** `'Inter', system-ui, sans-serif` (weights 400, 500, 600; comfortable `1.6` line-height for editorial reading).
- **Monospace / Codes:** `'JetBrains Mono', monospace` (`tabular-nums`) for Tracking IDs (`MRD-2026-001`), OTP inputs, and Audit Log timestamps.

### Type Scale
- Hero Display: `clamp(2.25rem, 4vw, 3.5rem)` (`font-extrabold`, `leading-[1.1]`)
- Page H1: `clamp(1.875rem, 3vw, 2.5rem)` (`font-bold`, `leading-[1.2]`)
- Section H2: `1.5rem` – `1.875rem` (`font-bold`)
- Card Title H3: `1.125rem` (`font-semibold`)
- Body: `1rem` (`16px`) / Compact UI: `0.875rem` (`14px`)

---

## 3. Component & UI Standards

### 3.1 Surfaces & Borders
- **Editorial Card Standard:** `bg-white border border-[#E5E2DC] rounded-lg` with zero heavy drop shadows. Hover elevation uses border darkening (`hover:border-[#CFCAC0]`) and subtle `shadow-sm` only on interactive cards.
- **Buttons:**
  - `primary`: Deep Emerald `#0D3B2E`, white text, `rounded-md`, `h-10 px-5`, `font-medium`.
  - `secondary`: White bg, `1px` `#CFCAC0` border, `#111827` text.
  - `accent`: Warm Amber `#D97706`, white text (used sparingly for primary public "Apply Now" CTAs).
  - `ghost` / `danger`: Clean minimal states with explicit focus-visible rings (`focus-visible:ring-2 focus-visible:ring-[#0D3B2E] focus-visible:ring-offset-2`).
- **Forms & Validation:**
  - Every input has an associated `<label>`, `aria-invalid`, and inline Zod error message below the field.
  - Multi-section forms (e.g. Public Inquiry Form) group fields into clear numbered steps/sections (Student Profile, Academic Background, Study Preferences, Statement/Message).
- **Interactive Maps & Media:**
  - `/contact` embeds an interactive **Leaflet** map (`leaflet` / `react-leaflet`) centered on CMS-configured `mapLatitude`, `mapLongitude`, `mapZoom`, and `mapAddress`.
  - `/success-stories` renders story cards with country flags, achievement badges, and a clean modal player for `youtubeUrl` testimonials.
  - `/admin` uses a dedicated `ImageUploader` component that requests a signed signature from `POST /api/uploads/signature` and uploads directly to Cloudinary with progress feedback.

---

## 4. Layout Architecture

### 4.1 Public Portal (`PublicLayout`)
- **Top Navigation:** Clean single-row sticky bar (`h-16`, `bg-white/95 backdrop-blur-sm border-b border-[#E5E2DC]`), brand wordmark on left, concise links (`Destinations`, `Universities`, `Success Stories`, `Events`, `Blogs`, `About`, `Contact`), and two action buttons on right (`Track Application` outline + `Apply Now` solid emerald). Responsive slide-over drawer on mobile.
- **Footer:** Deep Academic Navy (`#132A4A`) editorial footer with brand summary, dynamic featured destination links (up to 6 slugs from `FooterSetting`), quick links, social icons, and sister-concerns strip.
- **Floating WhatsApp Support:** Fixed bottom-right pill button powered by `GET /api/whatsapp`.

### 4.2 Admin & Counselor CMS (`AdminLayout`)
- **Structured Sidebar Shell:** Fixed left sidebar (`w-64`, collapsible on mobile) with role-aware navigation:
  - **All Staff (`admin` + `super-admin`):** Inquiries Queue, Dashboard Overview.
  - **Super Admin Only (`super-admin`):** Destinations, Universities, Staff & Users, Audit Logs, and grouped CMS Editors (`Hero & Stats`, `About & Team`, `Contact & Map`, `Blogs`, `Events`, `Success Stories`, `Gallery`, `Sister Concerns`, `Footer & WhatsApp`).
- **Inquiry Detail View:** Two-column workspace: left column displays student/academic profile + status transition controls + counselor assignment (`super-admin` only); right column displays chronological internal notes composer + immutable audit trail timeline.

---

## 5. Motion, Performance & Accessibility Rules

1. **Subtle Framer Motion:**
   - Page/section reveals use short, crisp transitions (`duration: 0.25`, `ease: [0.22, 1, 0.36, 1]`, `y: 8 -> 0`).
   - Wrap app in `<MotionConfig reducedMotion="user">` to automatically respect `prefers-reduced-motion`.
2. **Strict Code-Splitting:**
   - `AdminLayout` and all `/admin/*` pages MUST be lazy-loaded via `React.lazy()` so public visitors never download admin editor bundles.
   - Heavy libraries (e.g., `leaflet` on `/contact`) are lazy-loaded per route.
3. **Media & Query Performance:**
   - Cloudinary URLs automatically inject `f_auto,q_auto` transformations.
   - Public images use `loading="lazy"` and explicit aspect-ratio containers (`aspect-[16/10]`, `aspect-square`) to prevent Cumulative Layout Shift (CLS).
   - TanStack Query sets `staleTime: 60_000` for public directories and `staleTime: 0` for active admin inquiry queues.
4. **Accessibility:**
   - Minimum WCAG AA contrast (`>= 4.5:1` for body text, `>= 3:1` for large headings/UI).
   - Semantic landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`), keyboard-accessible modals/drawers (`Escape` to close, focus management).
