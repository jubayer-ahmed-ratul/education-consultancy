import { PrismaClient } from '@prisma/client';

export async function seedData(prisma: PrismaClient): Promise<void> {
  // 1. Sample Destinations (Countries)
  const countriesData = [
    {
      name: 'United Kingdom',
      slug: 'united-kingdom',
      description:
        'Home to Russell Group research universities, accelerated 1-year Masterâ€™s degrees, and the Graduate Route post-study work visa.',
      highlights: ['1-Year Masterâ€™s Programs', '2-Year Post-Study Work Visa', 'Chevening & GREAT Scholarships'],
      intakes: ['September 2026', 'January 2027'],
      educationSystem: 'UK higher education offers 3-year undergraduate and 1-year intensive postgraduate degrees.',
      admissionRequirements: 'Academic transcripts, personal statement, 2 references, and IELTS 6.0â€“7.0.',
      tuitionAndLivingCosts: 'Tuition ranges from Â£14,000 to Â£28,000/year; living costs Â£1,023â€“Â£1,334/month.',
      visaRequirements: 'CAS letter, proof of funds held for 28 days, TB test (if applicable), and IHS fee.',
      scholarshipInfo: 'Up to Â£5,000 institutional bursaries plus Chevening and Commonwealth awards.',
      isPublished: true,
      order: 1,
    },
    {
      name: 'Canada',
      slug: 'canada',
      description:
        'World-class public universities and co-op colleges with clear Post-Graduation Work Permit (PGWP) pathways.',
      highlights: ['Co-op Work Terms', 'PGWP Up to 3 Years', 'Affordable Public Tuition'],
      intakes: ['Fall 2026', 'Winter 2027', 'Summer 2027'],
      educationSystem: '4-year Bachelorâ€™s degrees, 1â€“2 year Masterâ€™s programs, and career-focused PG Diplomas.',
      admissionRequirements: 'Official transcripts, statement of purpose, and IELTS 6.5 (no band below 6.0).',
      tuitionAndLivingCosts: 'Tuition CAD 18,000â€“35,000/year; GIC / living funds CAD 20,635/year.',
      visaRequirements: 'Letter of Acceptance, Provincial Attestation Letter (PAL), GIC, and medical exam.',
      scholarshipInfo: 'Entrance scholarships and graduate teaching/research assistantships.',
      isPublished: true,
      order: 2,
    },
    {
      name: 'Australia',
      slug: 'australia',
      description:
        'Group of Eight universities, high quality of life, and generous post-study work rights across major cities.',
      highlights: ['Group of Eight Universities', 'Post-Study Work Stream', 'Merit Tuition Waivers'],
      intakes: ['February 2027', 'July 2027'],
      educationSystem: '3â€“4 year Bachelorâ€™s and 1.5â€“2 year Masterâ€™s degrees with industry placements.',
      admissionRequirements: 'Certified academic records, GTE/GS statement, and IELTS 6.5 overall.',
      tuitionAndLivingCosts: 'Tuition AUD 28,000â€“48,000/year; living costs ~AUD 29,710/year.',
      visaRequirements: 'Confirmation of Enrolment (CoE), OSHC health cover, and Genuine Student assessment.',
      scholarshipInfo: 'Australia Awards and 15%â€“30% university merit scholarships.',
      isPublished: true,
      order: 3,
    },
  ];

  const countryMap = new Map<string, string>();
  for (const c of countriesData) {
    const record = await prisma.country.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    countryMap.set(c.slug, record.id);
  }

  // 2. Sample Universities
  const ukId = countryMap.get('united-kingdom')!;
  const caId = countryMap.get('canada')!;
  const auId = countryMap.get('australia')!;

  const universitiesData = [
    {
      name: 'University of Hertfordshire',
      slug: 'university-of-hertfordshire',
      countryId: ukId,
      city: 'Hatfield',
      description: 'Career-focused UK university just 25 minutes from central London, renowned for Computer Science and Business.',
      programs: ['MSc Data Science', 'MSc Computer Science', 'BSc (Hons) Software Engineering', 'MBA'],
      englishRequirements: 'IELTS 6.0 (5.5 in each band) for UG; IELTS 6.5 (5.5 in each band) for PG.',
      tuitionRange: { min: 15500, max: 18500, currency: 'GBP' },
      isPublished: true,
    },
    {
      name: 'University of Toronto',
      slug: 'university-of-toronto',
      countryId: caId,
      city: 'Toronto',
      description: 'Canadaâ€™s top-ranked research university offering global leadership in AI, engineering, and life sciences.',
      programs: ['BSc Computer Science', 'MSc Applied Computing', 'BCom Finance'],
      englishRequirements: 'IELTS 6.5 overall with no band below 6.0.',
      tuitionRange: { min: 32000, max: 48000, currency: 'CAD' },
      isPublished: true,
    },
    {
      name: 'Monash University',
      slug: 'monash-university',
      countryId: auId,
      city: 'Melbourne',
      description: 'A member of Australiaâ€™s prestigious Group of Eight with strong industry-connected STEM and business degrees.',
      programs: ['Master of Data Science', 'Bachelor of Engineering (Hons)', 'Master of Business'],
      englishRequirements: 'IELTS 6.5 overall (minimum 6.0 in each band).',
      tuitionRange: { min: 34000, max: 46000, currency: 'AUD' },
      isPublished: true,
    },
  ];

  for (const u of universitiesData) {
    await prisma.university.upsert({
      where: { slug: u.slug },
      update: {},
      create: u,
    });
  }

  // 3. CMS Singletons
  await prisma.heroContent.upsert({
    where: { singletonKey: 'hero-content' },
    update: {},
    create: {
      singletonKey: 'hero-content',
      heading: 'Precision Guidance for Global Higher Education',
      subheading: 'StudySphere Overseas Consultancy',
      description:
        'From university shortlisting and scholarship strategy to visa filing, we guide ambitious students into leading institutions worldwide.',
      slides: [],
    },
  });

  const stats = [
    { order: 1, label: 'Visa Approval Rate', value: '98.5', suffix: '%' },
    { order: 2, label: 'Partner Universities', value: '600', suffix: '+' },
    { order: 3, label: 'Years of Advisory', value: '10', suffix: '+' },
    { order: 4, label: 'Students Placed', value: '15,000', suffix: '+' },
  ];
  for (const s of stats) {
    await prisma.heroStat.upsert({
      where: { order: s.order },
      update: {},
      create: s,
    });
  }

  await prisma.siteContent.upsert({
    where: { key: 'homepage-about' },
    update: {},
    create: {
      key: 'homepage-about',
      heading: 'About StudySphere',
      highlightTitle: 'Transparent Admissions. Zero Guesswork.',
      bodyParagraphs: [
        'StudySphere is a student-first international education consultancy built around structured academic evaluation, verified institutional partnerships, and end-to-end visa compliance.',
      ],
      buttonText: 'Explore Our Story',
      buttonLink: '/about',
      yearsBadgeText: '10+ Years Experience',
    },
  });

  await prisma.aboutPage.upsert({
    where: { key: 'about-page' },
    update: {},
    create: {
      key: 'about-page',
      whoWeAreTitle: 'Who We Are',
      whoWeAreBody: 'StudySphere connects talented students with accredited universities across the UK, Canada, Australia, and Europe.',
      establishmentYear: '2015',
      establishmentStory: 'Founded by academic advisors committed to transparent, merit-driven international admissions.',
      companyOverview: 'Our certified counselors manage everything from profile assessment to pre-departure orientation.',
      chairmanName: 'Board of Advisors',
      chairmanTitle: 'Executive Leadership',
      chairmanMessage: 'Every student deserves honest, structured guidance toward a global degree.',
    },
  });

  await prisma.contactPage.upsert({
    where: { key: 'contact-page' },
    update: {},
    create: {
      key: 'contact-page',
      headerTitle: 'Contact StudySphere',
      headerSubtitle: 'Connect with our admissions desk for a personalized study-abroad assessment.',
      address: 'Level 8, Academic Plaza, Dhaka 1212',
      phones: ['+880 1700-000000'],
      whatsappNumber: '+8801700000000',
      emails: ['admissions@zerocompile.example'],
      officeHours: 'Sunâ€“Thu: 10:00 AM â€“ 6:00 PM',
      mapLatitude: 23.8103,
      mapLongitude: 90.4125,
      mapZoom: 14,
      mapAddress: 'Academic Plaza, Dhaka',
    },
  });

  await prisma.footerSetting.upsert({
    where: { key: 'footer-setting' },
    update: {},
    create: {
      key: 'footer-setting',
      socialLinks: {},
      featuredCountrySlugs: ['united-kingdom', 'canada', 'australia'],
    },
  });

  await prisma.whatsAppSetting.upsert({
    where: { key: 'whatsapp-contact' },
    update: {},
    create: {
      key: 'whatsapp-contact',
      phoneNumber: '+8801700000000',
      defaultMessage: 'Hello StudySphere, I would like to inquire about studying abroad.',
      isEnabled: true,
    },
  });

  await prisma.successStoriesPageSetting.upsert({
    where: { key: 'success-stories-page' },
    update: {},
    create: {
      key: 'success-stories-page',
      heroHeading: 'Student Success Stories',
      heroSubtitle: 'Meet the scholars and graduates who launched their international careers with StudySphere.',
    },
  });

  await prisma.gallerySetting.upsert({
    where: { key: 'homepage-gallery' },
    update: {},
    create: {
      key: 'homepage-gallery',
      heading: 'Campus & Event Highlights',
      description: 'Moments from our university fairs, visa briefings, and pre-departure sessions.',
      ctaText: 'View Full Gallery',
    },
  });

  // 4. Sample Blog, Event, Success Story
  await prisma.blog.upsert({
    where: { slug: 'uk-graduate-route-visa-guide-2026' },
    update: {},
    create: {
      title: 'UK Graduate Route & Post-Study Work Guide 2026',
      slug: 'uk-graduate-route-visa-guide-2026',
      excerpt: 'Everything international students need to know about transitioning from a UK Student Visa to the Graduate Route.',
      content:
        'International graduates who complete an eligible UK Bachelorâ€™s or Masterâ€™s degree can apply for the Graduate Route visa to work or look for work in the UK.',
      category: 'Visa Guide',
      author: 'StudySphere Editorial Desk',
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  await prisma.event.upsert({
    where: { slug: 'global-admissions-expo-fall-2026' },
    update: {},
    create: {
      title: 'Global Admissions & Scholarship Expo â€” Fall 2026',
      slug: 'global-admissions-expo-fall-2026',
      shortDescription: 'Meet university delegates from the UK, Canada, and Australia for on-spot profile assessments.',
      fullDescription:
        'Join StudySphere counselors and partner university representatives for one-on-one admissions counseling, scholarship eligibility checks, and SOP workshops.',
      eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      locationType: 'hybrid',
      venue: 'StudySphere Advisory Center & Zoom',
      isPublished: true,
    },
  });

  await prisma.successStory.upsert({
    where: { slug: 'tanvir-ahmed-hertfordshire-msc-data-science' },
    update: {},
    create: {
      name: 'Tanvir Ahmed',
      title: 'MSc Data Science Offer with Â£4,000 Scholarship',
      slug: 'tanvir-ahmed-hertfordshire-msc-data-science',
      country: 'United Kingdom',
      countryFlag: 'ðŸ‡¬ðŸ‡§',
      university: 'University of Hertfordshire',
      program: 'MSc Data Science',
      testimonial: 'StudySphere streamlined my university shortlisting, SOP review, and UK visa filing without a single hiccup.',
      achievement: 'Â£4,000 Merit Scholarship',
      admissionYear: '2026',
      displayOrder: 1,
      isPublished: true,
    },
  });

  console.log('[seed-data] Default countries, universities, and CMS records seeded idempotently.');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedData(prisma)
    .catch((err) => {
      console.error('[seed-data] Failed:', err);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
