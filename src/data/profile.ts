import type { Profile } from '@/types';

export const profile: Profile = {
  // The CV heads with the full legal name, Raden Daffa Firasyan Adikusumah.
  // The short form is what the LinkedIn handle, the page title, the OG tags and
  // the JSON-LD already carry, and it is the name a recruiter will search for.
  // Say the word and all of them change together.
  name: 'Daffa Firasyan',
  shortName: 'Daffa',
  roles: [
    'Full-Stack Developer',
    'AI/ML Engineer',
    'RAG & Knowledge Graphs',
    'Data Analyst',
    'Information Systems Graduate',
  ],
  tagline:
    'I build full-stack systems and retrieval pipelines that turn scattered company data into answers people can act on.',
  bio: [
    'I am a fresh Information Systems graduate from Telkom University. My final project was a decision support system for industrial asset maintenance, where a language model answers questions by walking a knowledge graph built from years of unstructured work orders rather than guessing from raw text. It scored 4.73 out of 5, matched the correct procedure 92.9% of the time, and passed all 39 functional tests.',
    'Most of my work sits between data and the people who have to use it. At Pertamina Hulu Indonesia I built an AI assistant that centralised information scattered across 350 internal portals — .NET Core 8 for the core, a Python microservice for the NLP work, and retrieval over official documents so the answers could be traced. Before that I shipped a Django platform reading live IoT sensors from farms across Indonesia.',
    // Added 2026-08-22, to fill a measured 176px of empty column rather than
    // for its own sake — but it earns the space independently. The bio read as
    // research plus two internships and never mentioned the one thing that
    // shipped and is still running with people who are not him using it.
    //
    // Every clause is from `experiences.ts` and `projects.ts`, which came from
    // the CV: the contract role and its Laravel platform, the admin panel over
    // news and galleries and product listings, the live domain, and the 7,682
    // residents. Nothing here is a sentiment put in his mouth.
    'Not all of it is research. On a contract at Telkom University I built and deployed the Laravel platform that Banjarsari village runs on: a transparency portal beside a catalogue for its local businesses, with an admin panel through which village staff publish their own news, galleries and product listings. It has been live at banjarsarigarut.id since 2025, for a village of 7,682 people.',
    'I am looking for work where the hard part is the domain rather than the framework: messy operational data, unclear requirements, and users who will tell you plainly when the output is wrong.',
  ],
  location: 'Bandung, Indonesia',
  email: 'firasyan.daffa123@gmail.com',
  cvUrl: '/cv/daffa-firasyan-cv.pdf',
  avatarUrl: '/profile/avatar.webp',
  openToWork: true,
  socials: [
    { label: 'GitHub', url: 'https://github.com/DaffaFirasyan', icon: 'github' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/daffafirasyan/', icon: 'linkedin' },
  ],
  // Metadata from Crossref against the DOI, not from the CV. The CV line —
  // and the Education highlight built from it — carried a shortened title:
  // "A Controlled Comparative Study of RAG and KG-RAG", stopping before "for
  // Explainable Asset Maintenance Recommendations". A truncated title in
  // quotation marks beside a link to the real paper is the kind of small
  // wrongness a reader who follows the link will notice.
  //
  // IEEE Xplore itself refuses automated fetches, which is worth knowing before
  // trying: `api.crossref.org/works/<doi>` answers with the registered record
  // and is the better source anyway.
  publication: {
    title:
      'A Controlled Comparative Study of RAG and KG-RAG for Explainable Asset Maintenance Recommendations',
    // In publication order. He is first author; the other three are his
    // supervisors and are named because omitting them would imply he was not.
    authors: [
      'Raden Daffa Firasyan Adikusumah',
      'Sinung Suakanto',
      'Ekky Novriza Alam',
      'Edi Triono Nuryatno',
    ],
    venue: 'ICADEIS 2026',
    venueFull:
      'International Conference on Advancement in Data Science, E-learning and Information System',
    publisher: 'IEEE Xplore',
    doi: '10.1109/ICADEIS71120.2026.11644554',
    url: 'https://doi.org/10.1109/ICADEIS71120.2026.11644554',
    year: 2026,
  },
  stats: [
    { label: 'Projects', value: 4 },
    { label: 'Certificates', value: 14 },
    { label: 'Years coding', value: 4, suffix: '+' },
  ],
};
