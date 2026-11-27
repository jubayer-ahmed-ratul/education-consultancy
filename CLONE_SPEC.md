# System Architecture, Data Layer & Functional Specification
**Project:** Holy Tours and Global Studies (Holy TGS)  
**Document Type:** Clone / Re-implementation Specification (`CLONE_SPEC.md`)  
**Design Paradigm:** Tech-Stack-Agnostic, UI-Agnostic, Domain-Driven Functional Architecture

---

## 1. System Overview & Core Capabilities

### 1.1 Domain & Purpose
Holy Tours and Global Studies is an enterprise-grade higher education consultancy and student mobility platform. The system operates as a dual-sided application:
1. **Public Portal:** Serves prospective students seeking undergraduate and postgraduate admissions, scholarships, and student visas across global destinations (e.g., United Kingdom, Canada, Australia, United States, Europe). It features searchable institution and destination directories, study guides, event registration, student success stories with video testimonials, a student inquiry/application portal, and a self-service application tracking and recovery subsystem.
2. **Administration & CMS Dashboard:** A restricted management portal enabling counselors and system administrators to manage student inquiries through a multi-stage lifecycle, track internal case notes, reassign applications, manage institution and destination profiles, publish blogs and events, and control all dynamic website content without code modifications.

---

### 1.2 User Roles & Access Control (RBAC Matrix)

The system defines two authenticated internal roles with strict hierarchical capabilities, in addition to unauthenticated public visitors:

| Role | Description | Core Permissions |
| :--- | :--- | :--- |
| **Public Visitor** | Unauthenticated prospective student or site visitor. | Browse published destinations, universities, blogs, events, gallery, and success stories; submit admissions inquiries; track applications via Tracking ID + Email; request tracking recovery codes. |
| **Admin (`admin`)** | Education counselor and portal administrator. | Read and process inquiries; update inquiry status (within allowed lifecycle rules); add internal inquiry notes; view application timeline; manage institution and destination directories. Cannot manage user accounts, assign/reassign counselors, reopen closed/rejected cases, or edit system-wide CMS settings. |
| **Super Admin (`super-admin`)** | Executive manager and system administrator. | Complete wildcard (`*`) access. Full control over user accounts (create, update, deactivate staff), inquiry assignment/reassignment, reopening closed/rejected inquiries, purging system caches, managing all CMS settings, and inspecting immutable system audit logs. |

#### Detailed Permission Rule Matrix

| Permission Key | Description | Public | Admin | Super Admin |
| :--- | :--- | :---: | :---: | :---: |
| `inquiries:submit` | Submit new online inquiry | Yes | Yes | Yes |
| `inquiries:track` | Track application status via Tracking ID + Email | Yes | Yes | Yes |
| `inquiries:recover` | Request & verify OTP to recover Tracking ID | Yes | Yes | Yes |
| `inquiries:view-all` | View all inquiries across all counselors | No | Yes | Yes |
| `inquiries:update-status` | Advance inquiry lifecycle status | No | Yes | Yes |
| `inquiries:add-notes` | Append internal counselor notes | No | Yes | Yes |
| `inquiries:reopen` | Reopen `closed` or `rejected` inquiries | No | No | Yes |
| `inquiries:assign` | Initial assignment or reassignment of counselor | No | No | Yes |
| `users:manage` | Create, update, or deactivate administrator accounts | No | No | Yes |
| `content:manage` | Update website CMS content, hero, about, footer, etc. | No | No | Yes |
| `countries:manage` | Create, edit, publish, delete, and reorder destinations | No | No | Yes |
| `universities:manage` | Create, edit, publish, and delete universities | No | No | Yes |
| `activity-log:view` | Inspect system-wide audit activity logs | No | No | Yes |
| `cache:purge` | Trigger global cache invalidation | No | No | Yes |

---

## 2. Database Schema & Data Models

All timestamps are stored in UTC ISO-8601 format. Object identifiers represent unique 24-character hexadecimal identifiers (MongoDB ObjectId standard).

```
                      +-------------------+
                      |      Country      |
                      +-------------------+
                                | 1
                                |
                                | N
                      +-------------------+          +--------------------+
                      |    University     |          |        User        |
                      +-------------------+          | (Admin/SuperAdmin) |
                                |                    +--------------------+
                                |                              |
            +-------------------+                              |
            | preferredCountry                                 | assignedTo
            | preferredUniversity                              | performedBy
            v                                                  v
+-----------------------+                            +--------------------+
|        Inquiry        |<---------------------------|    ActivityLog     |
+-----------------------+                            +--------------------+
            |
            +---> notes [embedded: content, createdBy, createdAt]
            +---> documents [embedded: fileName, fileType, storageKey]
```

---

### 2.1 `users`
Represents staff counselors and system administrators.

| Field Name | Type | Required | Default | Constraints & Rules |
| :--- | :--- | :---: | :---: | :--- |
| `_id` | ObjectId | Yes | Auto | Unique identifier |
| `name` | String | Yes | — | Min 1, Max 100 characters. Trimmed. |
| `email` | String | Yes | — | Unique, lowercase, valid email format. |
| `password` | String | Yes | — | Bcrypt hash (cost factor 12). Min 8 characters plain. Excluded from default queries. |
| `role` | Enum | Yes | `'admin'` | One of: `['super-admin', 'admin']`. |
| `isActive` | Boolean | Yes | `true` | When `false`, user session is instantly rejected across all endpoints. |
| `createdAt` | DateTime | Yes | Current Time | Auto-generated UTC timestamp. |
| `updatedAt` | DateTime | Yes | Current Time | Auto-updated UTC timestamp. |

**Indexes:**
- `email` (Unique)
- `{ role: 1, isActive: 1 }` (Compound index for staff lookups)
- `createdAt: -1`

---

### 2.2 `countries`
Represents destination countries (e.g., United Kingdom, Canada, Australia).

| Field Name | Type | Required | Default | Constraints & Rules |
| :--- | :--- | :---: | :---: | :--- |
| `_id` | ObjectId | Yes | Auto | Unique identifier |
| `name` | String | Yes | — | Unique, max 100 characters. Trimmed. |
| `slug` | String | Yes | Auto | Unique, lowercase alphanumeric with single hyphens (`^[a-z0-9]+(?:-[a-z0-9]+)*$`). Auto-generated from `name` if not provided. |
| `description` | String | Yes | — | Max 5,000 characters. |
| `highlights` | Array<String> | No | `[]` | Max 20 items, each max 200 characters. |
| `imageUrl` | String | No | `null` | Main cover image URL (Cloudinary HTTPS or root-relative). |
| `images` | Array<String> | No | `[]` | Max 20 gallery image URLs. |
| `educationSystem` | String | No | `null` | Markdown / Rich text overview. Max 10,000 characters. |
| `admissionRequirements` | String | No | `null` | General admission criteria. Max 10,000 characters. |
| `tuitionAndLivingCosts` | String | No | `null` | Living cost estimations. Max 10,000 characters. |
| `visaRequirements` | String | No | `null` | Student visa documentation rules. Max 10,000 characters. |
| `intakes` | Array<String> | No | `[]` | Max 20 items (e.g., `"Fall 2026"`, `"Spring 2027"`). |
| `scholarshipInfo` | String | No | `null` | Government & institutional aid. Max 10,000 characters. |
| `isPublished` | Boolean | Yes | `false` | When `false`, hidden from public listings. |
| `order` | Integer | Yes | `0` | Manual display ordering index. |
| `createdBy` | ObjectId | No | `null` | Reference to `users._id`. |
| `createdAt` | DateTime | Yes | Current Time | Auto-generated UTC timestamp. |
| `updatedAt` | DateTime | Yes | Current Time | Auto-updated UTC timestamp. |

**Indexes:**
- `name` (Unique)
- `slug` (Unique)
- `{ isPublished: 1, createdAt: -1 }`
- `order: 1`

---

### 2.3 `universities`
Represents partner academic institutions.

| Field Name | Type | Required | Default | Constraints & Rules |
| :--- | :--- | :---: | :---: | :--- |
| `_id` | ObjectId | Yes | Auto | Unique identifier |
| `name` | String | Yes | — | Max 150 characters. Trimmed. |
| `slug` | String | Yes | Auto | Unique, lowercase alphanumeric with hyphens. Auto-generated from `name`. |
| `country` | ObjectId | Yes | — | Reference to `countries._id`. Foreign key. |
| `city` | String | No | `null` | Max 100 characters. |
| `logoUrl` | String | No | `null` | Institution crest/logo URL. |
| `imageUrl` | String | No | `null` | Main campus cover image URL. |
| `images` | Array<String> | No | `[]` | Up to 10 campus photo URLs. |
| `description` | String | Yes | — | Max 5,000 characters. |
| `programs` | Array<String> | No | `[]` | Up to 50 program names / degrees. |
| `admissionRequirements` | String | No | `null` | Max 10,000 characters. |
| `englishRequirements` | String | No | `null` | IELTS/TOEFL/PTE criteria. Max 2,000 characters. |
| `scholarshipDetails` | String | No | `null` | Max 10,000 characters. |
| `applicationDeadlines` | String | No | `null` | Max 2,000 characters. |
| `website` | String | No | `null` | Valid institutional website URL. |
| `tuitionRange` | Object | No | `null` | Embedded object: `{ min: Number, max: Number, currency: String }`. `max >= min >= 0`. `currency` is 3-letter ISO (default `'USD'`). |
| `isPublished` | Boolean | Yes | `false` | When `false`, hidden from public catalog. |
| `createdBy` | ObjectId | No | `null` | Reference to `users._id`. |
| `createdAt` | DateTime | Yes | Current Time | Auto-generated UTC timestamp. |
| `updatedAt` | DateTime | Yes | Current Time | Auto-updated UTC timestamp. |

**Indexes:**
- `slug` (Unique)
- `{ country: 1, isPublished: 1 }`
- `{ isPublished: 1, createdAt: -1 }`
- `{ isPublished: 1, name: 1 }`
- `{ country: 1, isPublished: 1, name: 1 }`
- `name: 1`
- `createdAt: -1`

---

### 2.4 `inquiries`
The core transactional entity tracking student admissions inquiries.

| Field Name | Type | Required | Default | Constraints & Rules |
| :--- | :--- | :---: | :---: | :--- |
| `_id` | ObjectId | Yes | Auto | Unique identifier |
| `referenceNumber` | String | Yes | — | Unique, uppercase tracking format: `HOLY-YYYY-XXX` (e.g. `HOLY-2026-001`) or `INQ-YYYYMMDD-NNNN`. |
| `student.firstName` | String | Yes | — | Max 50 characters. Trimmed. |
| `student.lastName` | String | Yes | — | Max 50 characters. Trimmed. |
| `student.email` | String | Yes | — | Lowercase, valid email format. |
| `student.phone` | String | No | `null` | Max 30 characters. |
| `student.nationality`| String | No | `null` | Max 50 characters. |
| `academic.currentEducationLevel` | String | Yes | — | Max 100 characters (e.g. `"HSC"`, `"Bachelor's"`). |
| `academic.fieldOfStudy` | String | No | `null` | Max 100 characters. |
| `academic.gpa` | String | No | `null` | Max 20 characters. |
| `academic.englishProficiency` | String | No | `null` | Max 100 characters (e.g. `"IELTS 7.0"`). |
| `preferredCountry` | ObjectId | No | `null` | Reference to `countries._id`. Must be published if provided. |
| `preferredUniversity`| ObjectId | No | `null` | Reference to `universities._id`. Must be published and belong to `preferredCountry`. |
| `intendedProgram` | String | No | `null` | Max 150 characters. |
| `intakeYear` | Integer | No | `null` | Range: `2020` to `2050`. |
| `intakeSemester` | Enum | No | `null` | One of: `['Spring', 'Summer', 'Fall', 'Winter']`. |
| `category` | Enum | Yes | `'general'` | One of: `['general', 'application', 'visa', 'scholarship', 'accommodation', 'other']`. |
| `message` | String | Yes | — | Min 10, Max 3,000 characters. Trimmed. |
| `status` | Enum | Yes | `'new'` | One of: `['new', 'assigned', 'in-review', 'documents-requested', 'documents-received', 'processing', 'approved', 'rejected', 'closed']`. |
| `priority` | Enum | Yes | `'normal'` | One of: `['low', 'normal', 'high', 'urgent']`. |
| `assignedTo` | ObjectId | No | `null` | Reference to `users._id` (counselor). |
| `assignedBy` | ObjectId | No | `null` | Reference to `users._id` (super-admin who assigned). |
| `assignedAt` | DateTime | No | `null` | Timestamp when assigned. |
| `notes` | Array<Object>| Yes | `[]` | Embedded list of internal counselor notes. |
| `notes._id` | ObjectId | Yes | Auto | Unique note identifier. |
| `notes.content` | String | Yes | — | Max 5,000 characters. |
| `notes.createdBy` | ObjectId | Yes | — | Reference to `users._id`. |
| `notes.createdAt` | DateTime | Yes | Current Time | Auto UTC timestamp. |
| `documents` | Array<Object>| Yes | `[]` | Embedded list for backward compatibility (student uploads handled offline). |
| `createdAt` | DateTime | Yes | Current Time | Auto-generated UTC timestamp. |
| `updatedAt` | DateTime | Yes | Current Time | Auto-updated UTC timestamp. |

**Indexes:**
- `referenceNumber` (Unique)
- `{ assignedTo: 1, status: 1 }`
- `{ status: 1, createdAt: -1 }`
- `student.email: 1`
- `createdAt: -1`
- `{ preferredCountry: 1, createdAt: -1 }`
- `{ preferredUniversity: 1, createdAt: -1 }`
- `{ priority: 1, createdAt: -1 }`
- `{ assignedTo: 1, createdAt: -1 }`

---

### 2.5 `counters`
Provides distributed atomic incrementation for collision-resistant reference numbering.

| Field Name | Type | Required | Default | Constraints & Rules |
| :--- | :--- | :---: | :---: | :--- |
| `_id` | String | Yes | — | Primary sequence key, e.g. `"inquiry_ref_2026"`. |
| `seq` | Integer | Yes | `0` | Incremented atomically via `$inc`. |

---

### 2.6 `activitylogs`
Append-only tamper-resistant audit trail. Updates and deletions are blocked at the ORM layer.

| Field Name | Type | Required | Default | Constraints & Rules |
| :--- | :--- | :---: | :---: | :--- |
| `_id` | ObjectId | Yes | Auto | Unique identifier |
| `action` | String | Yes | — | E.g., `'inquiry.created'`, `'inquiry.status_changed'`, `'inquiry.assigned'`. Max 100 characters. |
| `entityType` | Enum | Yes | — | One of: `['inquiry', 'country', 'university', 'user']`. |
| `entityId` | ObjectId | Yes | — | ID of target entity. |
| `performedBy` | ObjectId | No | `null` | Reference to `users._id`. Null for public unauthenticated actions. |
| `details` | Object | Yes | `{}` | JSON metadata. Passwords, hashes, tokens, and PII are redacted prior to write. |
| `ipAddress` | String | No | `null` | Client IPv4/IPv6 address. Max 45 characters. |
| `createdAt` | DateTime | Yes | Current Time | Immutable creation timestamp. |

**Indexes:**
- `{ entityType: 1, entityId: 1, createdAt: -1 }`
- `{ action: 1, createdAt: -1 }`
- `{ performedBy: 1, createdAt: -1 }`
- `createdAt: -1`

---

### 2.7 `ratelimits`
High-concurrency distributed rate limit tracking table with automated TTL purging.

| Field Name | Type | Required | Default | Constraints & Rules |
| :--- | :--- | :---: | :---: | :--- |
| `_id` | String | Yes | — | Composed key, e.g. `"inquiry-submit:203.0.113.195"`. Max 256 characters. |
| `count` | Integer | Yes | `1` | Hit counter. |
| `resetAt` | DateTime | Yes | — | Window expiration time. Configured with a TTL index (`expires: 0`). |
| `createdAt` | DateTime | Yes | Current Time | Auto timestamp. |
| `updatedAt` | DateTime | Yes | Current Time | Auto timestamp. |

**Indexes:**
- `resetAt: 1` with `{ expireAfterSeconds: 0 }` (Automatic database-level purging)

---

### 2.8 `systemlocks`
Distributed mutual exclusion lease lock across serverless workers.

| Field Name | Type | Required | Default | Constraints & Rules |
| :--- | :--- | :---: | :---: | :--- |
| `_id` | String | Yes | — | Lock identifier, e.g. `"bootstrap_super_admin"`. |
| `lockedBy` | String | Yes | — | Unique process/worker UUID. |
| `expiresAt` | DateTime | Yes | — | Lease expiration. Enforced with `{ expireAfterSeconds: 0 }`. |

**Indexes:**
- `expiresAt: 1` with `{ expireAfterSeconds: 0 }`

---

### 2.9 `recoverytokens`
Temporary 6-digit OTP codes for student Tracking ID recovery.

| Field Name | Type | Required | Default | Constraints & Rules |
| :--- | :--- | :---: | :---: | :--- |
| `_id` | ObjectId | Yes | Auto | Unique identifier |
| `email` | String | Yes | — | Normalized lowercase student email. |
| `hashedCode` | String | Yes | — | SHA-256 hash of the 6-digit numeric OTP. |
| `attempts` | Integer | Yes | `0` | Number of failed attempts. Maximum 3 allowed before token invalidation. |
| `expiresAt` | DateTime | Yes | — | Expiration timestamp (10 minutes from creation). |
| `verifiedAt` | DateTime | No | `null` | Verification timestamp. |

**Indexes:**
- `email: 1`
- `createdAt: 1` with `{ expireAfterSeconds: 600 }` (Automatic 10-minute TTL)

---

### 2.10 Content Management (CMS) Singleton & Collection Models

#### `blogs` (Collection)
- `title` (String, max 200, req), `slug` (String, unique, req), `excerpt` (String, max 500, req), `content` (String, req), `featuredImage` (`{ publicId, secureUrl, width, height, format }`), `category` (String, default `"Study Abroad Guide"`), `author` (String, default desk name), `isPublished` (Boolean, default `false`), `publishedAt` (DateTime), `seoTitle` (max 100), `seoDescription` (max 255), `createdBy`, `updatedBy`.
- **Indexes:** `slug` (Unique), `{ isPublished: 1, publishedAt: -1 }`, `{ isPublished: 1, category: 1, publishedAt: -1 }`, `createdAt: -1`.

#### `events` (Collection)
- `title` (String, max 200, req), `slug` (String, unique, req), `shortDescription` (String, max 500, req), `fullDescription` (String, req), `eventBanner` (`{ publicId, secureUrl, width, height, format }`), `eventDate` (DateTime, req), `startTime` (String, default `"10:00 AM"`), `endTime` (String, default `"02:00 PM"`), `timeZone` (String, default `"Asia/Dhaka"`), `locationType` (Enum: `['in-person', 'online', 'hybrid']`), `venue` (String, max 300, req), `registrationUrl` (String), `isPublished` (Boolean, default `false`), `seoTitle`, `seoDescription`, `createdBy`, `updatedBy`.
- **Indexes:** `slug` (Unique), `{ isPublished: 1, eventDate: 1 }`, `{ isPublished: 1, eventDate: -1 }`, `eventDate: -1`, `createdAt: -1`.

#### `successstories` (Collection)
- `name` (String, max 100, req), `title` (String, max 200), `youtubeUrl` (String, max 500), `thumbnailUrl` (String), `slug` (String, unique, req), `studentImage` (String), `country` (String, req), `countryFlag` (String, max 10), `university` (String, req), `program` (String, req), `testimonial` (String, max 2000, req), `achievement` (String, max 100), `admissionYear` (String, max 20), `displayOrder` (Number, default `0`), `isPublished` (Boolean, default `false`), `createdBy`, `updatedBy`.
- **Indexes:** `slug` (Unique), `{ isPublished: 1, displayOrder: 1, createdAt: -1 }`.

#### `galleryitems` (Collection)
- `title` (String, max 120, req), `imageUrl` (String, req), `description` (String, max 300), `displayOrder` (Number, default `0`), `isPublished` (Boolean, default `false`), `createdBy`, `updatedBy`.
- **Indexes:** `{ isPublished: 1, displayOrder: 1, createdAt: -1 }`.

#### `sisterconcerns` (Collection)
- `name` (String, max 100, req), `logoUrl` (String, req), `description` (String, max 300, req), `websiteUrl` (String, max 2048, req), `displayOrder` (Number, default `0`), `isPublished` (Boolean, default `true`), `createdBy`, `updatedBy`.
- **Indexes:** `{ isPublished: 1, displayOrder: 1, createdAt: -1 }`.

#### CMS Singleton Documents
- **`sitecontents`** (`key: 'homepage-about'`): Main homepage About Us section text, highlight title, body paragraphs, button link, image URLs (main, top-right, bottom-right), and 10+ Years certification badge.
- **`aboutpages`** (`key: 'about-page'`): Complete dedicated `/about` page sections: Who We Are, Establishment (Year, Story, Milestones), Company Overview, Chairman Message (portrait, message, signature), Our Team (members, designations, photos), Why Choose Us (features with icons), Call To Action, and SEO tags.
- **`contactpages`** (`key: 'contact-page'`): Header, physical address, multiple phone numbers, direct WhatsApp, multiple emails, office hours, social links, Leaflet map coordinates (`mapLatitude`, `mapLongitude`, `mapZoom`, `mapAddress`), CTA, and SEO.
- **`herocontents`** (`singletonKey: 'hero-content'`): Homepage hero heading, subheading, description, and up to 5 slide banners.
- **`herostats`** (`order: 1..4`): 4 numerical counters (e.g. Visa Success `98.5%`, Partner Universities `600+`, Experience `10+` yrs, Placed `15000+`).
- **`footersettings`** (`key: 'footer-setting'`): Social links and up to 6 featured destination country slugs displayed in the public footer.
- **`whatsappsettings`** (`key: 'whatsapp-contact'`): International WhatsApp telephone number powering the floating instant support button.
- **`successstoriespagesettings`** (`key: 'success-stories-page'`): Dedicated `/success-stories` hero heading, subtitle, SEO, and bottom CTA banner.
- **`gallerysettings`** (`key: 'homepage-gallery'`): Homepage gallery section heading, description, and CTA button text.

---

## 3. Routes, Endpoints & API Specifications

### 3.1 Standard HTTP Response Envelopes

#### Success Envelope (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### Error Envelope (`400`, `401`, `403`, `404`, `409`, `429`, `500`, `503`)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload.",
    "details": [
      {
        "field": "student.email",
        "message": "Please provide a valid student email address"
      }
    ]
  }
}
```

---

### 3.2 Public API Endpoints

#### 1. Submit Public Inquiry
- **Method / Path:** `POST /api/inquiries`
- **Auth:** Public
- **Rate Limit:** 10 submissions per IP per hour (`windowMs: 3,600,000`, `limit: 10`).
- **Payload (`JSON`):**
  - `student`: `{ firstName: string, lastName: string, email: string, phone?: string, nationality?: string }` (Required)
  - `academic`: `{ currentEducationLevel: string, fieldOfStudy?: string, gpa?: string, englishProficiency?: string }` (Required)
  - `preferredCountry`: string (24-char ObjectId, optional)
  - `preferredUniversity`: string (24-char ObjectId, optional)
  - `intendedProgram`: string (optional, max 150)
  - `intakeYear`: number (optional, 2020-2050)
  - `intakeSemester`: `'Spring' | 'Summer' | 'Fall' | 'Winter'` (optional)
  - `category`: `'general' | 'application' | 'visa' | 'scholarship' | 'accommodation' | 'other'` (default `'general'`)
  - `message`: string (min 10, max 3000 chars, req)
- **Validation Rules:** Strictly forbids client-supplied `status`, `priority`, `referenceNumber`, `assignedTo`, `notes`, or `documents`. If `preferredUniversity` is sent, it must belong to `preferredCountry`.
- **Response (`201 Created`):**
  ```json
  {
    "success": true,
    "data": {
      "referenceNumber": "HOLY-2026-001",
      "status": "new",
      "createdAt": "2026-11-27T14:00:00.000Z",
      "message": "Your inquiry has been submitted successfully. Please save your reference number for future communication."
    }
  }
  ```

#### 2. Track Application Status
- **Method / Path:** `POST /api/inquiries/track`
- **Auth:** Public
- **Rate Limit:** 30 attempts per IP per 15 minutes.
- **Payload (`JSON`):**
  - `trackingId`: string (min 5, max 40 chars, alphanumeric + hyphens)
  - `email`: string (valid email, normalized lowercase)
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "trackingId": "HOLY-2026-001",
      "studentName": "Tanvir A.",
      "preferredCountry": "United Kingdom",
      "preferredUniversity": "University of Hertfordshire",
      "intendedProgram": "MSc Data Science",
      "intake": "Fall 2026",
      "status": "in-review",
      "statusLabel": "Under Academic Evaluation",
      "statusDescription": "Our senior admissions committee is evaluating your academic grades, program options, and scholarship eligibility.",
      "submittedAt": "2026-11-20T10:30:00.000Z",
      "lastUpdatedAt": "2026-11-22T12:00:00.000Z",
      "timeline": [
        { "id": "1", "title": "Application Received", "description": "...", "status": "completed", "date": "Nov 20, 2026" },
        { "id": "2", "title": "Counselor Review & Assessment", "description": "...", "status": "current", "date": "Nov 22, 2026" },
        { "id": "3", "title": "Document Vetting & Verification", "description": "...", "status": "pending" },
        { "id": "4", "title": "University Submission & Visa Filing", "description": "...", "status": "pending" },
        { "id": "5", "title": "Offer & Final Outcome", "description": "...", "status": "pending" }
      ],
      "advisoryNote": "Your designated counselor will reach out if additional academic details are needed."
    }
  }
  ```

#### 3. Request Tracking ID Recovery Code
- **Method / Path:** `POST /api/inquiries/recover/request`
- **Auth:** Public
- **Rate Limit:** 5 requests per IP per 15 minutes.
- **Payload:** `{ "email": "student@example.com" }`
- **Behavior:** Generates a 6-digit OTP, hashes it with SHA-256, stores in `recoverytokens` with 10-minute TTL. Returns a constant-time generic response regardless of whether the email exists in the database.
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "message": "If an active application is associated with this email address, a 6-digit verification code has been dispatched."
    }
  }
  ```

#### 4. Verify Recovery OTP & Retrieve Applications
- **Method / Path:** `POST /api/inquiries/recover/verify`
- **Auth:** Public
- **Rate Limit:** 5 attempts per IP per 15 minutes.
- **Payload:** `{ "email": "student@example.com", "code": "935548" }`
- **Behavior:** Compares input code hash against stored token using timing-safe comparison (`crypto.timingSafeEqual`). If invalid, increments `attempts`; if attempts >= 3, deletes token. Upon success, deletes token and returns all application summaries associated with that email.
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": [
      {
        "trackingId": "HOLY-2026-001",
        "preferredCountry": "United Kingdom",
        "preferredUniversity": "University of Hertfordshire",
        "intendedProgram": "MSc Data Science",
        "intake": "Fall 2026",
        "statusLabel": "Under Academic Evaluation",
        "submittedAt": "Nov 20, 2026"
      }
    ]
  }
  ```

#### 5. Public Destinations Listing & Detail
- `GET /api/countries`: Query parameters: `page`, `limit`, `search`. Returns only `isPublished: true` destinations ordered by `order: 1`.
- `GET /api/countries/[id]`: Returns single published destination by ObjectId or slug.

#### 6. Public Universities Listing & Detail
- `GET /api/universities`: Query parameters: `page`, `limit`, `country` (ID or slug), `search`. Returns only `isPublished: true` universities.
- `GET /api/universities/[id]`: Returns single published university profile.

#### 7. Public Content Directories
- `GET /api/blogs`: Query: `page`, `limit`, `category`, `search`. Returns published blogs ordered by `publishedAt: -1`.
- `GET /api/blogs/[slug]`: Returns published blog by slug.
- `GET /api/events`: Query: `filter: 'all' | 'upcoming' | 'past'`. Returns published events.
- `GET /api/events/[slug]`: Returns published event by slug.
- `GET /api/whatsapp`: Returns public WhatsApp phone number from CMS.
- `GET /api/health`: Database connection status check. Returns `{ "success": true, "status": "ok", "database": "connected" }`.

---

### 3.3 Protected Admin & Counselor Endpoints

All protected endpoints require an active session where `user.isActive === true`. Session identity must be verified on the server.

#### 1. List Inquiries
- **Method / Path:** `GET /api/inquiries`
- **Auth:** Admin, Super Admin
- **Query Params:** `page` (default 1), `limit` (max 100), `status`, `priority`, `category`, `assignedTo`, `preferredCountry`, `preferredUniversity`, `search`, `sort: 'newest' | 'oldest' | 'priority_desc' | 'priority_asc'`.
- **Default Filter:** Automatically excludes `status: 'closed'` unless `status` is explicitly requested.

#### 2. Get Single Inquiry
- **Method / Path:** `GET /api/inquiries/[id]`
- **Auth:** Admin, Super Admin
- **Response:** Full inquiry document populated with destination, university, counselor details, internal notes, and audit history.

#### 3. Update Inquiry Status
- **Method / Path:** `PUT /api/inquiries/[id]/status`
- **Auth:** Admin, Super Admin
- **Payload:** `{ "status": "processing" }`
- **Validation:** Must obey `ALLOWED_STATUS_TRANSITIONS`. Only Super Admin can transition from or to `'closed'` or `'rejected'`.
- **Atomic Guard:** Uses atomic query condition `{ _id: id, status: existingStatus }` to prevent concurrent race conditions.

#### 4. Add Internal Note
- **Method / Path:** `POST /api/inquiries/[id]/notes`
- **Auth:** Admin, Super Admin
- **Payload:** `{ "content": "Spoke to student, requesting updated IELTS score sheet." }` (Min 1, max 5000 chars)
- **Behavior:** Atomically appends `{ _id, content, createdBy: actor.id, createdAt: now }` to `inquiries.notes`. Records `inquiry.note_added` in `activitylogs`.

#### 5. Assign / Reassign Inquiry
- **Method / Path:** `POST /api/inquiries/[id]/assign` (Initial) & `PUT /api/inquiries/[id]/assign` (Reassign)
- **Auth:** Super Admin Only (`super-admin`)
- **Payload:** `{ "assignedTo": "<user_object_id>" }`
- **Validation:** Target user must exist, be active, and possess `admin` or `super-admin` role. Initial assignment automatically transitions status from `'new'` to `'assigned'`.

#### 6. Request Cloudinary Upload Signature
- **Method / Path:** `POST /api/uploads/signature`
- **Auth:** Admin, Super Admin
- **Payload:** `{ "purpose": "country-cover", "mimeType": "image/webp" }`
- **Behavior:** Validates purpose against `UPLOAD_PURPOSE_MAP`. Generates a server-locked folder, random UUID public ID, timestamp, and HMAC-SHA1 signature using Cloudinary API Secret. The browser uploads the binary directly to Cloudinary using these credentials.

#### 7. User & Staff Management
- `GET /api/users`: Query: `page`, `limit`, `role`, `isActive`, `search`. (Super Admin Only)
- `POST /api/users`: Create admin user `{ name, email, password, role, isActive }`. (Super Admin Only)
- `PUT /api/users/[id]`: Update user details, role, password, or toggle `isActive`. (Super Admin Only)
- `DELETE /api/users/[id]`: Deactivate / delete staff account. (Super Admin Only)

#### 8. Destinations & Universities Management
- `POST /api/countries`: Create country. (Super Admin Only)
- `PUT /api/countries/[id]`: Update country. (Super Admin Only)
- `DELETE /api/countries/[id]`: Delete country. (Super Admin Only)
- `PUT /api/countries/reorder`: Bulk update display ordering index. (Super Admin Only)
- `POST /api/universities`: Create university. (Super Admin Only)
- `PUT /api/universities/[id]`: Update university. (Super Admin Only)
- `DELETE /api/universities/[id]`: Delete university. (Super Admin Only)

#### 9. CMS Content Endpoints (Super Admin Only)
- `GET` & `PUT` `/api/admin/content/about`: Homepage About Us section
- `GET` & `PUT` `/api/admin/content/about-page`: Dedicated `/about` page sections
- `GET` & `PUT` `/api/admin/content/contact-page`: Dedicated `/contact` page sections
- `GET` & `PUT` `/api/admin/content/hero-content`: Homepage Hero banner & slides
- `GET` & `PUT` `/api/admin/content/hero-stats`: Homepage 4 stats counters
- `GET` & `PUT` `/api/admin/content/footer`: Footer social links and featured destination slugs
- `GET` & `PUT` `/api/admin/content/whatsapp`: Floating WhatsApp contact number
- `GET` & `PUT` `/api/admin/content/success-stories-page`: Dedicated Success Stories page layout
- `GET`, `POST`, `PUT`, `DELETE` `/api/admin/content/success-stories`: Student success stories
- `PUT` `/api/admin/content/success-stories` (Reorder): Bulk display reordering
- `GET`, `POST`, `PUT`, `DELETE` `/api/admin/content/gallery`: Gallery media items
- `GET` & `PUT` `/api/admin/content/gallery/settings`: Homepage gallery section settings
- `GET`, `POST`, `PUT`, `DELETE` `/api/admin/content/sister-concerns`: Sister concern companies
- `GET`, `POST`, `PUT`, `DELETE` `/api/admin/content/blogs`: CMS blog posts
- `GET`, `POST`, `PUT`, `DELETE` `/api/admin/content/events`: CMS educational events
- `POST /api/revalidate-all`: Super-Admin cache purge trigger across all cache tags

---

## 4. Business Logic & System Workflows

### 4.1 Inquiry Status Lifecycle & State Machine

```
   [ Public Submit ]
          |
          v
       +-----+
       | new |
       +-----+
          |
          +-----------------------+-----------------------+
          |                       |                       |
          v                       v                       v
    +----------+            +-----------+            +--------+
    | assigned |----------->| in-review |----------->| closed |
    +----------+            +-----------+            +--------+
          |                       |                       ^
          |                       +--------+              |
          v                                v              |
    +--------------------+       +--------------------+   |
    | documents-requested|<----->| documents-received |   |
    +--------------------+       +--------------------+   |
                                           |              |
                                           v              |
                                    +------------+        |
                                    | processing |        |
                                    +------------+        |
                                           |              |
                                           +-------+      |
                                           |       |      |
                                           v       v      |
                                  +----------+  +----------+
                                  | approved |  | rejected |
                                  +----------+  +----------+
                                       |             |
                                       +------+------+
                                              |
                                              v
                                         +--------+
                                         | closed |
                                         +--------+
```

#### Transition Invariants:
1. When a new inquiry is submitted, it enters state `new`.
2. When a counselor is assigned, if the status is `new`, it transitions to `assigned`.
3. Counselors can move inquiries forward into review, document requests, processing, and resolution (`approved` or `rejected`).
4. Reopening policy: Once an inquiry is marked `closed` or `rejected`, standard counselors cannot modify its status. Only a `super-admin` can transition it back to `in-review`.

---

### 4.2 Distributed Bootstrap Seeding Workflow

To prevent multiple serverless/container workers from attempting to create conflicting Super Admin accounts simultaneously during cluster initialization:

```
[ Worker Start ]
       |
       v
Acquire Distributed Lock:
`findOneAndUpdate({ _id: "bootstrap_super_admin", expiresAt: < now }, ...)`
       |
       +------------------------------------+
       |                                    |
   (Acquired)                           (Failed)
       |                                    |
       v                                    v
Check if any Super Admin exists.      Wait or exit gracefully.
If not, create with Bcrypt salt 12.   Do not duplicate write.
       |
       v
Release Distributed Lock:
`deleteOne({ _id: "bootstrap_super_admin", lockedBy: uuid })`
```

---

### 4.3 Media Upload Architecture (Signed Direct-to-Cloud)

To avoid proxying heavy image uploads through backend application instances:
1. Authenticated administrator selects an image in the CMS.
2. Client requests signed upload parameters via `POST /api/uploads/signature` with `{ purpose, mimeType }`.
3. Server validates upload purpose against the strict folder map and checks allowed MIME types (`JPEG`, `PNG`, `WebP`, `AVIF`).
4. Server generates a cryptographically random public ID (`holy-tgs/<purpose>/<uuid>`) and computes an HMAC signature using the Cloudinary API Secret.
5. Client browser uploads the binary directly to the Cloudinary API endpoint using the provided signature, timestamp, and public ID.
6. Cloudinary processes and compresses the asset, returning a normalized `secure_url`.
7. Client submits the final form (e.g. updating a country or blog) referencing the verified `secure_url`.

---

### 4.4 Rate Limiting & Proxy IP Resolution Architecture

To defend against Denial-of-Service (DoS) and brute-force attacks across serverless instances:
1. **IP Extraction Hierarchy:** The server inspects request headers according to the `TRUST_PROXY` configuration:
   - `TRUST_PROXY=cloudflare`: Trusts `cf-connecting-ip`.
   - `TRUST_PROXY=vercel`: Trusts `x-real-ip` or the first entry of `x-forwarded-for`.
   - `TRUST_PROXY=true`: Checks `cf-connecting-ip` → `x-real-ip` → `x-forwarded-for` (leftmost IP).
   - In production, if an IP cannot be validated against IPv4/IPv6 syntax, the request fails closed (`HTTP 400 Bad Request`) rather than grouping users under `127.0.0.1`.
2. **Storage Providers:**
   - **MongoDB Store (`mongodb`):** Uses atomic `$inc` updates in the `ratelimits` collection. Expired windows are pruned automatically by MongoDB's background TTL index.
   - **Redis Store (`redis`):** Uses an HTTP REST pipeline (`INCR` + `PTTL` + `PEXPIRE`) suitable for connectionless serverless functions.
   - **Fail-Closed Rule:** If the rate limit store becomes unreachable during a request in production, the system throws `HTTP 503 Service Unavailable` rather than allowing unmetered traffic.

---

### 4.5 Activity Logging & Data Redaction

All internal mutations (inquiry creation, status changes, assignments, notes, user updates) automatically record an immutable audit entry in `activitylogs`. Before persisting to the database, a pre-save sanitizer scans the payload recursively. Any key containing substring matches to:
`password`, `token`, `secret`, `cookie`, `creditcard`, `ssn`, `gpa`, `cv`, `transcript`, or `phonenumber`
is automatically replaced with `[REDACTED_SENSITIVE_DATA]`.

---

## 5. Environment Variables & Third-Party Integrations

### 5.1 Environment Configuration Matrix

| Variable Name | Required | Example / Format | Purpose |
| :--- | :---: | :--- | :--- |
| `MONGODB_URI` | **Yes** | `mongodb+srv://user:pass@cluster.mongodb.net/holy_tgs?retryWrites=true&w=majority` | Primary document database connection string. |
| `AUTH_SECRET` | **Yes** | 32-byte Base64 or Hex random string | HMAC encryption key for session tokens and cookies. |
| `AUTH_URL` | **Yes** | `https://www.holytgsbd.com` | Authoritative public URL of the application. |
| `CLOUDINARY_CLOUD_NAME` | **Yes** | `dxyabc123` | Cloudinary account cloud identifier. |
| `CLOUDINARY_API_KEY` | **Yes** | `123456789012345` | Cloudinary API Key for upload signing. |
| `CLOUDINARY_API_SECRET` | **Yes** | String (secret) | Cloudinary API Secret (server-side only, never exposed). |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | **Yes** | `dxyabc123` | Client-accessible cloud identifier for image transformations. |
| `RATE_LIMIT_STORE` | **Yes** | `'mongodb'` or `'redis'` (`'memory'` for dev only) | Distributed storage engine for request metering. |
| `TRUST_PROXY` | **Yes** | `'true'`, `'vercel'`, `'cloudflare'`, or `'false'` | Configures reverse-proxy header evaluation for client IP resolution. |
| `SITE_NOINDEX` | No | `'true'` or `'false'` (Default: `'true'`) | When `'true'`, injects `noindex, nofollow` into metadata to hide from search engines. |
| `DISABLE_INQUIRY_RATE_LIMIT`| No | `'true'` or `'false'` (Default: unset/false) | Emergency bypass flag to temporarily deactivate public inquiry rate limiting. |
| `SUPER_ADMIN_NAME` | No | `"System Super Admin"` | Default name used by bootstrap seed script. |
| `SUPER_ADMIN_EMAIL` | No | `admin@holytgs.com` | Default email used by bootstrap seed script. |
| `SUPER_ADMIN_PASSWORD` | No | String (min 8 chars) | Initial password used by bootstrap seed script. |
| `UPSTASH_REDIS_REST_URL` | No | `https://xxx.upstash.io` | Required only if `RATE_LIMIT_STORE=redis`. |
| `UPSTASH_REDIS_REST_TOKEN` | No | String (secret) | Required only if `RATE_LIMIT_STORE=redis`. |
| `REDIS_URL` | No | `redis://...` | Alternative Redis connection string. |

---

### 5.2 External Service Integration Specifications

1. **Database Service (MongoDB Atlas):**
   - Requires replica set support for distributed transactions (or falls back cleanly to non-transactional atomic operations on standalone setups).
   - Enforces automated index creation via `createIndexes()` upon bootstrap (never calls destructive `syncIndexes()`).
2. **Media Storage Service (Cloudinary):**
   - Media assets are never stored on the local application filesystem.
   - All client uploads are signed server-side and dispatched directly from the browser to Cloudinary.
   - Served via CDN with automatic WebP/AVIF format optimization and responsive dimension delivery.
3. **Notification Gateway (Email / OTP):**
   - The application tracking recovery subsystem dispatches 6-digit numeric passcodes.
   - Designed to plug into an SMTP or transactional email API provider (e.g., SendGrid, Postmark, AWS SES, Resend) by replacing the simulated development logger in `TrackingService.requestTrackingIdRecovery`.
