-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('super-admin', 'admin');

-- CreateEnum
CREATE TYPE "IntakeSemester" AS ENUM ('Spring', 'Summer', 'Fall', 'Winter');

-- CreateEnum
CREATE TYPE "InquiryCategory" AS ENUM ('general', 'application', 'visa', 'scholarship', 'accommodation', 'other');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('new', 'assigned', 'in-review', 'documents-requested', 'documents-received', 'processing', 'approved', 'rejected', 'closed');

-- CreateEnum
CREATE TYPE "InquiryPriority" AS ENUM ('low', 'normal', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM ('inquiry', 'country', 'university', 'user');

-- CreateEnum
CREATE TYPE "EventLocationType" AS ENUM ('in-person', 'online', 'hybrid');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'admin',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "description" VARCHAR(5000) NOT NULL,
    "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "imageUrl" VARCHAR(2048),
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "educationSystem" TEXT,
    "admissionRequirements" TEXT,
    "tuitionAndLivingCosts" TEXT,
    "visaRequirements" TEXT,
    "intakes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "scholarshipInfo" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universities" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "countryId" TEXT NOT NULL,
    "city" VARCHAR(100),
    "logoUrl" VARCHAR(2048),
    "imageUrl" VARCHAR(2048),
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" VARCHAR(5000) NOT NULL,
    "programs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "admissionRequirements" TEXT,
    "englishRequirements" VARCHAR(2000),
    "scholarshipDetails" TEXT,
    "applicationDeadlines" VARCHAR(2000),
    "website" VARCHAR(2048),
    "tuitionRange" JSONB,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiries" (
    "id" TEXT NOT NULL,
    "referenceNumber" VARCHAR(40) NOT NULL,
    "studentFirstName" VARCHAR(50) NOT NULL,
    "studentLastName" VARCHAR(50) NOT NULL,
    "studentEmail" VARCHAR(255) NOT NULL,
    "studentPhone" VARCHAR(30),
    "studentNationality" VARCHAR(50),
    "currentEducationLevel" VARCHAR(100) NOT NULL,
    "fieldOfStudy" VARCHAR(100),
    "gpa" VARCHAR(20),
    "englishProficiency" VARCHAR(100),
    "preferredCountryId" TEXT,
    "preferredUniversityId" TEXT,
    "intendedProgram" VARCHAR(150),
    "intakeYear" INTEGER,
    "intakeSemester" "IntakeSemester",
    "category" "InquiryCategory" NOT NULL DEFAULT 'general',
    "message" VARCHAR(3000) NOT NULL,
    "status" "InquiryStatus" NOT NULL DEFAULT 'new',
    "priority" "InquiryPriority" NOT NULL DEFAULT 'normal',
    "assignedToId" TEXT,
    "assignedById" TEXT,
    "assignedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiry_notes" (
    "id" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "content" VARCHAR(5000) NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inquiry_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiry_documents" (
    "id" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "fileType" VARCHAR(100) NOT NULL,
    "storageKey" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inquiry_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counters" (
    "id" VARCHAR(100) NOT NULL,
    "seq" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "counters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "entityType" "AuditEntityType" NOT NULL,
    "entityId" VARCHAR(100) NOT NULL,
    "performedById" TEXT,
    "details" JSONB NOT NULL DEFAULT '{}',
    "ipAddress" VARCHAR(45),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limits" (
    "id" VARCHAR(256) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "resetAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_locks" (
    "id" VARCHAR(100) NOT NULL,
    "lockedBy" VARCHAR(100) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_locks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recovery_tokens" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "hashedCode" VARCHAR(128) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recovery_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blogs" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(220) NOT NULL,
    "excerpt" VARCHAR(500) NOT NULL,
    "content" TEXT NOT NULL,
    "featuredImage" JSONB,
    "category" VARCHAR(100) NOT NULL DEFAULT 'Study Abroad Guide',
    "author" VARCHAR(100) NOT NULL DEFAULT 'Zero Compile Editorial Desk',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "seoTitle" VARCHAR(100),
    "seoDescription" VARCHAR(255),
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(220) NOT NULL,
    "shortDescription" VARCHAR(500) NOT NULL,
    "fullDescription" TEXT NOT NULL,
    "eventBanner" JSONB,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "startTime" VARCHAR(40) NOT NULL DEFAULT '10:00 AM',
    "endTime" VARCHAR(40) NOT NULL DEFAULT '02:00 PM',
    "timeZone" VARCHAR(60) NOT NULL DEFAULT 'Asia/Dhaka',
    "locationType" "EventLocationType" NOT NULL DEFAULT 'in-person',
    "venue" VARCHAR(300) NOT NULL,
    "registrationUrl" VARCHAR(2048),
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" VARCHAR(100),
    "seoDescription" VARCHAR(255),
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "success_stories" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "title" VARCHAR(200),
    "youtubeUrl" VARCHAR(500),
    "thumbnailUrl" VARCHAR(2048),
    "slug" VARCHAR(220) NOT NULL,
    "studentImage" VARCHAR(2048),
    "country" VARCHAR(100) NOT NULL,
    "countryFlag" VARCHAR(10),
    "university" VARCHAR(150) NOT NULL,
    "program" VARCHAR(150) NOT NULL,
    "testimonial" VARCHAR(2000) NOT NULL,
    "achievement" VARCHAR(100),
    "admissionYear" VARCHAR(20),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "success_stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_items" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "imageUrl" VARCHAR(2048) NOT NULL,
    "description" VARCHAR(300),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sister_concerns" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "logoUrl" VARCHAR(2048) NOT NULL,
    "description" VARCHAR(300) NOT NULL,
    "websiteUrl" VARCHAR(2048) NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sister_concerns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_contents" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(100) NOT NULL DEFAULT 'homepage-about',
    "heading" VARCHAR(200) NOT NULL,
    "highlightTitle" VARCHAR(200),
    "bodyParagraphs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "buttonText" VARCHAR(60) NOT NULL DEFAULT 'Learn More',
    "buttonLink" VARCHAR(200) NOT NULL DEFAULT '/about',
    "mainImageUrl" VARCHAR(2048),
    "topRightImageUrl" VARCHAR(2048),
    "bottomRightImageUrl" VARCHAR(2048),
    "yearsBadgeText" VARCHAR(100) NOT NULL DEFAULT '10+ Years Experience',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_pages" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(100) NOT NULL DEFAULT 'about-page',
    "whoWeAreTitle" VARCHAR(200) NOT NULL DEFAULT 'Who We Are',
    "whoWeAreBody" TEXT NOT NULL DEFAULT '',
    "establishmentYear" VARCHAR(20) NOT NULL DEFAULT '2015',
    "establishmentStory" TEXT NOT NULL DEFAULT '',
    "milestones" JSONB NOT NULL DEFAULT '[]',
    "companyOverview" TEXT NOT NULL DEFAULT '',
    "chairmanName" VARCHAR(120) NOT NULL DEFAULT '',
    "chairmanTitle" VARCHAR(120) NOT NULL DEFAULT 'Chairman',
    "chairmanPortraitUrl" VARCHAR(2048),
    "chairmanMessage" TEXT NOT NULL DEFAULT '',
    "chairmanSignature" VARCHAR(200),
    "teamMembers" JSONB NOT NULL DEFAULT '[]',
    "whyChooseUs" JSONB NOT NULL DEFAULT '[]',
    "ctaHeading" VARCHAR(200) NOT NULL DEFAULT 'Ready to Start Your Global Journey?',
    "ctaButtonText" VARCHAR(60) NOT NULL DEFAULT 'Apply Now',
    "ctaButtonLink" VARCHAR(200) NOT NULL DEFAULT '/apply',
    "seoTitle" VARCHAR(100),
    "seoDescription" VARCHAR(255),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_pages" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(100) NOT NULL DEFAULT 'contact-page',
    "headerTitle" VARCHAR(200) NOT NULL DEFAULT 'Contact Zero Compile',
    "headerSubtitle" VARCHAR(500) NOT NULL DEFAULT 'Speak with our admissions counselors.',
    "address" VARCHAR(500) NOT NULL DEFAULT '',
    "phones" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "whatsappNumber" VARCHAR(40),
    "emails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "officeHours" VARCHAR(200) NOT NULL DEFAULT 'Sun–Thu: 10:00 AM – 6:00 PM',
    "socialLinks" JSONB NOT NULL DEFAULT '{}',
    "mapLatitude" DOUBLE PRECISION NOT NULL DEFAULT 23.8103,
    "mapLongitude" DOUBLE PRECISION NOT NULL DEFAULT 90.4125,
    "mapZoom" INTEGER NOT NULL DEFAULT 14,
    "mapAddress" VARCHAR(300) NOT NULL DEFAULT '',
    "ctaHeading" VARCHAR(200) NOT NULL DEFAULT 'Book a Free Consultation',
    "seoTitle" VARCHAR(100),
    "seoDescription" VARCHAR(255),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hero_contents" (
    "id" TEXT NOT NULL,
    "singletonKey" VARCHAR(100) NOT NULL DEFAULT 'hero-content',
    "heading" VARCHAR(200) NOT NULL,
    "subheading" VARCHAR(200) NOT NULL DEFAULT '',
    "description" VARCHAR(1000) NOT NULL DEFAULT '',
    "slides" JSONB NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hero_stats" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "value" VARCHAR(40) NOT NULL,
    "suffix" VARCHAR(20),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_settings" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(100) NOT NULL DEFAULT 'footer-setting',
    "socialLinks" JSONB NOT NULL DEFAULT '{}',
    "featuredCountrySlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_settings" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(100) NOT NULL DEFAULT 'whatsapp-contact',
    "phoneNumber" VARCHAR(30) NOT NULL,
    "defaultMessage" VARCHAR(300),
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "success_stories_page_settings" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(100) NOT NULL DEFAULT 'success-stories-page',
    "heroHeading" VARCHAR(200) NOT NULL,
    "heroSubtitle" VARCHAR(500) NOT NULL DEFAULT '',
    "ctaHeading" VARCHAR(200) NOT NULL DEFAULT 'Write Your Own Success Story',
    "ctaButtonText" VARCHAR(60) NOT NULL DEFAULT 'Apply Today',
    "ctaButtonLink" VARCHAR(200) NOT NULL DEFAULT '/apply',
    "seoTitle" VARCHAR(100),
    "seoDescription" VARCHAR(255),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "success_stories_page_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_settings" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(100) NOT NULL DEFAULT 'homepage-gallery',
    "heading" VARCHAR(200) NOT NULL,
    "description" VARCHAR(500) NOT NULL DEFAULT '',
    "ctaText" VARCHAR(60) NOT NULL DEFAULT 'View Full Gallery',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_isActive_idx" ON "users"("role", "isActive");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "countries_name_key" ON "countries"("name");

-- CreateIndex
CREATE UNIQUE INDEX "countries_slug_key" ON "countries"("slug");

-- CreateIndex
CREATE INDEX "countries_isPublished_createdAt_idx" ON "countries"("isPublished", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "countries_order_idx" ON "countries"("order");

-- CreateIndex
CREATE UNIQUE INDEX "universities_slug_key" ON "universities"("slug");

-- CreateIndex
CREATE INDEX "universities_countryId_isPublished_idx" ON "universities"("countryId", "isPublished");

-- CreateIndex
CREATE INDEX "universities_isPublished_createdAt_idx" ON "universities"("isPublished", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "universities_isPublished_name_idx" ON "universities"("isPublished", "name");

-- CreateIndex
CREATE INDEX "universities_countryId_isPublished_name_idx" ON "universities"("countryId", "isPublished", "name");

-- CreateIndex
CREATE INDEX "universities_name_idx" ON "universities"("name");

-- CreateIndex
CREATE INDEX "universities_createdAt_idx" ON "universities"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "inquiries_referenceNumber_key" ON "inquiries"("referenceNumber");

-- CreateIndex
CREATE INDEX "inquiries_assignedToId_status_idx" ON "inquiries"("assignedToId", "status");

-- CreateIndex
CREATE INDEX "inquiries_status_createdAt_idx" ON "inquiries"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "inquiries_studentEmail_idx" ON "inquiries"("studentEmail");

-- CreateIndex
CREATE INDEX "inquiries_createdAt_idx" ON "inquiries"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "inquiries_preferredCountryId_createdAt_idx" ON "inquiries"("preferredCountryId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "inquiries_preferredUniversityId_createdAt_idx" ON "inquiries"("preferredUniversityId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "inquiries_priority_createdAt_idx" ON "inquiries"("priority", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "inquiries_assignedToId_createdAt_idx" ON "inquiries"("assignedToId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "inquiry_notes_inquiryId_createdAt_idx" ON "inquiry_notes"("inquiryId", "createdAt");

-- CreateIndex
CREATE INDEX "inquiry_documents_inquiryId_idx" ON "inquiry_documents"("inquiryId");

-- CreateIndex
CREATE INDEX "activity_logs_entityType_entityId_createdAt_idx" ON "activity_logs"("entityType", "entityId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "activity_logs_action_createdAt_idx" ON "activity_logs"("action", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "activity_logs_performedById_createdAt_idx" ON "activity_logs"("performedById", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "rate_limits_resetAt_idx" ON "rate_limits"("resetAt");

-- CreateIndex
CREATE INDEX "system_locks_expiresAt_idx" ON "system_locks"("expiresAt");

-- CreateIndex
CREATE INDEX "recovery_tokens_email_idx" ON "recovery_tokens"("email");

-- CreateIndex
CREATE INDEX "recovery_tokens_expiresAt_idx" ON "recovery_tokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "blogs_slug_key" ON "blogs"("slug");

-- CreateIndex
CREATE INDEX "blogs_isPublished_publishedAt_idx" ON "blogs"("isPublished", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "blogs_isPublished_category_publishedAt_idx" ON "blogs"("isPublished", "category", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "blogs_createdAt_idx" ON "blogs"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE INDEX "events_isPublished_eventDate_idx" ON "events"("isPublished", "eventDate");

-- CreateIndex
CREATE INDEX "events_isPublished_eventDate_desc_idx" ON "events"("isPublished", "eventDate" DESC);

-- CreateIndex
CREATE INDEX "events_eventDate_idx" ON "events"("eventDate" DESC);

-- CreateIndex
CREATE INDEX "events_createdAt_idx" ON "events"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "success_stories_slug_key" ON "success_stories"("slug");

-- CreateIndex
CREATE INDEX "success_stories_isPublished_displayOrder_createdAt_idx" ON "success_stories"("isPublished", "displayOrder", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "gallery_items_isPublished_displayOrder_createdAt_idx" ON "gallery_items"("isPublished", "displayOrder", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "sister_concerns_isPublished_displayOrder_createdAt_idx" ON "sister_concerns"("isPublished", "displayOrder", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "site_contents_key_key" ON "site_contents"("key");

-- CreateIndex
CREATE UNIQUE INDEX "about_pages_key_key" ON "about_pages"("key");

-- CreateIndex
CREATE UNIQUE INDEX "contact_pages_key_key" ON "contact_pages"("key");

-- CreateIndex
CREATE UNIQUE INDEX "hero_contents_singletonKey_key" ON "hero_contents"("singletonKey");

-- CreateIndex
CREATE UNIQUE INDEX "hero_stats_order_key" ON "hero_stats"("order");

-- CreateIndex
CREATE UNIQUE INDEX "footer_settings_key_key" ON "footer_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_settings_key_key" ON "whatsapp_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "success_stories_page_settings_key_key" ON "success_stories_page_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "gallery_settings_key_key" ON "gallery_settings"("key");

-- AddForeignKey
ALTER TABLE "countries" ADD CONSTRAINT "countries_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universities" ADD CONSTRAINT "universities_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universities" ADD CONSTRAINT "universities_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_preferredCountryId_fkey" FOREIGN KEY ("preferredCountryId") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_preferredUniversityId_fkey" FOREIGN KEY ("preferredUniversityId") REFERENCES "universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiry_notes" ADD CONSTRAINT "inquiry_notes_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "inquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiry_notes" ADD CONSTRAINT "inquiry_notes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiry_documents" ADD CONSTRAINT "inquiry_documents_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "inquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
