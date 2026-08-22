import type { Project } from '@/types';

/**
 * Four projects, three of them featured, chosen by the owner.
 *
 * Every description here comes from an account the owner wrote — the CV for the
 * village portal, his own summaries for the rest. Nothing is invented, which is
 * why `role` is absent from three of the four. A portfolio that describes work
 * in words its author did not choose is worse than one that says less.
 *
 * AssetMind replaced Dukunify on 2026-08-22, and took Animart's featured slot
 * the same day. Dukunify had sat here since the content paste with every field
 * still `TODO(owner)`; the featured tier held three Laravel builds on a site
 * whose own title claims AI/ML. Both were the same gap seen from two sides.
 *
 * **AssetMind is first, and deliberately.** The site's own title claims AI/ML
 * and this is the only project that proves it — an IEEE paper, a knowledge
 * graph, a real evaluation. It leads the grid as a full-width tile; the rest
 * follow in a row of three.
 *
 * Order is expressed here rather than as a special case in the section, because
 * which project leads is a content decision. `Projects.tsx` puts featured first
 * and otherwise renders the array as it finds it, so moving an entry in this
 * file is the whole mechanism.
 */
export const projects: Project[] = [
  {
    id: 'assetmind',
    title: 'AssetMind — Maintenance Decision Support',
    // The only 'AI' project, which is the point of labelling it that way: the
    // site calls its owner an AI/ML Engineer and the filter row is where a
    // reader goes looking for the evidence. A one-item category is a weak
    // filter and a strong signal; this is the second.
    category: 'AI',
    year: 2026,
    // No role, like Simpel IBS and Animart. This is his final-year research
    // project, which the Education entry already frames — naming a role here
    // would be describing the work rather than his part in it.
    problem:
      "Palm oil maintenance knowledge sat in SOPs, manuals, past reports and individual mechanics' heads, so the same fault could get a different answer depending on who looked at it.",
    solution:
      'A decision support system where an LLM reasons over a knowledge graph linking asset, component, fault, cause and procedure, then explains what each recommendation was drawn from.',
    // Leads with explainability rather than the headline 4.73, for two reasons.
    // It is the dimension the problem statement is actually about — a system
    // that cannot say why is one nobody trusts — and it moved furthest, 0.30
    // against 0.15 for relevance. It also avoids repeating the Education
    // highlight, which already carries 4.73 and the 39/39.
    outcome:
      'Two prototype iterations took explainability from 4.42 to 4.72 and procedure match from 80% to 92.9%. All 39 functional tests passed.',
    // Six of the eighteen the owner listed, chosen so each names a different
    // layer rather than a different package: language, API, orchestration,
    // model, graph store, embeddings. Uvicorn, Pydantic, pytest, httpx and the
    // langchain-* adapters are all real and all implied by the six that are
    // here — a chip row is a summary, and one that lists a test runner beside
    // a 70B model tells a reader less, not more.
    //
    // Neo4j earns its place over anything else competing for the slot: the
    // knowledge graph is the whole claim of this project, and it is the only
    // chip that says the graph is real rather than a diagram.
    stack: ['Python', 'FastAPI', 'LangChain', 'Llama 3.3 70B', 'Neo4j', 'Sentence Transformers'],
    thumbnail: '/projects/assetmind.webp',
    links: {},
    featured: true,
  },
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
    // The owner's own words, 2026-08-22. It was briefly 'Solo — analysis and
    // build', which I had inferred and which his account contradicted: the
    // report says the team chose the approach. Removed rather than guessed
    // again, then filled in when he said what it was.
    role: 'Web developer',
    problem:
      'Animart tracked sales and stock by hand across books and spreadsheets, so the numbers never agreed, and every decision about what to buy next came down to the owner guessing.',
    solution:
      'A web system where a point of sale records each sale, stock falls automatically by recipe as menus sell, and a simple moving average projects short-term demand from that history.',
    outcome:
      'Stock now follows each sale instead of a stocktake, and a dashboard turns the history into reorder quantities. Accepted in user testing.',
    stack: ['PHP', 'Laravel', 'MySQL', 'JavaScript', 'CSS'],
    thumbnail: '/projects/animart.webp',
    links: {},
    // Demoted to the quiet tier on 2026-08-22 to make room for AssetMind.
    // `featuredMax` is 3 and all three slots held Laravel work, on a site whose
    // own title claims AI/ML. Of the three this was the weakest technically —
    // a moving average — so it is the one that moved.
    featured: false,
  },
];
