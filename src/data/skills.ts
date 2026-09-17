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
        relatedProjectIds: ['animart', 'assetmind'],
      },
      { name: 'PHP', icon: 'code', level: 'advanced', relatedProjectIds: ['village-portal'] },
      { name: 'Laravel', icon: 'layers', level: 'advanced', relatedProjectIds: ['village-portal'] },
      { name: 'Django', icon: 'server', level: 'intermediate' },
      { name: '.NET Core 8', icon: 'server', level: 'intermediate' },
      { name: 'Flask', icon: 'server', level: 'intermediate' },
      // Added 2026-08-22. It was on AssetMind's chip row and nowhere in this
      // section, so a reader who filtered by skill could not find the framework
      // a featured card names. `level` is the owner's call and this is a guess
      // held deliberately low — one word to change.
      { name: 'FastAPI', icon: 'server', level: 'intermediate', relatedProjectIds: ['assetmind'] },
      { name: 'Vue.js', icon: 'component', level: 'intermediate' },
      { name: 'React', icon: 'component', level: 'intermediate' },
      { name: 'TypeScript', icon: 'code', level: 'intermediate' },
      { name: 'JavaScript', icon: 'code', level: 'advanced' },
      { name: 'C#', icon: 'code', level: 'intermediate' },
    ],
  },
  {
    id: 'ai',
    name: 'AI & Retrieval',
    skills: [
      // Six of the seven here now point at a project, which none of them could
      // before: this category had no `relatedProjectIds` at all while the only
      // AI work on the page was the unwritten Dukunify slot, so hovering any of
      // them dimmed the whole Projects section and highlighted nothing.
      //
      // The links are read off AssetMind's own stack and description, never
      // assumed. Embeddings and Sentence Transformers were left unlinked when
      // AssetMind first landed, on the reasoning that they were evidenced for
      // the Pertamina work rather than this one — the owner's stack table then
      // showed sentence-transformers and PyTorch in AssetMind too, so that
      // reasoning was superseded rather than wrong.
      //
      // `NLP` stays unlinked: it is the one skill here AssetMind's own account
      // never names.
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
      {
        name: 'Vector Embeddings',
        icon: 'chart',
        level: 'intermediate',
        relatedProjectIds: ['assetmind'],
      },
      {
        name: 'Sentence Transformers',
        icon: 'brain',
        level: 'intermediate',
        relatedProjectIds: ['assetmind'],
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
      // Same gap as FastAPI, same day. `database` rather than the `share-2`
      // that marks Knowledge Graphs above: within this card the icon says what
      // kind of thing it is, and Neo4j is a store. What makes it a *graph*
      // store is already said by the skill it sits beside in AI & Retrieval.
      { name: 'Neo4j', icon: 'database', level: 'intermediate', relatedProjectIds: ['assetmind'] },
      { name: 'Business Intelligence', icon: 'chart', level: 'intermediate' },
      { name: 'ETL & Data Warehouse', icon: 'database', level: 'intermediate' },
      { name: 'Metabase', icon: 'chart', level: 'intermediate' },
      { name: 'Docker', icon: 'box', level: 'intermediate' },
      { name: 'Git & GitHub', icon: 'git-branch', level: 'advanced' },
      { name: 'Vercel', icon: 'triangle', level: 'intermediate' },
      { name: 'Hostinger', icon: 'triangle', level: 'intermediate', relatedProjectIds: ['village-portal'] },
      { name: 'Postman', icon: 'wrench', level: 'advanced' },
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
