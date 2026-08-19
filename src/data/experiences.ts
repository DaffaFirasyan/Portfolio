import type { Experience, ExperienceType } from '@/types';

/**
 * Shown beside the organisation so five near-identical rows can be told apart
 * at a glance. The data always carried `type`; this is what renders it.
 */
export const EXPERIENCE_TYPE_LABEL: Record<ExperienceType, string> = {
  work: 'Work',
  internship: 'Internship',
  organization: 'Organisation',
  freelance: 'Freelance',
  volunteer: 'Volunteer',
  research: 'Research',
};

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
  {
    id: 'eim-lab',
    role: 'Human Capital Development Staff',
    organization: 'Enterprise Infrastructure Mgmt Lab',
    type: 'organization',
    location: 'Telkom University',
    startDate: '2024-09',
    endDate: 'present',
    summary:
      'Support recruitment, development programmes and internal communication for the infrastructure lab.',
    highlights: [
      'Run the social channels that carry the lab’s work to students inside and outside the faculty.',
      'Support recruitment and member development, from intake through performance review.',
      'Use channel analytics to decide what the lab publishes rather than guessing at it.',
    ],
  },
  {
    id: 'permib-external',
    role: 'External Division Staff',
    organization: 'Perhimpunan Mahasiswa Bandung',
    type: 'organization',
    location: 'Telkom University',
    startDate: '2024-09',
    endDate: 'present',
    summary:
      'Hold the relationships with outside organisations, local businesses and community partners.',
    highlights: [
      'Coordinate collaborations and joint events with student associations and partners beyond the campus.',
      'Manage communication with external stakeholders on behalf of the organisation.',
    ],
  },
  {
    id: 'cci-media',
    role: 'Media Management Staff',
    organization: 'Central Computer Improvement',
    type: 'organization',
    location: 'Telkom University',
    startDate: '2023-12',
    endDate: '2024-12',
    summary:
      'Ran content across the organisation’s channels for a student body building campus digital tools.',
    highlights: [
      'Planned and produced multimedia content, using analytics to decide what to make next.',
      'Worked across teams to promote initiatives, events and the digital tools the organisation shipped.',
      'Led media strategy for UKM projects across content, social channels and public relations.',
    ],
  },
];
