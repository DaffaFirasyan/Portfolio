import type { Experience, ExperienceType } from '@/types';

export const experiences: Experience[] = [
  {
    id: 'thesis-research',
    role: 'Undergraduate Researcher, Maintenance Systems',
    organization: 'Information Systems Laboratory',
    type: 'research',
    location: 'Bandung, Indonesia',
    startDate: '2026-02',
    endDate: 'present',
    summary:
      'Designing and evaluating a graph-grounded assistant for industrial asset maintenance decisions.',
    highlights: [
      'Modelled 6 years of unstructured work orders into a Neo4j schema covering assets, faults, and interventions.',
      'Built the retrieval layer that walks the graph before prompting, which removed most fabricated part numbers.',
      'Ran a blind evaluation with 12 maintenance staff comparing graph-grounded answers against plain retrieval.',
      'Wrote the full methodology chapter and defended the design in two supervisory reviews.',
    ],
    stack: ['Python', 'Neo4j', 'FastAPI', 'Groq'],
  },
  {
    id: 'data-intern',
    role: 'Data Engineering Intern',
    organization: 'Nusantara Agritech Solutions',
    type: 'internship',
    location: 'Jakarta, Indonesia',
    startDate: '2025-06',
    endDate: '2025-08',
    summary:
      'Consolidated three regional reporting spreadsheets into one warehouse table used by weekly operations.',
    highlights: [
      'Replaced a manual weekly export with a scheduled pipeline, saving roughly 6 hours of analyst time per week.',
      'Added row-level validation that caught 400 malformed records in the first month of running.',
      'Documented the schema so two other interns could extend it without asking.',
    ],
    stack: ['Python', 'Airflow', 'PostgreSQL'],
  },
  {
    id: 'lab-assistant',
    role: 'Teaching Assistant, Database Systems',
    organization: 'Faculty of Industrial Engineering',
    type: 'work',
    location: 'Bandung, Indonesia',
    startDate: '2025-02',
    endDate: '2025-12',
    summary: 'Ran weekly lab sessions and graded coursework for two cohorts of database students.',
    highlights: [
      'Taught 3 lab sections covering normalisation, indexing, and query planning to about 90 students.',
      'Rewrote the indexing lab after noticing most submissions passed without understanding the plan output.',
      'Reduced grading turnaround from two weeks to four days with a scripted correctness check.',
    ],
    stack: ['PostgreSQL', 'SQL'],
  },
  {
    id: 'student-org-tech',
    role: 'Head of Technology Division',
    organization: 'Information Systems Student Association',
    type: 'organization',
    location: 'Bandung, Indonesia',
    startDate: '2024-09',
    endDate: '2025-08',
    summary: 'Led a team of six maintaining the association website and event registration tooling.',
    highlights: [
      'Shipped a registration system that handled 480 sign-ups across four events without manual spreadsheets.',
      'Introduced code review for the division, which cut post-deploy hotfixes noticeably over the year.',
    ],
    stack: ['TypeScript', 'Next.js', 'Supabase'],
  },
  {
    id: 'freelance-web',
    role: 'Freelance Web Developer',
    organization: 'Independent',
    type: 'freelance',
    location: 'Remote',
    startDate: '2024-01',
    endDate: '2024-08',
    summary: 'Built and handed over small business sites for three local clients.',
    highlights: [
      'Delivered three sites end to end, including hosting setup and a written handover guide for each owner.',
      'Kept every build under a 2 second load on 4G, which mattered because most visitors arrived on phones.',
    ],
    stack: ['React', 'Tailwind CSS'],
  },
];

/**
 * Display labels for the closed set of experience types.
 *
 * Here rather than in the section because copy lives in src/data/ — and
 * because adding a member to ExperienceType should fail the type check in one
 * obvious place rather than render an empty label on the page.
 */
export const EXPERIENCE_TYPE_LABEL: Record<ExperienceType, string> = {
  work: 'Work',
  internship: 'Internship',
  organization: 'Organisation',
  freelance: 'Freelance',
  volunteer: 'Volunteer',
  research: 'Research',
};
