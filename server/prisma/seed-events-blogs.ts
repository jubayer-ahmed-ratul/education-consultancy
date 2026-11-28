import 'dotenv/config';
import path from 'node:path';
import dotenv from 'dotenv';
import { PrismaClient, EventLocationType } from '@prisma/client';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const EVENTS = [
  {
    title: 'UK & Canada Admission Expo — Dhaka 2026',
    slug: 'uk-canada-admission-expo-dhaka-2026',
    shortDescription:
      'Meet official university representatives from the UK and Canada for on-the-spot profile assessments, scholarship eligibility checks, and 2026–27 intake applications.',
    fullDescription:
      'Join StudySphere at our flagship UK & Canada Admission Expo in Dhaka. Students and parents can meet admissions officers directly, review academic transcripts and IELTS requirements, explore merit scholarships up to 50%, and receive free SOP & visa guidance.\n\nWhat to Bring:\n• Academic transcripts & certificates (SSC, HSC, Bachelor’s)\n• IELTS / PTE / TOEFL score report (if available)\n• Updated CV & Passport copy\n\nHighlights:\n• On-the-spot eligibility assessment for Russell Group & U15 universities\n• Zero application fee waivers for eligible applicants\n• Dedicated UK Student Route & Canada Study Permit desk',
    eventBanner: {
      publicId: 'studysphere/events/uk-canada-expo-dhaka',
      secureUrl:
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80',
    },
    eventDate: new Date('2026-12-12T10:00:00+06:00'),
    startTime: '10:00 AM',
    endTime: '05:00 PM',
    timeZone: 'Asia/Dhaka',
    locationType: EventLocationType.in_person,
    venue: 'The Westin Dhaka, Gulshan-2, Dhaka 1212',
    registrationUrl: 'https://study-consultency.vercel.app/apply',
    isPublished: true,
    seoTitle: 'UK & Canada Admission Expo Dhaka 2026 | StudySphere',
    seoDescription:
      'Meet UK and Canada university representatives in Dhaka for spot assessments, scholarships, and visa guidance.',
  },
  {
    title: 'Scholarship & High-Impact SOP Masterclass',
    slug: 'scholarship-and-sop-masterclass',
    shortDescription:
      'Interactive online workshop on structuring winning Statements of Purpose (SOPs), Letters of Recommendation, and Chevening/Commonwealth scholarship essays.',
    fullDescription:
      'A 90-minute live masterclass led by StudySphere senior editorial mentors. Learn how admissions committees evaluate Master’s and Undergraduate statements, avoid common clichés, and align your academic background with career impact.\n\nSession Agenda:\n1. Anatomy of a high-converting SOP (Hook, Academic Arc, Target Program Fit, Future Plan)\n2. Framing study gaps or career switches professionally\n3. Scholarship essay frameworks (Chevening, DAAD, Australia Awards, Merit Bursaries)\n4. Live Q&A and profile review',
    eventBanner: {
      publicId: 'studysphere/events/sop-scholarship-masterclass',
      secureUrl:
        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80',
    },
    eventDate: new Date('2026-12-19T19:30:00+06:00'),
    startTime: '07:30 PM',
    endTime: '09:00 PM',
    timeZone: 'Asia/Dhaka',
    locationType: EventLocationType.online,
    venue: 'Live Zoom Webinar (Link sent upon registration)',
    registrationUrl: 'https://study-consultency.vercel.app/apply',
    isPublished: true,
    seoTitle: 'Scholarship & SOP Masterclass | StudySphere',
    seoDescription:
      'Learn how to write winning SOPs and scholarship essays for top global universities.',
  },
  {
    title: 'Australia Student Visa & Genuine Student (GS) Briefing',
    slug: 'australia-student-visa-gs-briefing',
    shortDescription:
      'Comprehensive compliance briefing on Australian Subclass 500 visa rules, Genuine Student (GS) requirement, financial capacity, and post-study work rights.',
    fullDescription:
      'Planning for the 2027 Australian intake? Our registered education counselors break down the Genuine Student (GS) assessment criteria, CoE issuance timelines, OSHC coverage, and acceptable financial sponsors for Bangladeshi applicants.\n\nKey Topics Covered:\n• Subclass 500 documentation checklist & bank solvency guidelines\n• Answering the 4 Genuine Student (GS) questions clearly\n• Group of Eight (Go8) & regional university post-study work extensions\n• One-on-one document verification clinic',
    eventBanner: {
      publicId: 'studysphere/events/australia-visa-briefing',
      secureUrl:
        'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=1400&q=80',
    },
    eventDate: new Date('2026-12-26T15:00:00+06:00'),
    startTime: '03:00 PM',
    endTime: '05:30 PM',
    timeZone: 'Asia/Dhaka',
    locationType: EventLocationType.hybrid,
    venue: 'StudySphere Banani Lounge, Road 11, Dhaka & Zoom Live',
    registrationUrl: 'https://study-consultency.vercel.app/apply',
    isPublished: true,
    seoTitle: 'Australia Student Visa & GS Briefing | StudySphere',
    seoDescription:
      'Understand Australia Subclass 500 visa rules, GS questions, and financial documentation.',
  },
  {
    title: 'Germany & Europe Tuition-Free Pathway Seminar',
    slug: 'germany-europe-tuition-free-pathway-seminar',
    shortDescription:
      'Step-by-step roadmap to public universities in Germany and Europe: uni-assist, APS/Embassy scheduling, blocked account setup, and English-taught Master’s degrees.',
    fullDescription:
      'Discover how Bangladeshi students can access world-class engineering, computer science, and business programs in Germany and Europe with zero or minimal tuition fees.\n\nTopics Included:\n• Shortlisting English-taught public universities via DAAD\n• uni-assist VPD & direct university applications\n• Blocked account (Sperrkonto) & German student visa preparation\n• Part-time work rules and 18-month Job Seeker Visa after graduation',
    eventBanner: {
      publicId: 'studysphere/events/germany-europe-seminar',
      secureUrl:
        'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1400&q=80',
    },
    eventDate: new Date('2027-01-09T11:00:00+06:00'),
    startTime: '11:00 AM',
    endTime: '01:30 PM',
    timeZone: 'Asia/Dhaka',
    locationType: EventLocationType.in_person,
    venue: 'StudySphere Dhanmondi Center, Satmasjid Road, Dhaka',
    registrationUrl: 'https://study-consultency.vercel.app/apply',
    isPublished: true,
    seoTitle: 'Germany & Europe Tuition-Free Seminar | StudySphere',
    seoDescription:
      'Explore English-taught tuition-free public universities in Germany and Europe.',
  },
  {
    title: 'USA STEM & Graduate Assistantship Info Session',
    slug: 'usa-stem-graduate-assistantship-info-session',
    shortDescription:
      'Learn how to target funded US Master’s & PhD programs, waive GRE where possible, and prepare for your F-1 visa interview.',
    fullDescription:
      'Our US admissions team walks you through university shortlisting across Tier-1 and Tier-2 research institutions, securing Teaching/Research Assistantships (TA/RA), and acing the US Embassy F-1 visa interview in Dhaka.',
    eventBanner: {
      publicId: 'studysphere/events/usa-stem-session',
      secureUrl:
        'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1400&q=80',
    },
    eventDate: new Date('2026-10-18T16:00:00+06:00'),
    startTime: '04:00 PM',
    endTime: '06:00 PM',
    timeZone: 'Asia/Dhaka',
    locationType: EventLocationType.online,
    venue: 'StudySphere Virtual Auditorium (Zoom)',
    registrationUrl: 'https://study-consultency.vercel.app/apply',
    isPublished: true,
    seoTitle: 'USA STEM & Assistantship Session | StudySphere',
    seoDescription:
      'Guide to US graduate funding, assistantships, and F-1 student visa interviews.',
  },
];

const BLOGS = [
  {
    title: 'Complete Guide to UK Student Visa & CAS Process for Bangladeshi Students',
    slug: 'complete-guide-uk-student-visa-cas-bangladesh',
    excerpt:
      'Everything you need to know about receiving your Confirmation of Acceptance for Studies (CAS), 28-day bank maintenance rules, TB testing in Dhaka, and credibility interviews.',
    content: `## 1. Receiving Your Unconditional Offer & CAS
Once you meet all academic and English language conditions (such as IELTS 6.0–6.5 or an accepted MOI/waiver) and pay your initial tuition deposit, your UK university will issue a **Confirmation of Acceptance for Studies (CAS)** reference number.

## 2. The 28-Day Financial Maintenance Rule
Under UKVI Student Route guidelines, you must show sufficient funds to cover:
- **Remaining first-year tuition fees** (after subtracting your paid deposit)
- **Living costs** (9 months × £1,334/month for London or £1,023/month outside London)

These funds must remain untouched in an approved bank account (in your name or your parents' name with a birth certificate + consent letter) for at least **28 consecutive days**, and the bank statement must be dated within 31 days of your visa application.

## 3. TB Test, IHS Surcharge & Biometrics
- Book your **IOM TB Screening** in Dhaka or Sylhet early—certificates are valid for 6 months.
- Pay the **Immigration Health Surcharge (IHS)** online during the UKVI form submission.
- Attend your **VFS Global biometrics appointment** in Dhaka, Chattogram, or Sylhet with your passport and checklist.

## 4. Preparing for the Credibility Interview
UKVI may invite selected applicants for a short credibility interview. Be ready to explain why you chose the UK, why that specific university and modules, how your course connects to your career goals in Bangladesh, and your financial sponsor's income.`,
    featuredImage: {
      publicId: 'studysphere/blogs/uk-student-visa-cas-guide',
      secureUrl:
        'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1400&q=80',
    },
    category: 'Visa & Compliance',
    author: 'StudySphere Editorial Desk',
    isPublished: true,
    publishedAt: new Date('2026-11-20T09:00:00Z'),
    seoTitle: 'UK Student Visa & CAS Guide for Bangladesh | StudySphere',
    seoDescription:
      'Step-by-step UK Student Visa, CAS, 28-day bank rule, and credibility interview guide for Bangladeshi students.',
  },
  {
    title: "How to Write a High-Impact SOP for Master's Abroad",
    slug: 'how-to-write-high-impact-sop-masters-abroad',
    excerpt:
      'A practical 4-part blueprint to craft an authentic Statement of Purpose that connects your academic journey, projects, and career vision to your target university.',
    content: `## Why Your SOP Matters More Than Ever
Admissions tutors read hundreds of applications with similar GPAs and IELTS scores. Your **Statement of Purpose (SOP)** is the single document that turns numbers into a compelling human narrative.

## The 4-Part StudySphere SOP Framework
1. **The Academic Hook (15%):** Open with a specific academic curiosity, research problem, or industry challenge that sparked your interest—avoid generic childhood quotes.
2. **Academic & Practical Foundation (35%):** Highlight relevant coursework, thesis projects, internships, or work experience with measurable outcomes.
3. **Why This University & Program (30%):** Name 2–3 specific modules, research labs, or faculty members and explain how they bridge your current skills to your target expertise.
4. **Post-Graduation Career Roadmap (20%):** Outline clear short-term (1–3 years) and long-term goals, showing realistic industry demand.

## 3 Mistakes to Avoid
- Copying templates or AI-sounding buzzwords without concrete examples.
- Ignoring study gaps or low grades instead of briefly and honestly explaining them.
- Sending the exact same SOP to 5 universities without customizing the program section.`,
    featuredImage: {
      publicId: 'studysphere/blogs/high-impact-sop-guide',
      secureUrl:
        'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=80',
    },
    category: 'Application Strategy',
    author: 'Nadia Rahman, Senior Essay Mentor',
    isPublished: true,
    publishedAt: new Date('2026-11-15T10:00:00Z'),
    seoTitle: "How to Write a High-Impact SOP for Master's | StudySphere",
    seoDescription:
      'Learn the 4-part SOP framework to stand out in Master’s applications across the UK, Canada, USA, Australia, and Europe.',
  },
  {
    title: 'Top Scholarships for International Students in 2026–27',
    slug: 'top-scholarships-international-students-2026-27',
    excerpt:
      'Explore fully funded and partial merit scholarships across the UK, Australia, Canada, USA, and Germany—plus application timelines you should not miss.',
    content: `## 1. Government & Fully Funded Awards
- **Chevening Scholarships (UK):** Covers full tuition, monthly stipend, and airfare for 1-year Master's degrees (requires 2 years of work experience).
- **DAAD EPOS & Helmut-Schmidt (Germany):** Full funding for development-related and public policy Master's programs.
- **Australia Awards & Destination Australia:** Generous government support for regional and postgraduate study.
- **Fulbright Foreign Student Program (USA):** Comprehensive funding for Master's and PhD candidates.

## 2. University Automatic & Merit Bursaries
Many partner universities in the UK, Canada, and Australia automatically award **£3,000–£8,000** or **AUD 10,000–25% tuition reductions** based on your CGPA and early application submission.

## 3. How to Maximize Your Chances
Apply **6–8 months before intake**, polish your leadership & community impact examples, and request strong, specific Letters of Recommendation (LORs) from professors or managers who know your work closely.`,
    featuredImage: {
      publicId: 'studysphere/blogs/top-scholarships-2026-27',
      secureUrl:
        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1400&q=80',
    },
    category: 'Scholarships & Funding',
    author: 'StudySphere Editorial Desk',
    isPublished: true,
    publishedAt: new Date('2026-11-10T08:30:00Z'),
    seoTitle: 'Top Scholarships for International Students 2026–27 | StudySphere',
    seoDescription:
      'Discover fully funded and merit scholarships in the UK, Germany, Australia, USA, and Canada.',
  },
  {
    title: 'Canada vs. Australia: Tuition, PR Pathways & Post-Study Work',
    slug: 'canada-vs-australia-tuition-pr-post-study-work',
    excerpt:
      'A side-by-side comparison of tuition costs, part-time work allowances, post-study work permits, and long-term residency pathways for Bangladeshi graduates.',
    content: `## Tuition & Living Costs
- **Canada:** Public university tuition typically ranges from CAD 18,000 to CAD 38,000/year depending on province and program. Living expenses require CAD 20,635/year proof under IRCC guidelines.
- **Australia:** Tuition ranges from AUD 28,000 to AUD 46,000/year, with regional campuses offering lower fees and extra post-study benefits.

## Post-Study Work Rights
- **Canada (PGWP):** Graduates from eligible Designated Learning Institutions (DLIs) can qualify for up to **3 years** of Post-Graduation Work Permit depending on program length and field.
- **Australia (Subclass 485):** Temporary Graduate Visa offers **2–3 years** in major cities and an extra **1–2 years** for regional university graduates.

## Which One Fits Your Profile?
Choose **Canada** if you value co-op degrees and Express Entry / PNP pathways; choose **Australia** if you want flexible intake options (Feb/July/Nov), strong STEM/healthcare demand, and higher minimum part-time wages.`,
    featuredImage: {
      publicId: 'studysphere/blogs/canada-vs-australia-comparison',
      secureUrl:
        'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1400&q=80',
    },
    category: 'Country Comparison',
    author: 'Tariqul Hasan, Principal Counselor',
    isPublished: true,
    publishedAt: new Date('2026-11-05T11:15:00Z'),
    seoTitle: 'Canada vs Australia for Bangladeshi Students | StudySphere',
    seoDescription:
      'Compare Canada and Australia tuition fees, post-study work permits, and PR pathways.',
  },
  {
    title: 'IELTS vs. PTE Academic vs. Duolingo: Which Test Should You Take?',
    slug: 'ielts-vs-pte-vs-duolingo-which-test-to-take',
    excerpt:
      'Compare acceptance rates, scoring speed, difficulty patterns, and university/visa preferences across IELTS Academic, PTE, and Duolingo English Test.',
    content: `## 1. IELTS Academic (Gold Standard)
Accepted by **100% of universities and immigration authorities** in the UK, Canada, Australia, USA, and Europe. Ideal if you prefer face-to-face speaking or paper/computer-delivered familiarity.

## 2. PTE Academic (Fastest Results)
Computer-graded test with results typically out in **48 hours**. Widely accepted for Australian Subclass 500 visas, UKVI (PTE Academic UKVI), and Canadian SDS/non-SDS applications.

## 3. Duolingo English Test (DET)
Convenient, affordable, and taken from home—accepted by hundreds of **US, Canadian, and European universities** for admission, though check country-specific visa rules before relying solely on DET.`,
    featuredImage: {
      publicId: 'studysphere/blogs/ielts-pte-duolingo-comparison',
      secureUrl:
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1400&q=80',
    },
    category: 'Test Preparation',
    author: 'StudySphere Editorial Desk',
    isPublished: true,
    publishedAt: new Date('2026-10-28T12:00:00Z'),
    seoTitle: 'IELTS vs PTE vs Duolingo Guide | StudySphere',
    seoDescription:
      'Compare IELTS, PTE Academic, and Duolingo acceptance for top study destinations.',
  },
];

async function main() {
  for (const event of EVENTS) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: event,
      create: event,
    });
  }

  for (const blog of BLOGS) {
    await prisma.blog.upsert({
      where: { slug: blog.slug },
      update: blog,
      create: blog,
    });
  }

  const [eventCount, blogCount] = await Promise.all([
    prisma.event.count({ where: { isPublished: true } }),
    prisma.blog.count({ where: { isPublished: true } }),
  ]);

  console.log(
    JSON.stringify(
      {
        seededEvents: EVENTS.length,
        seededBlogs: BLOGS.length,
        publishedEventsInDb: eventCount,
        publishedBlogsInDb: blogCount,
        eventSlugs: EVENTS.map((e) => e.slug),
        blogSlugs: BLOGS.map((b) => b.slug),
      },
      null,
      2,
    ),
  );
}

main()
  .catch((err) => {
    console.error('Failed to seed events and blogs:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
