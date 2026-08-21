import type { Certificate } from '@/types';

/**
 * Fourteen certificates, all scanned and redacted by the owner.
 *
 * Titles and issuers were read off the scans rather than guessed from the file
 * names — the HackerRank series, BNSP through LSP SDMTIK, Oracle Academy and
 * Huawei all identify themselves on the document.
 *
 * There are no dates here, by the owner's decision, and `Certificate` no longer
 * has a field for one. Every scan states its own date and the lightbox shows
 * the scan at full size, so a caption repeating it was reprinting the image in
 * words — while seven of the fourteen were placeholders that would have shipped
 * as confident misinformation directly beneath a scan that disagreed. The wall
 * groups by `category` and walks in array order, so nothing sorted by them.
 */
export const certificates: Certificate[] = [
  {
    id: 'bnsp-junior-web-developer',
    title: 'Junior Web Developer — Programming and Software Development',
    issuer: 'BNSP · LSP SDMTIK',
    imageUrl: '/certificates/bnsp-junior-web-developer.webp',
    thumbnailUrl: '/certificates/thumb-bnsp-junior-web-developer.webp',
    category: 'professional',
    skills: ['Web Development', 'Programming'],
  },
  {
    id: 'icadeis-presenter',
    title: 'Conference Presenter — ICADEIS 2026',
    issuer: 'ICADEIS',
    imageUrl: '/certificates/icadeis-presenter.webp',
    thumbnailUrl: '/certificates/thumb-icadeis-presenter.webp',
    category: 'professional',
    skills: ['Research', 'RAG', 'Knowledge Graphs'],
  },
  {
    id: 'web-developer',
    // TODO(owner): the exact title on the scan is still unconfirmed. The issuer
    // is BNSP, confirmed. This is the last unverified string in the file.
    title: 'Web Developer',
    issuer: 'BNSP',
    imageUrl: '/certificates/web-developer.webp',
    thumbnailUrl: '/certificates/thumb-web-developer.webp',
    category: 'professional',
    skills: ['Web Development'],
  },
  {
    id: 'hackerrank-python-basic',
    title: 'Python (Basic)',
    issuer: 'HackerRank',
    credentialId: '939F4E1B4031',
    imageUrl: '/certificates/hackerrank-python-basic.webp',
    thumbnailUrl: '/certificates/thumb-hackerrank-python-basic.webp',
    category: 'course',
    skills: ['Python'],
  },
  {
    id: 'hackerrank-javascript',
    title: 'JavaScript (Intermediate)',
    issuer: 'HackerRank',
    imageUrl: '/certificates/hackerrank-javascript.webp',
    thumbnailUrl: '/certificates/thumb-hackerrank-javascript.webp',
    category: 'course',
    skills: ['JavaScript'],
  },
  {
    id: 'hackerrank-rest-api',
    title: 'REST API (Intermediate)',
    issuer: 'HackerRank',
    imageUrl: '/certificates/hackerrank-rest-api.webp',
    thumbnailUrl: '/certificates/thumb-hackerrank-rest-api.webp',
    category: 'course',
    skills: ['REST API', 'Backend'],
  },
  {
    id: 'hackerrank-sql-advanced',
    title: 'SQL (Advanced)',
    issuer: 'HackerRank',
    imageUrl: '/certificates/hackerrank-sql-advanced.webp',
    thumbnailUrl: '/certificates/thumb-hackerrank-sql-advanced.webp',
    category: 'course',
    skills: ['SQL', 'Databases'],
  },
  {
    id: 'hackerrank-frontend-react',
    title: 'Frontend Developer (React)',
    issuer: 'HackerRank',
    imageUrl: '/certificates/hackerrank-frontend-react.webp',
    thumbnailUrl: '/certificates/thumb-hackerrank-frontend-react.webp',
    category: 'course',
    skills: ['React', 'Frontend'],
  },
  {
    id: 'oracle-ai-ml-java',
    title: 'Artificial Intelligence with Machine Learning in Java',
    issuer: 'Oracle Academy',
    imageUrl: '/certificates/oracle-ai-ml-java.webp',
    thumbnailUrl: '/certificates/thumb-oracle-ai-ml-java.webp',
    category: 'course',
    skills: ['Machine Learning', 'Java'],
  },
  {
    id: 'huawei-basic-ai',
    title: 'Basic Artificial Intelligence Course',
    issuer: 'Huawei',
    imageUrl: '/certificates/huawei-basic-ai.webp',
    thumbnailUrl: '/certificates/thumb-huawei-basic-ai.webp',
    category: 'course',
    skills: ['Artificial Intelligence'],
  },
  {
    id: 'huawei-overview-ai',
    title: 'Overview of Artificial Intelligence',
    issuer: 'Huawei',
    imageUrl: '/certificates/huawei-overview-ai.webp',
    thumbnailUrl: '/certificates/thumb-huawei-overview-ai.webp',
    category: 'course',
    skills: ['Artificial Intelligence'],
  },
  {
    id: '1ci-erp-lowcode',
    title: '1Ci ERP Low-Code Training for Software Developers',
    issuer: '1Ci',
    imageUrl: '/certificates/1ci-erp-lowcode.webp',
    thumbnailUrl: '/certificates/thumb-1ci-erp-lowcode.webp',
    category: 'workshop',
    skills: ['ERP', 'Low-Code'],
  },
  {
    id: 'eprt-english',
    title: 'English Proficiency Test (EPRT)',
    issuer: 'Telkom University',
    imageUrl: '/certificates/eprt-english.webp',
    thumbnailUrl: '/certificates/thumb-eprt-english.webp',
    category: 'professional',
    skills: ['English'],
  },
  {
    id: 'abdimas-bina-desa',
    title: 'Abdimas Bina Desa — Community Service Programme',
    issuer: 'Telkom University',
    imageUrl: '/certificates/abdimas-bina-desa.webp',
    thumbnailUrl: '/certificates/thumb-abdimas-bina-desa.webp',
    category: 'workshop',
    skills: ['Community Service'],
  },
];
