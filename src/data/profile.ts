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
    'Information Systems Graduate',
  ],
  tagline:
    'I build full-stack systems and retrieval pipelines that turn scattered company data into answers people can act on.',
  bio: [
    'I am a fresh Information Systems graduate from Telkom University. My final project was a decision support system for industrial asset maintenance, where a language model answers questions by walking a knowledge graph built from years of unstructured work orders rather than guessing from raw text. It scored 4.73 out of 5, matched the correct procedure 92.9% of the time, and passed all 39 functional tests.',
    'Most of my work sits between data and the people who have to use it. At Pertamina Hulu Indonesia I built an AI assistant that centralised information scattered across 350 internal portals — .NET Core 8 for the core, a Python microservice for the NLP work, and retrieval over official documents so the answers could be traced. Before that I shipped a Django platform reading live IoT sensors from farms across Indonesia.',
    'I am looking for work where the hard part is the domain rather than the framework: messy operational data, unclear requirements, and users who will tell you plainly when the output is wrong.',
  ],
  location: 'Bandung, Indonesia',
  email: 'firasyan.daffa123@gmail.com',
  cvUrl: '/cv/daffa-firasyan-cv.pdf',
  avatarUrl: '/profile/avatar.webp',
  openToWork: true,
  socials: [
    // TODO(owner): the CV lists no GitHub. Replace this with the real profile
    // or delete the entry — a portfolio linking to a dead account is worse than
    // one that links to none.
    { label: 'GitHub', url: 'https://github.com/example', icon: 'github' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/daffafirasyan/', icon: 'linkedin' },
  ],
  stats: [
    { label: 'Projects', value: 8 },
    { label: 'Certificates', value: 14 },
    { label: 'Years coding', value: 4, suffix: '+' },
  ],
};
