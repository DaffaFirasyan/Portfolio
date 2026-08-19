import type { Project } from '@/types';

/**
 * Four projects, three of them featured, chosen by the owner.
 *
 * Two are described from the CV. Two are not in the CV at all and their
 * descriptions are the owner's to write — they are marked `TODO(owner)` rather
 * than invented, because a portfolio that describes work in words its author
 * did not choose is worse than one that says less.
 */
export const projects: Project[] = [
  {
    id: 'village-portal',
    title: 'Village Profile and MSME Commerce Portal',
    category: 'Web',
    year: 2025,
    role: 'Contract developer at Telkom University',
    problem:
      'Village updates lived in noticeboards and group chats, and the MSMEs trading nearby had no shared shopfront, so residents could see neither the administration nor the businesses.',
    solution:
      'A Laravel application pairing a public transparency portal with a product catalogue, and an admin panel letting village staff manage news, galleries and listings themselves.',
    outcome:
      'Deployed to production on Hostinger, with bulk product upload by Excel and dashboards tracking visitors and most-viewed listings.',
    stack: ['PHP', 'Laravel', 'MySQL', 'Bootstrap', 'Hostinger', 'Excel Import'],
    thumbnail: '/projects/village-portal.webp',
    links: {},
    featured: true,
  },
  {
    id: 'simpel-ibs',
    title: 'Simpel IBS',
    category: 'Web',
    year: 2025,
    role: 'TODO(owner): your role on this project',
    // TODO(owner): this project is not in the CV. Replace all three sentences.
    // The section renders `problem` on the featured row and all of it in the
    // dialog, so these are the words a recruiter actually reads.
    problem: 'TODO(owner): what problem did this solve, and for whom?',
    solution: 'TODO(owner): how did you solve it, and what did you build?',
    outcome: 'TODO(owner): what changed as a result — a number if you have one.',
    stack: ['TODO'],
    thumbnail: '/projects/simpel-ibs.webp',
    links: {},
    featured: true,
  },
  {
    id: 'animart',
    title: 'Inventory and Demand Forecasting for a Food MSME',
    category: 'Data',
    year: 2025,
    role: 'Solo — analysis and build',
    problem:
      'A food MSME ordered stock on instinct, so fast-moving items ran out while slow ones sat until they spoiled, and nobody could say which was about to happen next week.',
    solution:
      'A web decision support system that tracks inventory and forecasts demand from past sales, turning a guess about next week into a number the owner can order against.',
    outcome:
      'Built as a case study with Animart, covering stock management and demand prediction in one interface.',
    stack: ['Python', 'Web', 'Forecasting'],
    thumbnail: '/projects/animart.webp',
    links: {},
    featured: true,
  },
  {
    id: 'dukunify',
    title: 'Dukunify',
    category: 'Web',
    year: 2025,
    role: 'TODO(owner): your role on this project',
    // TODO(owner): not in the CV either. Same three sentences to fill.
    problem: 'TODO(owner): what problem did this solve, and for whom?',
    solution: 'TODO(owner): how did you solve it, and what did you build?',
    outcome: 'TODO(owner): what changed as a result — a number if you have one.',
    stack: ['TODO'],
    thumbnail: '/projects/dukunify.webp',
    links: {},
    featured: false,
  },
];
