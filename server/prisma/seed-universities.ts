import 'dotenv/config';
import path from 'node:path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const COUNTRIES = [
  {
    name: 'United Kingdom',
    slug: 'united-kingdom',
    description:
      'Home to Russell Group research universities, accelerated 1-year Master’s degrees, and the Graduate Route post-study work visa.',
    intakes: ['September 2026', 'January 2027'],
    order: 1,
  },
  {
    name: 'Canada',
    slug: 'canada',
    description:
      'World-class public universities and co-op colleges with clear Post-Graduation Work Permit (PGWP) pathways.',
    intakes: ['Fall 2026', 'Winter 2027', 'Summer 2027'],
    order: 2,
  },
  {
    name: 'Australia',
    slug: 'australia',
    description:
      'Group of Eight universities, high quality of life, and generous post-study work rights across major cities.',
    intakes: ['February 2027', 'July 2027'],
    order: 3,
  },
  {
    name: 'United States',
    slug: 'united-states',
    description:
      'Leading STEM, business, and research institutions offering flexible curricula and OPT work authorization.',
    intakes: ['Fall 2026', 'Spring 2027'],
    order: 4,
  },
  {
    name: 'Germany',
    slug: 'germany',
    description:
      'Tuition-free or low-tuition public technical universities with strong industry ties and post-study job seeker visas.',
    intakes: ['Winter 2026', 'Summer 2027'],
    order: 5,
  },
  {
    name: 'Malaysia',
    slug: 'malaysia',
    description:
      'Affordable international branch campuses and accredited private universities in a vibrant multicultural hub.',
    intakes: ['March 2026', 'September 2026'],
    order: 6,
  },
];

const UNIVERSITIES = [
  {
    name: 'University of Manchester',
    slug: 'university-of-manchester',
    countrySlug: 'united-kingdom',
    city: 'Manchester',
    logoUrl: 'https://www.google.com/s2/favicons?domain=manchester.ac.uk&sz=128',
    description:
      'A prestigious Russell Group research university renowned for engineering, computer science, and business programs.',
    programs: ['BSc Computer Science', 'MSc Data Science', 'MBA', 'MSc Mechanical Engineering'],
    englishRequirements: 'IELTS 6.5–7.0 overall (no band below 6.0)',
    scholarshipDetails: 'Global Futures Scholarship & Equity and Merit Scholarships available.',
    applicationDeadlines: 'September intake: January (UCAS) / June (Postgraduate)',
    website: 'https://www.manchester.ac.uk',
    tuitionRange: { min: 26000, max: 36000, currency: 'GBP' },
  },
  {
    name: 'University of Leeds',
    slug: 'university-of-leeds',
    countrySlug: 'united-kingdom',
    city: 'Leeds',
    logoUrl: 'https://www.google.com/s2/favicons?domain=leeds.ac.uk&sz=128',
    description:
      'Leading UK Russell Group institution offering globally recognized degrees in business, AI, and civil engineering.',
    programs: ['MSc Business Analytics', 'BEng Civil Engineering', 'MSc Advanced Computer Science'],
    englishRequirements: 'IELTS 6.5 overall (min 6.0 in each component)',
    scholarshipDetails: 'International Excellence Scholarships up to 50% tuition.',
    applicationDeadlines: 'Rolling admissions for postgraduate; UCAS January deadline for UG.',
    website: 'https://www.leeds.ac.uk',
    tuitionRange: { min: 24500, max: 32500, currency: 'GBP' },
  },
  {
    name: 'Coventry University',
    slug: 'coventry-university',
    countrySlug: 'united-kingdom',
    city: 'Coventry',
    logoUrl: 'https://www.google.com/s2/favicons?domain=coventry.ac.uk&sz=128',
    description:
      'Career-focused UK university known for industry placements, automotive engineering, and accessible tuition.',
    programs: ['BSc Computing', 'MSc Cyber Security', 'MSc International Business'],
    englishRequirements: 'IELTS 6.0–6.5 overall',
    scholarshipDetails: 'Vice-Chancellor Postgraduate & Undergraduate Merit Awards.',
    applicationDeadlines: 'September, January, and May intakes.',
    website: 'https://www.coventry.ac.uk',
    tuitionRange: { min: 16800, max: 20500, currency: 'GBP' },
  },
  {
    name: 'University of Toronto',
    slug: 'university-of-toronto',
    countrySlug: 'canada',
    city: 'Toronto',
    logoUrl: 'https://www.google.com/s2/favicons?domain=utoronto.ca&sz=128',
    description:
      'Canada’s top-ranked research university with world-leading faculties in AI, engineering, and management.',
    programs: ['BSc Computer Science', 'MEng Electrical Engineering', 'MSc Applied Computing'],
    englishRequirements: 'IELTS 6.5 (min 6.0) or TOEFL iBT 100',
    scholarshipDetails: 'Lester B. Pearson International Scholarship & Entrance Awards.',
    applicationDeadlines: 'Fall intake: November–January.',
    website: 'https://www.utoronto.ca',
    tuitionRange: { min: 45000, max: 62000, currency: 'CAD' },
  },
  {
    name: 'University of British Columbia',
    slug: 'university-of-british-columbia',
    countrySlug: 'canada',
    city: 'Vancouver',
    logoUrl: 'https://www.google.com/s2/favicons?domain=ubc.ca&sz=128',
    description:
      'Globally acclaimed Canadian university offering co-op degrees across Vancouver and Okanagan campuses.',
    programs: ['BSc Data Science', 'Master of Data Science', 'BCom Finance'],
    englishRequirements: 'IELTS 6.5 (no band under 6.0)',
    scholarshipDetails: 'International Major Entrance Scholarship (IMES).',
    applicationDeadlines: 'Fall intake: January 15.',
    website: 'https://www.ubc.ca',
    tuitionRange: { min: 42000, max: 56000, currency: 'CAD' },
  },
  {
    name: 'York University',
    slug: 'york-university',
    countrySlug: 'canada',
    city: 'Toronto',
    logoUrl: 'https://www.google.com/s2/favicons?domain=yorku.ca&sz=128',
    description:
      'Dynamic Toronto institution home to Schulich School of Business and Lassonde School of Engineering.',
    programs: ['BBA Schulich', 'BEng Software Engineering', 'Master of Supply Chain Management'],
    englishRequirements: 'IELTS 6.5–7.0 overall',
    scholarshipDetails: 'Global Leader of Tomorrow & International Entrance Scholarships.',
    applicationDeadlines: 'Fall, Winter, and Summer intakes.',
    website: 'https://www.yorku.ca',
    tuitionRange: { min: 32000, max: 44000, currency: 'CAD' },
  },
  {
    name: 'Monash University',
    slug: 'monash-university',
    countrySlug: 'australia',
    city: 'Melbourne',
    logoUrl: 'https://www.google.com/s2/favicons?domain=monash.edu&sz=128',
    description:
      'Australia’s largest Group of Eight university with top global rankings in pharmacy, IT, and business.',
    programs: ['Master of Data Science', 'Bachelor of IT', 'Master of Business'],
    englishRequirements: 'IELTS 6.5 (no band less than 6.0)',
    scholarshipDetails: 'Monash International Merit Scholarship (AUD 10,000/year).',
    applicationDeadlines: 'February & July intakes.',
    website: 'https://www.monash.edu',
    tuitionRange: { min: 38000, max: 50000, currency: 'AUD' },
  },
  {
    name: 'Deakin University',
    slug: 'deakin-university',
    countrySlug: 'australia',
    city: 'Melbourne',
    logoUrl: 'https://www.google.com/s2/favicons?domain=deakin.edu.au&sz=128',
    description:
      'Innovative Australian university recognized for cloud campus flexibility, cyber security, and health sciences.',
    programs: ['Bachelor of Cyber Security', 'Master of Information Technology', 'MBA'],
    englishRequirements: 'IELTS 6.5 (no band less than 6.0)',
    scholarshipDetails: 'Deakin Vice-Chancellor’s International Scholarship (up to 100%).',
    applicationDeadlines: 'Trimester 1 (Feb), Trimester 2 (Jul), Trimester 3 (Nov).',
    website: 'https://www.deakin.edu.au',
    tuitionRange: { min: 32000, max: 42000, currency: 'AUD' },
  },
  {
    name: 'RMIT University',
    slug: 'rmit-university',
    countrySlug: 'australia',
    city: 'Melbourne',
    logoUrl: 'https://www.google.com/s2/favicons?domain=rmit.edu.au&sz=128',
    description:
      'Global university of technology, design, and enterprise located in the heart of Melbourne.',
    programs: ['Bachelor of Design', 'Master of Analytics', 'BEng Aerospace Engineering'],
    englishRequirements: 'IELTS 6.5 (no band less than 6.0)',
    scholarshipDetails: 'Future Leaders & STEM Merit Scholarships.',
    applicationDeadlines: 'February & July intakes.',
    website: 'https://www.rmit.edu.au',
    tuitionRange: { min: 34000, max: 44000, currency: 'AUD' },
  },
  {
    name: 'Arizona State University',
    slug: 'arizona-state-university',
    countrySlug: 'united-states',
    city: 'Tempe, AZ',
    logoUrl: 'https://www.google.com/s2/favicons?domain=asu.edu&sz=128',
    description:
      'Top-ranked US public research university celebrated for innovation, engineering, and STEM OPT outcomes.',
    programs: ['BS Computer Science', 'MS Software Engineering', 'MS Business Analytics'],
    englishRequirements: 'IELTS 6.5 or TOEFL iBT 80',
    scholarshipDetails: 'New American University (NAMU) Merit Scholarships up to $15,500/year.',
    applicationDeadlines: 'Fall (May 1) & Spring (Nov 1).',
    website: 'https://www.asu.edu',
    tuitionRange: { min: 32000, max: 39000, currency: 'USD' },
  },
  {
    name: 'Northeastern University',
    slug: 'northeastern-university',
    countrySlug: 'united-states',
    city: 'Boston, MA',
    logoUrl: 'https://www.google.com/s2/favicons?domain=northeastern.edu&sz=128',
    description:
      'Premier experiential learning university famous for its global co-op network and STEM graduate programs.',
    programs: ['MS Computer Science', 'MS Data Analytics Engineering', 'MS Project Management'],
    englishRequirements: 'IELTS 7.0 or TOEFL iBT 95',
    scholarshipDetails: 'Double Husky & Graduate Merit Scholarships available.',
    applicationDeadlines: 'Fall & Spring intakes.',
    website: 'https://www.northeastern.edu',
    tuitionRange: { min: 38000, max: 54000, currency: 'USD' },
  },
  {
    name: 'Technical University of Munich',
    slug: 'technical-university-of-munich',
    countrySlug: 'germany',
    city: 'Munich',
    logoUrl: 'https://www.google.com/s2/favicons?domain=tum.de&sz=128',
    description:
      'Germany’s #1 technical university offering English-taught STEM Master’s degrees in Europe’s tech capital.',
    programs: ['MSc Informatics', 'MSc Data Engineering', 'MSc Management & Technology'],
    englishRequirements: 'IELTS 6.5 or TOEFL iBT 88',
    scholarshipDetails: 'DAAD & Deutschlandstipendium merit funding available.',
    applicationDeadlines: 'Winter intake: May 31; Summer intake: November 30.',
    website: 'https://www.tum.de',
    tuitionRange: { min: 0, max: 6000, currency: 'EUR' },
  },
  {
    name: 'RWTH Aachen University',
    slug: 'rwth-aachen-university',
    countrySlug: 'germany',
    city: 'Aachen',
    logoUrl: 'https://www.google.com/s2/favicons?domain=rwth-aachen.de&sz=128',
    description:
      'One of Europe’s leading engineering and technology universities with deep automotive and industrial R&D ties.',
    programs: ['MSc Automotive Engineering', 'MSc Computer Science', 'MSc Electrical Engineering'],
    englishRequirements: 'IELTS 6.0–6.5',
    scholarshipDetails: 'Tuition-free public university (only semester contribution ~€320).',
    applicationDeadlines: 'Winter intake: March 1; Summer intake: September 1.',
    website: 'https://www.rwth-aachen.de',
    tuitionRange: { min: 0, max: 1000, currency: 'EUR' },
  },
  {
    name: "Taylor's University",
    slug: 'taylors-university',
    countrySlug: 'malaysia',
    city: 'Subang Jaya',
    logoUrl: 'https://www.google.com/s2/favicons?domain=university.taylors.edu.my&sz=128',
    description:
      'Malaysia’s #1 private university offering UK/Australian dual-award degrees in business, hospitality, and IT.',
    programs: ['Bachelor of Computer Science', 'BBA International Business', 'Master of Architecture'],
    englishRequirements: 'IELTS 5.5–6.0',
    scholarshipDetails: "Taylor's Excellence & Merit Scholarships up to 50%.",
    applicationDeadlines: 'March, August, and October intakes.',
    website: 'https://university.taylors.edu.my',
    tuitionRange: { min: 7500, max: 11500, currency: 'USD' },
  },
];

async function main() {
  const countryMap = new Map<string, string>();

  for (const c of COUNTRIES) {
    const existing = await prisma.country.findUnique({ where: { slug: c.slug } });
    if (existing) {
      if (!existing.isPublished) {
        await prisma.country.update({ where: { id: existing.id }, data: { isPublished: true } });
      }
      countryMap.set(c.slug, existing.id);
    } else {
      const created = await prisma.country.create({
        data: {
          name: c.name,
          slug: c.slug,
          description: c.description,
          intakes: c.intakes,
          order: c.order,
          isPublished: true,
        },
      });
      countryMap.set(c.slug, created.id);
    }
  }

  let upserted = 0;
  for (const u of UNIVERSITIES) {
    const countryId = countryMap.get(u.countrySlug);
    if (!countryId) continue;

    await prisma.university.upsert({
      where: { slug: u.slug },
      update: {
        name: u.name,
        countryId,
        city: u.city,
        logoUrl: u.logoUrl,
        description: u.description,
        programs: u.programs,
        englishRequirements: u.englishRequirements,
        scholarshipDetails: u.scholarshipDetails,
        applicationDeadlines: u.applicationDeadlines,
        website: u.website,
        tuitionRange: u.tuitionRange,
        isPublished: true,
      },
      create: {
        name: u.name,
        slug: u.slug,
        countryId,
        city: u.city,
        logoUrl: u.logoUrl,
        description: u.description,
        programs: u.programs,
        englishRequirements: u.englishRequirements,
        scholarshipDetails: u.scholarshipDetails,
        applicationDeadlines: u.applicationDeadlines,
        website: u.website,
        tuitionRange: u.tuitionRange,
        isPublished: true,
      },
    });
    upserted += 1;
  }

  console.log(`Seeded/updated ${upserted} partner universities across ${countryMap.size} countries.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
