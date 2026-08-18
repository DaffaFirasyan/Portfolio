import type { SkillCategory } from '@/types';

export const skillCategories: SkillCategory[] = [
  {
    id: 'languages',
    name: 'Languages & Frameworks',
    skills: [
      {
        name: 'Python',
        icon: 'code',
        level: 'advanced',
        relatedProjectIds: [
          'kg-maintenance-assistant',
          'sentiment-dashboard',
          'ocr-invoice-parser',
          'thesis-corpus-explorer',
        ],
      },
      {
        name: 'TypeScript',
        icon: 'code',
        level: 'intermediate',
        relatedProjectIds: ['campus-room-booking', 'kos-finder'],
      },
      { name: 'React', icon: 'component', level: 'intermediate', relatedProjectIds: ['kos-finder'] },
      {
        name: 'Next.js',
        icon: 'layers',
        level: 'intermediate',
        relatedProjectIds: ['campus-room-booking'],
      },
      {
        name: 'FastAPI',
        icon: 'server',
        level: 'intermediate',
        relatedProjectIds: ['kg-maintenance-assistant', 'ocr-invoice-parser'],
      },
      {
        name: 'SQL',
        icon: 'database',
        level: 'intermediate',
        relatedProjectIds: ['campus-room-booking'],
      },
    ],
  },
  {
    id: 'data-ai',
    name: 'Data & AI',
    skills: [
      {
        name: 'PyTorch',
        icon: 'brain',
        level: 'intermediate',
        relatedProjectIds: ['attendance-vision'],
      },
      {
        name: 'Transformers',
        icon: 'brain',
        level: 'intermediate',
        relatedProjectIds: ['sentiment-dashboard'],
      },
      {
        name: 'RAG',
        icon: 'search',
        level: 'advanced',
        relatedProjectIds: ['kg-maintenance-assistant', 'thesis-corpus-explorer'],
      },
      {
        name: 'Knowledge Graphs',
        icon: 'share-2',
        level: 'intermediate',
        relatedProjectIds: ['kg-maintenance-assistant'],
      },
      {
        name: 'scikit-learn',
        icon: 'chart',
        level: 'intermediate',
        relatedProjectIds: ['rainfall-forecast'],
      },
      {
        name: 'Computer Vision',
        icon: 'eye',
        level: 'basic',
        relatedProjectIds: ['attendance-vision', 'ocr-invoice-parser'],
      },
    ],
  },
  {
    id: 'tools',
    name: 'Tools & Platforms',
    skills: [
      {
        name: 'Neo4j',
        icon: 'database',
        level: 'intermediate',
        relatedProjectIds: ['kg-maintenance-assistant'],
      },
      {
        name: 'PostgreSQL',
        icon: 'database',
        level: 'intermediate',
        relatedProjectIds: ['campus-room-booking'],
      },
      {
        name: 'Docker',
        icon: 'box',
        level: 'intermediate',
        relatedProjectIds: ['kg-maintenance-assistant'],
      },
      { name: 'Git', icon: 'git-branch', level: 'advanced' },
      { name: 'Vercel', icon: 'triangle', level: 'intermediate' },
    ],
  },
  {
    id: 'domain',
    name: 'Domain',
    skills: [
      { name: 'Technical Writing', icon: 'pen', level: 'intermediate' },
      {
        name: 'Asset Management',
        icon: 'wrench',
        level: 'basic',
        relatedProjectIds: ['kg-maintenance-assistant'],
      },
      { name: 'Research Methods', icon: 'flask', level: 'intermediate' },
    ],
  },
];
