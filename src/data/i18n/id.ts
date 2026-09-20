import type {
  Education,
  Experience,
  ExperienceType,
  Profile,
  Project,
  SectionMeta,
  SkillCategory,
} from '@/types';
import { profile } from '../profile';
import { skillCategories } from '../skills';

export const profileId: Profile = {
  name: profile.name,
  shortName: profile.shortName,
  roles: [
    'Full-Stack Developer',
    'AI/ML Engineer',
    'RAG & Knowledge Graphs',
    'Data Analyst',
    'Information Systems Graduate',
  ],
  tagline:
    'Membangun aplikasi full-stack dan sistem AI handal untuk mengolah data kompleks jadi solusi nyata yang mudah digunakan.',
  bio: [
    'Lulusan Sistem Informasi Telkom University yang berfokus pada rekayasa perangkat lunak dan kecerdasan buatan. Untuk tugas akhir, saya merancang sistem rekomendasi pemeliharaan alat berat: menggabungkan LLM dan Knowledge Graph dari riwayat perbaikan agar hasil analisis akurat serta dapat diverifikasi. Proyek ini meraih skor kepuasan 4.73/5, kepatuhan prosedur 92.9%, dan berhasil melewati seluruh 39 uji fungsional.',
    'Pengalaman kerja saya berpusat pada integrasi data dan kebutuhan operasional nyata. Di Pertamina Hulu Indonesia, saya mengembangkan chatbot asisten cerdas untuk 350+ portal internal berbasis .NET Core 8, microservices Python, dan semantic search agar rujukan dokumen selalu transparan. Sebelumnya di PT Sinar Harsa Grasia, saya membangun platform Django untuk memantau data sensor IoT peternakan secara real-time.',
    'Selain sistem internal, saya juga terbiasa merilis produk web ke lingkungan produksi publik. Melalui proyek kontrak di Telkom University, saya merancang platform Laravel untuk Desa Banjarsari (Garut) yang menggabungkan portal layanan warga dan katalog digital UMKM lokal. Sistem ini sudah live di banjarsarigarut.id sejak 2025 dan aktif melayani kebutuhan informasi serta geliat ekonomi bagi lebih dari 7.600 warga.',
    'Saya antusias mendalami tantangan rekayasa perangkat lunak dan analitik data: merancang arsitektur sistem yang andal, efisien, serta menghadirkan dampak positif bagi para penggunanya.',
  ],
  location: 'Bandung, Indonesia',
  email: profile.email,
  whatsapp: profile.whatsapp,
  cvUrl: '/cv/daffa-firasyan-cv-id.pdf',
  avatarUrl: profile.avatarUrl,
  openToWork: true,
  socials: profile.socials,
  publication: profile.publication,
  stats: [
    { label: 'Proyek', value: 4 },
    { label: 'Sertifikat', value: 14 },
    { label: 'Tahun pengalaman', value: 4, suffix: '+' },
  ],
};

export const EXPERIENCE_TYPE_LABEL_ID: Record<ExperienceType, string> = {
  work: 'Kontrak',
  internship: 'Magang',
  organization: 'Organisasi',
  freelance: 'Freelance',
  volunteer: 'Relawan',
  research: 'Riset',
};

export const experiencesId: Experience[] = [
  {
    id: 'telkom-fullstack',
    role: 'Contract Full-Stack Developer',
    organization: 'Telkom University',
    type: 'work',
    location: 'Bandung',
    startDate: '2025-06',
    endDate: '2026-01',
    summary:
      'Mengembangkan platform web terintegrasi berbasis Laravel untuk layanan publik desa dan katalog e-commerce UMKM lokal.',
    highlights: [
      'Membangun panel admin lengkap untuk kelola berita, galeri desa, struktur organisasi, dan konten dinamis secara mandiri.',
      'Membuat katalog produk UMKM dengan pencarian, filter kategori, serta fitur import data massal via file Excel.',
      'Merancang dashboard analitik interaktif untuk melacak kunjungan harian warga, produk UMKM terlaris, dan performa konten.',
      'Melakukan deployment produksi di Hostinger, konfigurasi DNS domain banjarsarigarut.id, dan optimasi database MySQL.',
    ],
    stack: ['PHP', 'Laravel', 'MySQL', 'Hostinger'],
  },
  {
    id: 'pertamina-ai',
    role: 'AI Full-Stack Developer Intern',
    organization: 'Pertamina Hulu Indonesia',
    type: 'internship',
    location: 'Jakarta',
    startDate: '2025-07',
    endDate: '2025-08',
    summary:
      'Membangun chatbot asisten AI berbasis microservices untuk mengintegrasikan informasi dari 350+ portal internal perusahaan.',
    highlights: [
      'Merancang arsitektur microservices: .NET Core 8 untuk backend & orkestrasi bisnis, Python (Flask) untuk pemrosesan NLP.',
      'Menerapkan pipeline RAG dan Sentence Transformers untuk pencarian semantik pada ribuan dokumen resmi perusahaan.',
      'Merancang struktur database SQL Server untuk integrasi portal, basis pengetahuan (knowledge base), dan riwayat chat.',
      'Membangun dashboard admin dan widget chatbot modular dengan Vue.js & TypeScript yang dapat disematkan ke berbagai web internal.',
    ],
    stack: ['.NET Core 8', 'Python', 'Flask', 'Vue.js', 'TypeScript', 'SQL Server'],
  },
  {
    id: 'arranet-fullstack',
    role: 'Full-Stack Developer Intern',
    organization: 'PT Sinar Harsa Grasia',
    type: 'internship',
    location: 'Jakarta',
    startDate: '2024-11',
    endDate: '2025-04',
    summary:
      'Mengembangkan platform manajemen peternakan berbasis web yang terhubung langsung dengan sensor IoT di berbagai wilayah.',
    highlights: [
      'Membangun backend Django untuk autentikasi pengguna, pencatatan data peternakan, dan integrasi telemetri perangkat IoT.',
      'Mengembangkan antarmuka web yang responsif dan nyaman digunakan dengan HTML, CSS modern, dan JavaScript vanilla.',
      'Menampilkan data sensor IoT ke dalam dashboard pemantauan kondisi ternak secara langsung (real-time).',
      'Mengimplementasikan REST API, protokol MQTT, serta Celery & Redis untuk antrean tugas asinkron dan komunikasi perangkat.',
    ],
    stack: ['Python', 'Django', 'REST API', 'MQTT', 'Celery', 'Redis'],
  },
];

export const projectsId: Project[] = [
  {
    id: 'assetmind',
    title: 'AssetMind — AI Rekomendasi Pemeliharaan',
    category: 'AI',
    year: 2026,
    problem:
      'Prosedur pemeliharaan alat berat tersebar di tumpukan SOP dan manual cetak, memicu inkonsistensi perbaikan saat terjadi kerusakan di lapangan.',
    solution:
      'Sistem pendukung keputusan berbasis LLM dan knowledge graph (Neo4j) yang menganalisis riwayat work order dan menyajikan rujukan tindakan yang jelas.',
    outcome:
      'Meningkatkan explainability ke 4.72/5 dan kepatuhan prosedur ke 92.9%. Sukses melewati seluruh 39 skenario uji fungsional.',
    stack: ['Python', 'FastAPI', 'LangChain', 'Llama 3.3 70B', 'Neo4j', 'Sentence Transformers'],
    thumbnail: '/projects/assetmind.webp',
    links: {},
    featured: true,
  },
  {
    id: 'village-portal',
    title: 'Portal Profil & Katalog UMKM Banjarsari',
    category: 'Web',
    year: 2025,
    role: 'Contract developer di Telkom University',
    problem:
      'Warga dan aparatur desa belum memiliki platform digital terpadu untuk transparansi profil desa maupun wadah promosi produk UMKM lokal.',
    solution:
      'Portal web terintegrasi berisi layanan informasi desa dan katalog UMKM warga, dilengkapi panel admin untuk pembaruan data secara mandiri.',
    outcome:
      'Aktif di banjarsarigarut.id dan dikelola mandiri oleh staf desa untuk melayani kebutuhan lebih dari 7.600 warga.',
    stack: ['PHP', 'Laravel', 'MySQL', 'JavaScript', 'Leaflet', 'Hostinger'],
    thumbnail: '/projects/village-portal.webp',
    links: {},
    featured: true,
  },
  {
    id: 'simpel-ibs',
    title: 'Simpel IBS — Layanan Administrasi Desa',
    category: 'Web',
    year: 2026,
    problem:
      'Pengurusan berkas dan surat warga masih manual, mengharuskan antre di kantor desa tanpa kejelasan status dan waktu penyelesaian.',
    solution:
      'Sistem administrasi mandiri berbasis NIK untuk pengajuan surat online, unggah dokumen, serta pelacakan progres secara real-time.',
    outcome:
      'Mendigitalkan alur verifikasi berkas aparatur desa serta otomatisasi pembaruan status permohonan via WhatsApp dan email.',
    stack: ['PHP', 'Laravel', 'MySQL', 'JavaScript', 'Hostinger'],
    thumbnail: '/projects/simpel-ibs.webp',
    links: {},
    featured: true,
  },
  {
    id: 'animart',
    title: 'Animart — POS & Estimasi Stok UMKM',
    category: 'Data',
    year: 2025,
    role: 'Web developer',
    problem:
      'Pencatatan nota penjualan manual kerap memicu selisih stok, serta pengadaan bahan baku yang masih bergantung pada perkiraan kasar.',
    solution:
      'Aplikasi POS web dengan pemotongan stok otomatis per transaksi dan prediksi kebutuhan restok berbasis metode moving average.',
    outcome:
      'Sinkronisasi stok barang berjalan otomatis dan perencanaan belanja bahan baku menjadi lebih akurat sesuai data riwayat penjualan.',
    stack: ['PHP', 'Laravel', 'MySQL', 'JavaScript', 'CSS'],
    thumbnail: '/projects/animart.webp',
    links: {},
    featured: false,
  },
];

export const skillCategoriesId: SkillCategory[] = skillCategories.map((category) => {
  if (category.id === 'languages') {
    return { ...category, name: 'Bahasa & Framework' };
  }
  if (category.id === 'ai') {
    return { ...category, name: 'AI & Data Retrieval' };
  }
  if (category.id === 'data-infra') {
    return { ...category, name: 'Data & Platform' };
  }
  if (category.id === 'domain') {
    return { ...category, name: 'Desain & Domain' };
  }
  return category;
});

export const educationId: Education[] = [
  {
    id: 'bachelor-is',
    institution: 'Telkom University',
    degree: 'Sarjana Sistem Informasi',
    field: 'Sistem Informasi',
    startYear: 2022,
    endYear: 2026,
    gpa: '3.65 / 4.00 (Cumlaude)',
    highlights: [
      'Tugas akhir: Sistem pendukung keputusan LLM dengan RAG dan KG-RAG (skor evaluasi 4.73/5, akurasi prosedur 92.9%, lulus 39/39 uji fungsional).',
      'Penulis pertama publikasi ilmiah mengenai RAG & KG-RAG untuk rekomendasi pemeliharaan aset (dipresentasikan di ICADEIS 2026 & terbit di IEEE).',
    ],
    logoUrl: '/education/telkom-university.webp',
  },
];

export const sectionsId: SectionMeta[] = [
  { id: 'home', label: 'Beranda', index: 0 },
  { id: 'about', label: 'Tentang', index: 1, title: 'Tentang Saya' },
  { id: 'skills', label: 'Keahlian', index: 2, title: 'Keahlian & Teknologi' },
  { id: 'experience', label: 'Pengalaman', index: 3, title: 'Pengalaman Kerja' },
  { id: 'projects', label: 'Proyek', index: 4, title: 'Proyek Pilihan' },
  { id: 'education', label: 'Pendidikan', index: 5, title: 'Pendidikan & Sertifikasi' },
  { id: 'contact', label: 'Kontak', index: 6, title: 'Hubungi Saya' },
];

