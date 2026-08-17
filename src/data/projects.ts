import type { Project } from '@/types';

export const projects: Project[] = [
  {
    id: 'kg-maintenance-assistant',
    title: 'Predictive Maintenance Knowledge Graph Assistant',
    category: 'AI/ML',
    year: 2026,
    role: 'Solo — AI Engineer and system designer',
    problem:
      'Maintenance teams across three plantation sites recorded equipment faults as free-form text in separate spreadsheets, so nobody could see that the same failure kept coming back.',
    solution:
      'Built a retrieval pipeline that extracts entities from work orders into a Neo4j graph, then answers natural-language questions by walking the graph before prompting the model.',
    outcome:
      'Cut the time to trace a repeat fault from roughly forty minutes of manual search to under two minutes.',
    stack: ['Python', 'Neo4j', 'FastAPI', 'LangChain', 'Groq', 'Docker'],
    thumbnail: '/projects/kg-maintenance-assistant.webp',
    links: { repo: 'https://github.com/example/kg-maintenance-assistant' },
    featured: true,
  },
  {
    id: 'sentiment-dashboard',
    title: 'Indonesian Product Review Sentiment Dashboard',
    category: 'Data',
    year: 2025,
    role: 'Team of 3 — data pipeline',
    problem:
      'A small seller had thousands of marketplace reviews in Bahasa Indonesia and no way to tell which product complaints were growing month over month.',
    solution:
      'Fine-tuned a multilingual transformer for three-class sentiment, then surfaced weekly aspect trends in a dashboard the seller could read without training.',
    outcome: 'Reached 87% macro F1 on a held-out set of 2,400 hand-labelled reviews.',
    stack: ['Python', 'Transformers', 'Streamlit', 'Pandas'],
    thumbnail: '/projects/sentiment-dashboard.webp',
    links: { repo: 'https://github.com/example/sentiment-dashboard' },
    featured: true,
  },
  {
    id: 'campus-room-booking',
    title: 'Campus Room Booking System',
    category: 'Web',
    year: 2025,
    role: 'Team of 4 — backend lead',
    problem:
      'Room bookings ran through a group chat, so double bookings were discovered only when two classes arrived at the same room.',
    solution:
      'Built a booking service with conflict detection at the database level and a calendar view that shows availability before a request is submitted.',
    outcome: 'Used by 59 students and staff across one semester with no double booking reported.',
    stack: ['TypeScript', 'Next.js', 'PostgreSQL', 'Prisma'],
    thumbnail: '/projects/campus-room-booking.webp',
    links: {
      demo: 'https://example.com/room-booking',
      repo: 'https://github.com/example/campus-room-booking',
    },
    featured: true,
  },
  {
    id: 'ocr-invoice-parser',
    title: 'Invoice Field Extractor',
    category: 'AI/ML',
    year: 2025,
    role: 'Solo',
    problem:
      'A finance team retyped totals and dates from scanned supplier invoices, which meant slow entry and frequent transcription errors.',
    solution:
      'Combined layout-aware OCR with a rule pass that validates extracted totals against line items before anything is written.',
    outcome: 'Extracted the four key fields correctly on 92% of a 300-invoice sample.',
    stack: ['Python', 'PaddleOCR', 'FastAPI'],
    thumbnail: '/projects/ocr-invoice-parser.webp',
    links: { repo: 'https://github.com/example/ocr-invoice-parser' },
    featured: false,
  },
  {
    id: 'thesis-corpus-explorer',
    title: 'Thesis Corpus Explorer',
    category: 'Data',
    year: 2024,
    role: 'Solo',
    problem:
      'Students searching past theses could only match exact titles, so closely related work in another department stayed invisible.',
    solution:
      'Embedded every abstract and exposed nearest-neighbour search with a topic map, so related work surfaces even when the wording differs.',
    outcome: 'Indexed 1,850 abstracts with sub-second search on commodity hardware.',
    stack: ['Python', 'FAISS', 'Flask'],
    thumbnail: '/projects/thesis-corpus-explorer.webp',
    links: { repo: 'https://github.com/example/thesis-corpus-explorer' },
    featured: false,
  },
  {
    id: 'attendance-vision',
    title: 'Attendance by Face Recognition',
    category: 'AI/ML',
    year: 2024,
    role: 'Team of 3 — model training',
    problem:
      'Paper attendance sheets for a 120-student lecture took ten minutes per session and were easy to sign on behalf of someone else.',
    solution:
      'Trained a face embedding model on enrolled students and matched against a gallery at the door, with a manual fallback for failed matches.',
    outcome: 'Recorded a full lecture in under 90 seconds at 96% top-1 match accuracy.',
    stack: ['Python', 'PyTorch', 'OpenCV'],
    thumbnail: '/projects/attendance-vision.webp',
    links: { repo: 'https://github.com/example/attendance-vision' },
    featured: false,
  },
  {
    id: 'kos-finder',
    title: 'Student Housing Finder',
    category: 'Web',
    year: 2024,
    role: 'Solo',
    problem:
      'Listings for student housing near campus were scattered across social media posts with no consistent price or distance information.',
    solution:
      'Scraped and normalised listings into one searchable map with filters for price, distance to campus, and facilities.',
    outcome: 'Normalised 340 listings and reduced a typical search from hours to minutes.',
    stack: ['TypeScript', 'React', 'Leaflet'],
    thumbnail: '/projects/kos-finder.webp',
    links: { demo: 'https://example.com/kos-finder' },
    featured: false,
  },
  {
    id: 'rainfall-forecast',
    title: 'Regional Rainfall Forecast Baseline',
    category: 'Data',
    year: 2023,
    role: 'Solo',
    problem:
      'Plantation scheduling relied on a single national forecast that was too coarse to be useful at the level of an individual estate.',
    solution:
      'Trained a gradient-boosted baseline on ten years of station data and compared it honestly against the naive persistence forecast.',
    outcome: 'Beat the persistence baseline by 14% RMSE on next-day rainfall.',
    stack: ['Python', 'scikit-learn', 'Matplotlib'],
    thumbnail: '/projects/rainfall-forecast.webp',
    links: { repo: 'https://github.com/example/rainfall-forecast' },
    featured: false,
  },
];
