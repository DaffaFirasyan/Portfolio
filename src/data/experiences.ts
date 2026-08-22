import type { Experience, ExperienceType } from '@/types';

/**
 * Shown beside the organisation so near-identical rows can be told apart at a
 * glance. The data always carried `type`; this is what renders it.
 *
 * The table stays exhaustive over `ExperienceType` even though only `work` and
 * `internship` are in use — it is a `Record`, so the compiler requires every
 * member, and that is what stops a type added to the union from rendering
 * `undefined` beside an organisation.
 */
export const EXPERIENCE_TYPE_LABEL: Record<ExperienceType, string> = {
  work: 'Work',
  internship: 'Internship',
  organization: 'Organisation',
  freelance: 'Freelance',
  volunteer: 'Volunteer',
  research: 'Research',
};

/**
 * Three engineering roles, newest first.
 *
 * Three student-organisation roles were removed on 2026-08-22 at the owner's
 * decision, and the reason is worth keeping: the section is headed "Where I
 * have worked", and media, recruitment and external-relations staff posts are
 * not that. They also captured the section's one signal for *now* — both were
 * the only `endDate: 'present'` entries, so the accent year and the pulse dot
 * were pointing at organisational admin rather than at engineering.
 *
 * Nothing is hidden by dropping them: the CV is on the page as a download and
 * carries the complete record. A portfolio is the curated subset; the CV is the
 * whole one.
 *
 * The consequence to accept is that no role is current — the timeline ends
 * September 2025 with no pulse dot anywhere. That is simply true of a fresh
 * graduate looking for work, and `profile.openToWork` is what says so.
 */
export const experiences: Experience[] = [
  {
    id: 'telkom-fullstack',
    role: 'Contract Full-Stack Developer',
    organization: 'Telkom University',
    type: 'work',
    location: 'Bandung',
    startDate: '2025-06',
    endDate: '2025-09',
    summary:
      'Built a Laravel platform pairing a village transparency portal with an e-commerce module for local MSMEs.',
    highlights: [
      'Engineered an admin panel for CRUD over news, galleries, organisational charts and dynamic landing page content.',
      'Built a product catalogue with search and category filters, finalising transactions through WhatsApp and Shopee.',
      'Added Excel import so staff could upload product data in bulk from a standard template rather than one at a time.',
      'Deployed to Hostinger with domain setup and database tuning for live production use.',
    ],
    stack: ['PHP', 'Laravel', 'MySQL', 'Hostinger'],
  },
  {
    id: 'pertamina-ai',
    role: 'AI Full-Stack Developer Intern',
    organization: 'Pertamina Hulu Indonesia',
    type: 'internship',
    location: 'Jakarta',
    startDate: '2025-07',
    endDate: '2025-08',
    summary:
      'Built an AI assistant centralising information fragmented across more than 350 internal company portals.',
    highlights: [
      'Designed a microservices system: .NET Core 8 for business logic and orchestration, Python and Flask for the NLP work.',
      'Implemented retrieval-augmented generation over official documents, so answers cite context instead of being invented.',
      'Used Sentence Transformers to chunk text and turn PDFs into vector embeddings for semantic search.',
      'Shipped a Vue.js admin dashboard and a portable chat widget embeddable without changing a host site.',
    ],
    stack: ['.NET Core 8', 'Python', 'Flask', 'Vue.js', 'TypeScript', 'SQL Server'],
  },
  {
    id: 'arranet-fullstack',
    role: 'Full-Stack Developer Intern',
    organization: 'Arranet',
    type: 'internship',
    location: 'Jakarta',
    startDate: '2024-11',
    endDate: '2025-04',
    summary:
      'Built a nationwide farm management platform reading live sensor data from IoT devices in the field.',
    highlights: [
      'Designed the Django back end handling user data, farm records and device integration.',
      'Programmed IoT modules tracking livestock activity in real time through sensor readings.',
      'Fed device data into a dashboard so one operator could monitor farms in several provinces at once.',
    ],
    stack: ['Python', 'Django', 'MQTT', 'REST API', 'Celery', 'Redis'],
  },
];
