# System Architecture & Technical Blueprint
**Project:** Zero Compile (Global Higher Education Consultancy & CMS Platform)  
**Reference Code Prefix:** `ZRC-YYYY-XXX` (configurable via `REF_CODE_PREFIX`)  
**Stack:** React 19 (Vite) + Express + TypeScript + PostgreSQL + Prisma ORM  
**Parity Target:** 100% feature, workflow, validation, RBAC, and business-rule parity with `CLONE_SPEC.md`.

---

## 1. Monorepo / Dual-Root Project Structure

We use a clean npm-workspaces monorepo with three top-level packages (`shared/`, `server/`, `client/`) so Zod schemas, DTOs, RBAC matrices, and state-machine rules are single-source-of-truth across backend and frontend.

```text
study-consultency/
├── package.json                  # Workspace root (dev, build, typecheck, lint scripts)
├── .env.example                  # Complete environment variable template
├── CLONE_SPEC.md                 # Authoritative functional specification
├── ARCHITECTURE.md               # This document
├── FRONTEND_GUIDELINES.md        # UI/UX design tokens & component standards
│
├── shared/                       # @meridian/shared (compiled/bundled by both server & client)
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── constants/
│       │   ├── rbac.ts           # Roles, 14 permission keys, hasPermission()
│       │   ├── inquiry-fsm.ts    # Inquiry statuses, ALLOWED_STATUS_TRANSITIONS, Super-Admin-only transitions, timeline mapper
│       │   └── uploads.ts        # UPLOAD_PURPOSE_MAP, allowed MIME types, max sizes
│       ├── schemas/
│       │   ├── auth.schema.ts
│       │   ├── inquiry.schema.ts
│       │   ├── tracking.schema.ts
│       │   ├── country.schema.ts
│       │   ├── university.schema.ts
│       │   ├── user.schema.ts
│       │   ├── cms.schema.ts     # Blogs, Events, Success Stories, Gallery, Sister Concerns, Singletons
│       │   └── common.schema.ts  # Pagination, ID/slug params, sort enums
│       └── types/
│           ├── api.ts            # ApiSuccessResponse<T>, ApiErrorResponse, PaginationMeta
│           └── dto.ts            # Inferred TypeScript DTOs from Zod schemas
│
├── server/                       # @meridian/server (Express + Prisma + PostgreSQL)
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma         # All 23 entities + normalized InquiryNote & InquiryDocument
│   │   ├── migrations/           # Prisma SQL migrations
│   │   └── seed.ts               # Idempotent seed + lease-locked Super Admin bootstrap
│   └── src/
│       ├── index.ts              # Server bootstrap, cleanup scheduler, graceful shutdown
│       ├── app.ts                # Express app setup (helmet, cors, cookie-parser, routes, error handler)
│       ├── config/
│       │   ├── env.ts            # Zod-validated environment configuration
│       │   ├── prisma.ts         # PrismaClient singleton + ActivityLog immutability extension
│       │   └── cloudinary.ts     # Cloudinary v2 config & signature generator
│       ├── middleware/
│       │   ├── auth.middleware.ts        # JWT cookie verification + live DB isActive check
│       │   ├── rbac.middleware.ts        # requirePermission(...) / requireRole(...)
│       │   ├── rate-limit.middleware.ts  # DB-backed (or Redis) rate limiter + TRUST_PROXY IP extractor
│       │   ├── validate.middleware.ts    # Zod request body/query/params validator
│       │   └── error.middleware.ts       # Centralized error -> standard error envelope mapper
│       ├── services/
│       │   ├── auth.service.ts
│       │   ├── inquiry.service.ts        # Atomic MRD-YYYY-XXX generator, FSM transitions, notes, assignment
│       │   ├── tracking.service.ts       # Track status + timeline + SHA-256 OTP recovery (timingSafeEqual)
│       │   ├── country.service.ts
│       │   ├── university.service.ts
│       │   ├── user.service.ts
│       │   ├── cms.service.ts            # Blogs, Events, Success Stories, Gallery, Sister Concerns, Singletons
│       │   ├── audit.service.ts          # Append-only ActivityLog writer + recursive PII redactor
│       │   ├── email.service.ts          # Resend / SMTP transactional email + dev console fallback
│       │   ├── lock.service.ts           # SystemLock lease acquisition & release
│       │   └── cleanup.service.ts        # Periodic purge of expired RateLimit, RecoveryToken, SystemLock rows
│       └── routes/
│           ├── index.ts
│           ├── health.routes.ts
│           ├── auth.routes.ts
│           ├── inquiry.routes.ts
│           ├── tracking.routes.ts
│           ├── country.routes.ts
│           ├── university.routes.ts
│           ├── user.routes.ts
│           ├── upload.routes.ts
│           ├── audit.routes.ts
│           └── cms.routes.ts             # Public & /api/admin/content/* endpoints
│
└── client/                       # @meridian/client (React 19 + Vite + Tailwind + Framer Motion)
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx               # HelmetProvider, QueryClientProvider, AuthProvider, RouterProvider
        ├── lib/
        │   ├── api-client.ts     # Typed fetch wrapper with credentials: 'include' & envelope unwrapping
        │   ├── query-keys.ts     # Centralized TanStack Query key factory
        │   └── cloudinary.ts     # Responsive image URL builder + direct-to-cloud upload helper
        ├── context/
        │   └── AuthContext.tsx   # Session state via GET /api/auth/me, login, logout, permission helpers
        ├── router/
        │   ├── index.tsx         # Code-split PublicLayout & lazy-loaded AdminLayout routes
        │   └── guards.tsx        # ProtectedRoute & PermissionGuard
        ├── components/
        │   ├── ui/               # Design-system primitives (Button, Input, Select, Badge, Card, Modal, etc.)
        │   ├── public/           # PublicNavbar, PublicFooter, WhatsAppFloat, InquiryForm, TrackingCard, etc.
        │   └── admin/            # AdminSidebar, AdminHeader, StatusBadge, ImageUploader, RichTextEditor, etc.
        ├── layouts/
        │   ├── PublicLayout.tsx
        │   └── AdminLayout.tsx   # Lazy-loaded chunk
        └── pages/
            ├── public/           # Home, Destinations, DestinationDetail, Universities, UniversityDetail,
            │                     # Blogs, BlogDetail, Events, EventDetail, SuccessStories, Gallery,
            │                     # About, Contact, Apply (Inquiry), Track (Tracker + Recovery)
            └── admin/            # Login, Dashboard, InquiriesList, InquiryDetail, CountriesManager,
                                  # UniversitiesManager, UsersManager, ActivityLogsPage,
                                  # CmsHeroPage, CmsAboutPage, CmsContactPage, CmsFooterPage,
                                  # CmsBlogsPage, CmsEventsPage, CmsStoriesPage, CmsGalleryPage, CmsSisterConcernsPage
```

---

## 2. PostgreSQL & Prisma Schema Mapping

All 23 entities from `CLONE_SPEC.md` are mapped to relational PostgreSQL models using UUID primary keys (`@id @default(uuid())`) for entities, and string primary keys for sequence/lock/rate-limit/singleton keys.

### 2.1 Key Architectural Adaptations (MongoDB -> PostgreSQL)
1. **Normalized Relations:**
   - `Inquiry.notes` -> `InquiryNote` table (`inquiryId` FK, `createdById` FK).
   - `Inquiry.documents` -> `InquiryDocument` table (`inquiryId` FK) for backward compatibility.
   - `University.country` -> `countryId` FK referencing `Country.id` (`onDelete: Restrict` to prevent orphaned references, or explicit check before delete).
   - `Inquiry.preferredCountry` & `Inquiry.preferredUniversity` -> nullable FKs with `onDelete: SetNull`.
2. **Structured JSONB Columns (Only Where Appropriate):**
   - `University.tuitionRange` (`{ min, max, currency }`) -> `Json?`
   - `Blog.featuredImage` & `Event.eventBanner` (`{ publicId, secureUrl, width, height, format }`) -> `Json?`
   - `ActivityLog.details` -> `Json` (with recursive PII redaction before insert)
   - CMS Singleton flexible arrays/blocks: `HeroContent.slides`, `AboutPage.milestones`, `AboutPage.teamMembers`, `AboutPage.whyChooseUs`, `ContactPage.phones`, `ContactPage.emails`, `ContactPage.socialLinks`, `FooterSetting.socialLinks`, etc. -> `Json` validated strictly by Zod on write.
3. **TTL Index Replacement (`ratelimits`, `recoverytokens`, `systemlocks`):**
   - PostgreSQL does not have native TTL indexes. We implement:
     1. Explicit `resetAt` / `expiresAt` indexed `DateTime` columns.
     2. **Query-time expiry enforcement:** Every lookup filters `expiresAt > new Date()` (or `resetAt > new Date()`).
     3. **Scheduled cleanup worker:** `cleanup.service.ts` runs every 5 minutes (`setInterval`, unref'd on shutdown) executing `deleteMany` on expired rows in `RateLimit`, `RecoveryToken`, and `SystemLock`.
4. **Atomic Reference Number Generation (`MRD-YYYY-XXX`):**
   - Uses `Counter` table (`id: "inquiry_ref_2026"`, `seq: Int`) inside `prisma.$transaction`:
     ```ts
     const counter = await tx.counter.upsert({
       where: { id: `inquiry_ref_${year}` },
       update: { seq: { increment: 1 } },
       create: { id: `inquiry_ref_${year}`, seq: 1 },
     });
     const referenceNumber = `${prefix}-${year}-${String(counter.seq).padStart(3, '0')}`;
     ```
   - PostgreSQL row-level locking on `INSERT ... ON CONFLICT DO UPDATE` guarantees zero duplicate reference numbers under concurrent submissions.
5. **Immutable Audit Trail (`ActivityLog`):**
   - Enforced at the Prisma client extension level (`prisma.$extends`) by throwing an error if `update`, `updateMany`, `upsert`, `delete`, or `deleteMany` is ever invoked on `ActivityLog`.

### 2.2 Complete Entity-to-Model Mapping (23 Entities + 2 Normalized Child Tables)

| # | `CLONE_SPEC.md` Entity | Prisma Model | Table Name | Key Constraints & Indexes |
|---|---|---|---|---|
| 1 | `users` | `User` | `users` | `email` unique; `@@index([role, isActive])`, `@@index([createdAt(sort: Desc)])` |
| 2 | `countries` | `Country` | `countries` | `name` unique, `slug` unique; `@@index([isPublished, createdAt(sort: Desc)])`, `@@index([order])` |
| 3 | `universities` | `University` | `universities` | `slug` unique, `countryId` FK; `@@index([countryId, isPublished])`, `@@index([isPublished, name])` |
| 4 | `inquiries` | `Inquiry` | `inquiries` | `referenceNumber` unique; `@@index([assignedToId, status])`, `@@index([status, createdAt(sort: Desc)])`, `@@index([studentEmail])` |
| 4a | `inquiries.notes` | `InquiryNote` | `inquiry_notes` | `inquiryId` FK (cascade), `createdById` FK; `@@index([inquiryId, createdAt])` |
| 4b | `inquiries.documents` | `InquiryDocument` | `inquiry_documents` | `inquiryId` FK (cascade) |
| 5 | `counters` | `Counter` | `counters` | `id` String PK (e.g. `"inquiry_ref_2026"`), `seq` Int |
| 6 | `activitylogs` | `ActivityLog` | `activity_logs` | Append-only; `@@index([entityType, entityId, createdAt(sort: Desc)])`, `@@index([action, createdAt(sort: Desc)])` |
| 7 | `ratelimits` | `RateLimit` | `rate_limits` | `id` String PK (`"<scope>:<ip>"`), `count` Int, `resetAt` DateTime; `@@index([resetAt])` |
| 8 | `systemlocks` | `SystemLock` | `system_locks` | `id` String PK (`"bootstrap_super_admin"`), `lockedBy` String, `expiresAt` DateTime; `@@index([expiresAt])` |
| 9 | `recoverytokens` | `RecoveryToken` | `recovery_tokens` | `email` String, `hashedCode` String, `attempts` Int, `expiresAt` DateTime; `@@index([email])`, `@@index([expiresAt])` |
| 10 | `blogs` | `Blog` | `blogs` | `slug` unique; `@@index([isPublished, publishedAt(sort: Desc)])`, `@@index([isPublished, category, publishedAt(sort: Desc)])` |
| 11 | `events` | `Event` | `events` | `slug` unique; `@@index([isPublished, eventDate])`, `@@index([eventDate(sort: Desc)])` |
| 12 | `successstories` | `SuccessStory` | `success_stories` | `slug` unique; `@@index([isPublished, displayOrder, createdAt(sort: Desc)])` |
| 13 | `galleryitems` | `GalleryItem` | `gallery_items` | `@@index([isPublished, displayOrder, createdAt(sort: Desc)])` |
| 14 | `sisterconcerns` | `SisterConcern` | `sister_concerns` | `@@index([isPublished, displayOrder, createdAt(sort: Desc)])` |
| 15 | `sitecontents` | `SiteContent` | `site_contents` | `key` unique (`'homepage-about'`) |
| 16 | `aboutpages` | `AboutPage` | `about_pages` | `key` unique (`'about-page'`) |
| 17 | `contactpages` | `ContactPage` | `contact_pages` | `key` unique (`'contact-page'`) |
| 18 | `herocontents` | `HeroContent` | `hero_contents` | `singletonKey` unique (`'hero-content'`) |
| 19 | `herostats` | `HeroStat` | `hero_stats` | `order` unique (`1..4`) |
| 20 | `footersettings` | `FooterSetting` | `footer_settings` | `key` unique (`'footer-setting'`) |
| 21 | `whatsappsettings` | `WhatsAppSetting` | `whatsapp_settings` | `key` unique (`'whatsapp-contact'`) |
| 22 | `successstoriespagesettings` | `SuccessStoriesPageSetting` | `success_stories_page_settings` | `key` unique (`'success-stories-page'`) |
| 23 | `gallerysettings` | `GallerySetting` | `gallery_settings` | `key` unique (`'homepage-gallery'`) |

### 2.3 Prisma Enums
- `UserRole`: `SUPER_ADMIN` (`"super-admin"`), `ADMIN` (`"admin"`) — mapped to exact lowercase string values in DTOs.
- `IntakeSemester`: `Spring`, `Summer`, `Fall`, `Winter`
- `InquiryCategory`: `general`, `application`, `visa`, `scholarship`, `accommodation`, `other`
- `InquiryStatus`: `new`, `assigned`, `in_review` (`"in-review"`), `documents_requested` (`"documents-requested"`), `documents_received` (`"documents-received"`), `processing`, `approved`, `rejected`, `closed`
- `InquiryPriority`: `low`, `normal`, `high`, `urgent`
- `AuditEntityType`: `inquiry`, `country`, `university`, `user`
- `EventLocationType`: `in_person` (`"in-person"`), `online`, `hybrid`

*(Note: Prisma `@map("in-review")` etc. preserves exact string compatibility with `CLONE_SPEC.md` API payloads.)*

---

## 3. Express REST API Architecture

### 3.1 Standard Response Envelopes
- **Success:** `{ success: true, data: T, meta?: { page, limit, total, totalPages } }`
- **Error:** `{ success: false, error: { code: string, message: string, details?: Array<{ field: string, message: string }> } }`

### 3.2 Authentication & Security Middleware Pipeline
1. **JWT in `httpOnly` Cookie:**
   - Cookie name: `mrd_session`, `httpOnly: true`, `sameSite: 'lax'`, `secure: NODE_ENV === 'production'`, signed/verified with `AUTH_SECRET` (HS256, 7-day expiry).
2. **`requireAuth` Middleware:**
   - Extracts & verifies JWT from `req.cookies.mrd_session`.
   - Queries `User` by `id` on every protected request to verify `user.isActive === true` (instant revocation if deactivated).
3. **`requirePermission(permissionKey)` Middleware:**
   - Checks `hasPermission(req.user.role, permissionKey)` against the shared RBAC matrix.
4. **Rate Limiter (`rateLimit({ scope, windowMs, max })`):**
   - Extracts client IP using `TRUST_PROXY` hierarchy (`cloudflare` -> `cf-connecting-ip`; `vercel` -> `x-real-ip` / `x-forwarded-for`; `true` -> `cf-connecting-ip` -> `x-real-ip` -> `x-forwarded-for`).
   - In production, invalid IP syntax fails closed with `400 Bad Request`.
   - Uses PostgreSQL atomic upsert/increment on `RateLimit` (or Upstash/Redis if `RATE_LIMIT_STORE=redis`).
   - Fail-closed in production: store failure returns `503 Service Unavailable`.
   - Respects `DISABLE_INQUIRY_RATE_LIMIT=true` for emergency inquiry submission bypass.
5. **Audit Logger (`auditService.log(...)`):**
   - Recursively redacts any key containing `password`, `token`, `secret`, `cookie`, `creditcard`, `ssn`, `gpa`, `cv`, `transcript`, or `phonenumber` (case-insensitive) to `"[REDACTED_SENSITIVE_DATA]"`.

### 3.3 Complete Endpoint Inventory

#### Auth & Health
- `GET /api/health` — DB connectivity check (`SELECT 1`).
- `POST /api/auth/login` — Email/password login (bcrypt cost 12, rate-limited 10/15m per IP), sets `httpOnly` cookie.
- `POST /api/auth/logout` — Clears session cookie.
- `GET /api/auth/me` — Returns current authenticated user profile (`requireAuth`).

#### Public Endpoints (Unauthenticated)
- `POST /api/inquiries` — Submit inquiry (rate limit 10/hr/IP; validates `preferredUniversity` belongs to `preferredCountry`; forbids client-supplied status/priority/referenceNumber/assignedTo/notes/documents; atomic `MRD-YYYY-XXX`).
- `POST /api/inquiries/track` — Track status via `trackingId` + `email` (rate limit 30/15m/IP; returns masked student name e.g. `"Tanvir A."`, status label, advisory note, and 5-step timeline).
- `POST /api/inquiries/recover/request` — Generate 6-digit OTP, store SHA-256 hash in `RecoveryToken` (10m TTL), dispatch via email service, constant-time generic `200` response (rate limit 5/15m/IP).
- `POST /api/inquiries/recover/verify` — Timing-safe SHA-256 comparison (`crypto.timingSafeEqual`), max 3 attempts before token deletion, returns matching applications on success (rate limit 5/15m/IP).
- `GET /api/countries` & `GET /api/countries/:idOrSlug` — Published destinations ordered by `order ASC`.
- `GET /api/universities` & `GET /api/universities/:idOrSlug` — Published universities filterable by `country` (ID or slug) and `search`.
- `GET /api/blogs` & `GET /api/blogs/:slug` — Published blogs ordered by `publishedAt DESC`.
- `GET /api/events` & `GET /api/events/:slug` — Published events (`filter=all|upcoming|past`).
- `GET /api/whatsapp` — Public WhatsApp contact config.
- `GET /api/content/public` — Consolidated public CMS read endpoint (HeroContent, HeroStats, SiteContent, FooterSetting, GallerySetting, SuccessStoriesPageSetting, published SuccessStories, GalleryItems, SisterConcerns) + individual `GET /api/content/about-page` & `GET /api/content/contact-page` for clean SPA hydration.

#### Protected Admin & Super-Admin Endpoints
- `GET /api/inquiries` — List inquiries (`admin`, `super-admin`). Default excludes `closed` unless `status` is specified. Supports pagination, filters, search, and `sort`.
- `GET /api/inquiries/:id` — Full inquiry details + notes + audit log history (`admin`, `super-admin`).
- `PUT /api/inquiries/:id/status` — Advance status (`admin`, `super-admin`). Enforces `ALLOWED_STATUS_TRANSITIONS`, Super-Admin-only transitions (`closed`/`rejected` to/from), and atomic `updateMany({ where: { id, status: existingStatus } })` concurrency guard.
- `POST /api/inquiries/:id/notes` — Append internal counselor note (`admin`, `super-admin`).
- `POST /api/inquiries/:id/assign` & `PUT /api/inquiries/:id/assign` — Assign/reassign counselor (`super-admin` only). Auto-transitions `new` -> `assigned` on initial assignment.
- `POST /api/uploads/signature` — Generate Cloudinary HMAC-SHA1 upload signature (`admin`, `super-admin`).
- `GET /api/users`, `POST /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id` — Staff management (`super-admin` only).
- `POST /api/countries`, `PUT /api/countries/:id`, `DELETE /api/countries/:id`, `PUT /api/countries/reorder` — Destination management (`super-admin` only).
- `POST /api/universities`, `PUT /api/universities/:id`, `DELETE /api/universities/:id` — University management (`super-admin` only).
- `GET /api/activity-logs` — Inspect immutable audit logs (`super-admin` only).
- `GET`/`PUT`/`POST`/`DELETE` `/api/admin/content/*` — All 15 CMS endpoints (`about`, `about-page`, `contact-page`, `hero-content`, `hero-stats`, `footer`, `whatsapp`, `success-stories-page`, `success-stories`, `gallery`, `gallery/settings`, `sister-concerns`, `blogs`, `events`) (`super-admin` only).
- `POST /api/revalidate-all` — Cache purge trigger (`super-admin` only).

---

## 4. React Router, State & Auth Architecture

### 4.1 Routing & Code Splitting
- **`PublicLayout`** (eagerly available for public routes):
  - `/`, `/destinations`, `/destinations/:slug`, `/universities`, `/universities/:slug`, `/blogs`, `/blogs/:slug`, `/events`, `/events/:slug`, `/success-stories`, `/gallery`, `/about`, `/contact`, `/apply`, `/track`.
- **`AdminLayout`** (strictly `React.lazy(() => import('../layouts/AdminLayout'))` wrapped in `Suspense` + `ProtectedRoute`):
  - `/admin/login` (standalone auth page, redirects to `/admin` if already authenticated)
  - `/admin` (Inquiry Dashboard / Overview)
  - `/admin/inquiries`, `/admin/inquiries/:id` (`admin` + `super-admin`)
  - `/admin/countries`, `/admin/universities`, `/admin/users`, `/admin/activity-logs`, `/admin/cms/*` (`super-admin` only, guarded by `PermissionGuard`)

### 4.2 Auth & TanStack Query Integration
- `AuthProvider` runs `useQuery(['auth', 'me'], fetchMe, { retry: false, staleTime: 5 * 60_000 })`.
- `api-client.ts` intercepts `401 Unauthorized` on admin routes to clear auth cache and redirect to `/admin/login`.
- Mutations invalidate exact TanStack Query keys (e.g., `queryKeys.inquiries.all`, `queryKeys.cms.public`) so UI stays synchronized without full-page reloads.
- `react-helmet-async` manages per-route `<title>`, `<meta name="description">`, OpenGraph tags, and injects `<meta name="robots" content="noindex, nofollow" />` when `VITE_SITE_NOINDEX === 'true'`.
