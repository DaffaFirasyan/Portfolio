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
    endDate: '2026-01',
    summary:
      'Built a monolithic Laravel platform pairing a village transparency portal with an e-commerce module for local MSMEs.',
    highlights: [
      'Engineered an admin panel for CRUD over news, multimedia galleries, organizational structures and dynamic content.',
      'Built a product catalogue with search, category filters and Excel bulk import for efficient product data management.',
      'Designed interactive statistical dashboards to monitor daily visitor traffic, most-viewed products and content metrics.',
      'Deployed and configured the application on Hostinger with domain setup, production configuration and database tuning.',
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
      'Built an AI Chatbot Assistant using microservices to centralise information fragmented across 350+ internal company portals.',
    highlights: [
      'Designed a microservices architecture: .NET Core 8 for business logic and orchestration, Python and Flask for NLP tasks.',
      'Implemented RAG and Sentence Transformers vector embeddings for semantic search over official company documents.',
      'Designed MS SQL Server relational schemas for portal metadata, knowledge base documents and chat session history.',
      'Built a standalone admin dashboard and reusable chatbot widget using Vue.js and TypeScript for internal portal integration.',
    ],
    stack: ['.NET Core 8', 'Python', 'Flask', 'Vue.js', 'TypeScript', 'SQL Server'],
  },
  {
    id: 'arranet-fullstack',
    role: 'Full-Stack Developer Intern',
    organization: 'PT Sinar Harsa Grasia',
    type: 'internship',
    location: 'Jakarta',
    startDate: '2024-11',
    endDate: '2025-04',
    summary:
      'Developed a web-based farm management application integrated with real-time IoT systems to monitor livestock across Indonesia.',
    highlights: [
      'Designed and built the Django backend to manage user data, farm records and real-time IoT device integrations.',
      'Developed responsive and user-friendly frontend features using HTML, CSS, and JavaScript for farm management operations.',
      'Integrated IoT sensor data into web dashboards to monitor livestock activity across multiple farm locations in real time.',
      'Implemented REST API, MQTT, Celery, and Redis for device communication, background data processing and task management.',
    ],
    stack: ['Python', 'Django', 'REST API', 'MQTT', 'Celery', 'Redis'],
  },
];
