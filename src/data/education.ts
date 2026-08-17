import type { Education } from '@/types';

export const education: Education[] = [
  {
    id: 'bachelor-is',
    institution: 'Telkom University',
    degree: 'Bachelor of Information Systems',
    field: 'Information Systems',
    startYear: 2022,
    endYear: 'present',
    gpa: '3.62 / 4.00',
    highlights: [
      'Thesis: an LLM-based decision support system for industrial plantation asset maintenance using KG-RAG.',
      'Teaching assistant for Database Systems across two cohorts, covering roughly ninety students in total.',
      'Head of Technology Division in the student association, leading a team of six for one full term.',
    ],
    logoUrl: '/education/telkom-university.webp',
  },
];
