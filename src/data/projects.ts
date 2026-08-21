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
      'Banjarsari had no single place to find what its administration was doing, who ran it, or what its 7,682 residents were selling — it lived in noticeboards and group chats.',
    solution:
      'A portal carrying the profile, history, officials, news and an interactive map, next to a searchable catalogue of village produce and crafts under "Dari Banjarsari, Untukmu".',
    outcome:
      'Live at banjarsarigarut.id, with village staff managing news, galleries and product listings themselves through an admin panel.',
    // Leaflet over OpenStreetMap is what draws the village map. Everything here
    // is evidenced — Laravel and Hostinger from the CV, the map from the site
    // itself — rather than assumed from "it is a Laravel app".
    stack: ['PHP', 'Laravel', 'MySQL', 'JavaScript', 'Leaflet', 'Hostinger'],
    thumbnail: '/projects/village-portal.webp',
    links: {},
    featured: true,
  },
  {
    id: 'simpel-ibs',
    title: 'Simpel IBS — Online Village Letter Service',
    category: 'Web',
    year: 2026,
    // No role, at the owner's instruction: the meta line reads "Web · 2026".
    // `role` is optional, and the line is assembled from the parts that exist.
    problem:
      'Every administrative letter in Banjarsari meant a trip to the village office, and once a request was in, residents had no way to see whether it had moved or stalled.',
    solution:
      'A service where residents register with their NIK, submit a request with supporting documents, and follow it through verification to a letter they download or collect.',
    // Deliberately not the "500+ residents, 1,200+ letters, 98% satisfaction"
    // shown on the site's own homepage. Those are the product's claims about
    // itself, not measurements — and an outcome line on a portfolio reads as
    // something its author stands behind. What the system does is verifiable
    // by opening it; what it achieved is not.
    outcome:
      'Covers the whole path in one place: submission, document checks, status tracking, and email or WhatsApp notices on every change.',
    // The same stack as the village portal, at the owner's instruction, minus
    // Leaflet — that one draws the portal's map, and this service has none.
    // Say the word if it belongs here too.
    stack: ['PHP', 'Laravel', 'MySQL', 'JavaScript', 'Hostinger'],
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
