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
      // These four now point at a project, which they could not before: this
      // category had no `relatedProjectIds` at all while the only AI work on
      // the page was the unwritten Dukunify slot, so hovering any of them dimmed
      // the whole Projects section and highlighted nothing. AssetMind's own
      // description names all four, so the links are read off it rather than
      // assumed. The rest of this category stays unlinked — NLP, embeddings and
      // Sentence Transformers are evidenced for the Pertamina work, which is an
      // experience entry, not a project.
      { name: 'RAG', icon: 'search', level: 'advanced', relatedProjectIds: ['assetmind'] },
      { name: 'KG-RAG', icon: 'share-2', level: 'advanced', relatedProjectIds: ['assetmind'] },
      {
        name: 'Knowledge Graphs',
        icon: 'share-2',
        level: 'advanced',
        relatedProjectIds: ['assetmind'],
      },
      {
        name: 'LLM Applications',
        icon: 'brain',
        level: 'advanced',
        relatedProjectIds: ['assetmind'],
      },
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
