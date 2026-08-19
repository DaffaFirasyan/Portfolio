import type { Education } from '@/types';

export const education: Education[] = [
  {
    id: 'bachelor-is',
    institution: 'Telkom University',
    degree: 'Bachelor of Information Systems',
    field: 'Information Systems',
    startYear: 2022,
    endYear: 2026,
    gpa: '3.64 / 4.00',
    highlights: [
      'Final project: an LLM decision support system using RAG and KG-RAG, scoring 4.73/5 with 92.9% procedure match and 39/39 functional tests passed.',
      'Presented "A Controlled Comparative Study of RAG and KG-RAG" at ICADEIS 2026, published in the IEEE Xplore Digital Library.',
    ],
    logoUrl: '/education/telkom-university.webp',
  },
];
