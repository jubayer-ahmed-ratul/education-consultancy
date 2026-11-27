import 'dotenv/config';
import path from 'node:path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const STORIES = [
  {
    name: 'Tanvir Ahmed',
    slug: 'tanvir-ahmed-uk',
    title: 'MSc Data Science Offer & UK Visa Approved',
    country: 'United Kingdom',
    countryFlag: '🇬🇧',
    university: 'University of Manchester',
    program: 'MSc Data Science',
    achievement: 'Visa Approved',
    admissionYear: '2026',
    studentImage: '/story-1.jpg',
    testimonial:
      'StudySphere streamlined my university shortlisting, SOP review, and UK visa filing without a single hiccup.',
    displayOrder: 1,
  },
  {
    name: 'Nusrat Jahan',
    slug: 'nusrat-jahan-canada',
    title: 'BSc Computer Engineering & Co-op Admission',
    country: 'Canada',
    countryFlag: '🇨🇦',
    university: 'University of Toronto',
    program: 'BSc Computer Engineering',
    achievement: 'Visa Approved',
    admissionYear: '2026',
    studentImage: '/story-2.jpg',
    testimonial:
      'From scholarship essay editing to my Canadian study permit biometrics, every step was transparent and well organized.',
    displayOrder: 2,
  },
  {
    name: 'Rafiul Islam',
    slug: 'rafiul-islam-australia',
    title: 'Master of Business Analytics with Merit Award',
    country: 'Australia',
    countryFlag: '🇦🇺',
    university: 'Monash University',
    program: 'Master of Business Analytics',
    achievement: 'AUD 10,000 Scholarship',
    admissionYear: '2026',
    studentImage: '/story-3.jpg',
    testimonial:
      'My advisor helped me secure an AUD 10,000 merit scholarship and guided my GTE financial documentation cleanly.',
    displayOrder: 3,
  },
  {
    name: 'Sadia Afrin',
    slug: 'sadia-afrin-germany',
    title: 'MSc Informatics Admission in Munich',
    country: 'Germany',
    countryFlag: '🇩🇪',
    university: 'Technical University of Munich',
    program: 'MSc Informatics',
    achievement: 'Visa Approved',
    admissionYear: '2026',
    studentImage: '/story-4.jpg',
    testimonial:
      'StudySphere helped me navigate APS verification, blocked account setup, and German embassy interview prep effortlessly.',
    displayOrder: 4,
  },
  {
    name: 'Mahfuzur Rahman',
    slug: 'mahfuzur-rahman-usa',
    title: 'MS Software Engineering with NAMU Scholarship',
    country: 'United States',
    countryFlag: '🇺🇸',
    university: 'Arizona State University',
    program: 'MS Software Engineering',
    achievement: 'F-1 Visa Approved',
    admissionYear: '2026',
    studentImage: '/about-primary.jpg',
    testimonial:
      'The mock F-1 visa interviews gave me total confidence at the US Embassy in Dhaka—approved in under two minutes!',
    displayOrder: 5,
  },
  {
    name: 'Farhana Yasmin',
    slug: 'farhana-yasmin-malaysia',
    title: 'Dual-Award Computer Science Placement',
    country: 'Malaysia',
    countryFlag: '🇲🇾',
    university: "Taylor's University",
    program: 'Bachelor of Computer Science',
    achievement: '50% Tuition Waiver',
    admissionYear: '2026',
    studentImage: '/about-campus.jpg',
    testimonial:
      'Quick EMGS approval, 50% merit waiver, and pre-departure accommodation support made my transition smooth.',
    displayOrder: 6,
  },
];

async function main() {
  for (const s of STORIES) {
    await prisma.successStory.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        title: s.title,
        country: s.country,
        countryFlag: s.countryFlag,
        university: s.university,
        program: s.program,
        achievement: s.achievement,
        admissionYear: s.admissionYear,
        studentImage: s.studentImage,
        testimonial: s.testimonial,
        displayOrder: s.displayOrder,
        isPublished: true,
      },
      create: {
        ...s,
        isPublished: true,
      },
    });
  }
  console.log(`Seeded/updated ${STORIES.length} published success stories.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
