import type { Profile } from '@/types';

export const profile: Profile = {
  name: 'Daffa Firasyan',
  shortName: 'Daffa',
  roles: [
    'AI/ML Engineer',
    'Knowledge Graph Engineer',
    'Full-Stack Developer',
    'Information Systems Student',
  ],
  tagline:
    'I build retrieval systems that turn scattered maintenance records into answers engineers can act on in the field.',
  bio: [
    'I am an Information Systems student finishing a thesis on decision support for industrial asset maintenance, where a language model answers questions by walking a knowledge graph built from years of unstructured work orders instead of guessing from raw text.',
    'Most of my work sits between data and the people who have to use it. I have built retrieval pipelines over graph databases, trained sentiment classifiers on Indonesian text, and shipped web applications that small teams actually keep using after the demo is over. That last part is usually what decides whether the project mattered, and it almost never comes down to the model I picked.',
    'I am looking for work where the hard part is the domain rather than the framework — messy operational data, unclear requirements, and users who will tell you plainly when the output is wrong.',
  ],
  location: 'Bandung, Indonesia',
  email: 'hello@example.com',
  cvUrl: '/cv/daffa-firasyan-cv.pdf',
  avatarUrl: '/profile/avatar.webp',
  openToWork: true,
  socials: [
    { label: 'GitHub', url: 'https://github.com/example', icon: 'github' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/example', icon: 'linkedin' },
  ],
  stats: [
    { label: 'Projects', value: 8 },
    { label: 'Certificates', value: 14 },
    { label: 'Years coding', value: 4, suffix: '+' },
  ],
};
