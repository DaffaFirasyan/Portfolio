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
      // The quoted title here used to be the CV's shortened one, which stopped
      // before "for Explainable Asset Maintenance Recommendations". The full
      // title plus this sentence runs past the 160-character highlight limit,
      // and a truncated title inside quotation marks is worse than none — so
      // the title is dropped rather than clipped. About carries it in full,
      // from Crossref, next to the DOI.
      'First-authored a paper on RAG and KG-RAG for explainable maintenance, presented at ICADEIS 2026 and published by IEEE.',
    ],
    logoUrl: '/education/telkom-university.webp',
  },
];
