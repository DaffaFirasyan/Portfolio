import type { SkillCategory } from '@/types';

export const skillCategories: SkillCategory[] = [
  {
    id: 'languages',
    name: 'Languages & Frameworks',
    skills: [
      { name: 'Python', icon: 'code', level: 'advanced', relatedProjectIds: ['animart'] },
      { name: 'PHP', icon: 'code', level: 'advanced', relatedProjectIds: ['village-portal'] },
      { name: 'Laravel', icon: 'layers', level: 'advanced', relatedProjectIds: ['village-portal'] },
      { name: 'Django', icon: 'server', level: 'intermediate' },
      { name: '.NET Core 8', icon: 'server', level: 'intermediate' },
      { name: 'Flask', icon: 'server', level: 'intermediate' },
      { name: 'Vue.js', icon: 'component', level: 'intermediate' },
      { name: 'React', icon: 'component', level: 'intermediate' },
      { name: 'TypeScript', icon: 'code', level: 'intermediate' },
      { name: 'C#', icon: 'code', level: 'intermediate' },
    ],
  },
  {
    id: 'ai',
    name: 'AI & Retrieval',
    skills: [
      { name: 'RAG', icon: 'search', level: 'advanced' },
      { name: 'KG-RAG', icon: 'share-2', level: 'advanced' },
      { name: 'Knowledge Graphs', icon: 'share-2', level: 'advanced' },
      { name: 'LLM Applications', icon: 'brain', level: 'advanced' },
      { name: 'NLP', icon: 'brain', level: 'intermediate' },
      { name: 'Vector Embeddings', icon: 'chart', level: 'intermediate' },
      {
        name: 'Sentence Transformers',
        icon: 'brain',
        level: 'intermediate',
      },
    ],
  },
  {
    id: 'data-infra',
    name: 'Data & Platform',
    skills: [
      { name: 'MySQL', icon: 'database', level: 'advanced', relatedProjectIds: ['village-portal'] },
      { name: 'PostgreSQL', icon: 'database', level: 'intermediate' },
      { name: 'SQL Server', icon: 'database', level: 'intermediate' },
      { name: 'Docker', icon: 'box', level: 'intermediate' },
      { name: 'Git & GitHub', icon: 'git-branch', level: 'advanced' },
      { name: 'Vercel', icon: 'triangle', level: 'intermediate' },
      { name: 'Hostinger', icon: 'triangle', level: 'intermediate', relatedProjectIds: ['village-portal'] },
      { name: 'Swagger UI', icon: 'wrench', level: 'intermediate' },
    ],
  },
  {
    id: 'domain',
    name: 'Design & Domain',
    skills: [
      { name: 'Figma', icon: 'pen', level: 'intermediate' },
      { name: 'Visual Paradigm', icon: 'pen', level: 'intermediate' },
      { name: 'Bizagi', icon: 'pen', level: 'intermediate' },
      { name: 'SAP ERP', icon: 'wrench', level: 'basic' },
      { name: 'Cisco Packet Tracer', icon: 'wrench', level: 'basic' },
      { name: 'Research Methods', icon: 'flask', level: 'intermediate' },
    ],
  },
];
