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
    'Lulusan Sistem Informasi',
  ],
  tagline:
    'Saya membangun sistem full-stack dan pipeline retrieval yang mengubah data perusahaan yang tersebar menjadi wawasan yang dapat ditindaklanjuti.',
  bio: [
    'Saya adalah lulusan baru Sistem Informasi dari Telkom University. Tugas akhir saya adalah sistem pendukung keputusan pemeliharaan aset industri, di mana model bahasa menjawab pertanyaan dengan menelusuri knowledge graph dari riwayat work order tidak terstruktur alih-alih menebak dari teks mentah. Sistem ini meraih skor evaluasi 4.73 dari 5, kesesuaian prosedur 92.9%, dan lulus seluruh 39 pengujian fungsional.',
    'Sebagian besar karya saya berfokus menghubungkan data dengan pengguna operasional. Di Pertamina Hulu Indonesia, saya mengembangkan asisten AI yang memusatkan informasi tersebar dari 350+ portal internal perusahaan — menggunakan .NET Core 8 untuk backend inti, microservice Python untuk tugas NLP, serta retrieval pada dokumen resmi agar jawaban dapat ditelusuri rujukannya. Sebelumnya, saya mengembangkan platform Django yang membaca sensor IoT peternakan secara real-time di berbagai wilayah Indonesia.',
    'Tidak semua karya saya berupa riset. Melalui kontrak di Telkom University, saya merancang dan merilis platform Laravel untuk Desa Banjarsari: portal transparansi publik bersanding dengan katalog UMKM lokal, dilengkapi panel admin agar aparatur desa dapat mempublikasikan berita, galeri, dan produk secara mandiri. Sistem ini aktif di banjarsarigarut.id sejak 2025 untuk desa berpenduduk 7.682 jiwa.',
    'Saya mencari peluang kerja di mana tantangan terbesarnya ada pada kompleksitas domain: data operasional yang rumit, kebutuhan yang dinamis, dan pengguna nyata yang membutuhkan sistem andal dan akurat.',
  ],
  location: 'Bandung, Indonesia',
  email: profile.email,
  cvUrl: profile.cvUrl,
  avatarUrl: profile.avatarUrl,
  openToWork: true,
  socials: profile.socials,
  publication: profile.publication,
  stats: [
    { label: 'Proyek', value: 4 },
    { label: 'Sertifikat', value: 14 },
    { label: 'Tahun coding', value: 4, suffix: '+' },
  ],
};

export const EXPERIENCE_TYPE_LABEL_ID: Record<ExperienceType, string> = {
  work: 'Kontrak',
  internship: 'Magang',
  organization: 'Organisasi',
  freelance: 'Lepas',
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
      'Membangun platform monolitik Laravel yang memadukan portal transparansi desa dengan modul e-commerce UMKM lokal.',
    highlights: [
      'Merancang panel admin CRUD untuk pengelolaan berita, galeri multimedia, bagan struktur organisasi, dan konten dinamis.',
      'Mengembangkan katalog produk dengan fitur pencarian, filter kategori, serta fitur impor massal Excel untuk efisiensi data.',
      'Merancang dashboard statistik interaktif untuk memantau trafik pengunjung harian, produk terpopuler, dan metrik konten.',
      'Mendeploy dan mengonfigurasi aplikasi di Hostinger, mencakup pengaturan domain, konfigurasi produksi, dan optimasi database.',
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
      'Membangun Asisten AI Chatbot berbasis microservices untuk memusatkan informasi dari 350+ portal internal perusahaan.',
    highlights: [
      'Merancang arsitektur microservices: .NET Core 8 untuk logika bisnis dan orkestrasi, Python dan Flask untuk layanan NLP.',
      'Mengimplementasikan RAG dan Sentence Transformers untuk pencarian semantik dokumen resmi perusahaan via vector embeddings.',
      'Merancang skema database relasional MS SQL Server untuk data portal, dokumen knowledge base, dan riwayat sesi chat.',
      'Membangun dashboard admin mandiri dan widget chatbot yang dapat disematkan lintas situs internal dengan Vue.js dan TypeScript.',
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
      'Mengembangkan aplikasi manajemen peternakan berbasis web yang terintegrasi dengan sistem IoT real-time di seluruh Indonesia.',
    highlights: [
      'Merancang dan mengembangkan backend Django untuk mengelola data pengguna, catatan peternakan, dan integrasi perangkat IoT.',
      'Mengembangkan fitur frontend yang responsif dan ramah pengguna dengan HTML, CSS, dan JavaScript.',
      'Mengintegrasikan data sensor IoT ke dashboard web untuk memantau aktivitas ternak di berbagai lokasi secara real-time.',
      'Mengimplementasikan REST API, MQTT, Celery, dan Redis untuk komunikasi perangkat, pemrosesan data, dan background task.',
    ],
    stack: ['Python', 'Django', 'REST API', 'MQTT', 'Celery', 'Redis'],
  },
];

export const projectsId: Project[] = [
  {
    id: 'assetmind',
    title: 'AssetMind — Sistem Pendukung Keputusan Pemeliharaan',
    category: 'AI',
    year: 2026,
    problem:
      'Pengetahuan pemeliharaan sawit tersebar di SOP, manual, dan ingatan mekanik, sehingga masalah serupa mendapat penanganan berbeda.',
    solution:
      'Sistem pendukung keputusan di mana LLM bernalar di atas knowledge graph (aset, komponen, kerusakan, prosedur) dan menjelaskan rujukan rekomendasinya.',
    outcome:
      'Dua iterasi prototipe meningkatkan explainability dari 4.42 ke 4.72 dan kesesuaian prosedur dari 80% ke 92.9%. Lulus 39/39 uji fungsional.',
    stack: ['Python', 'FastAPI', 'LangChain', 'Llama 3.3 70B', 'Neo4j', 'Sentence Transformers'],
    thumbnail: '/projects/assetmind.webp',
    links: {},
    featured: true,
  },
  {
    id: 'village-portal',
    title: 'Portal Profil Desa dan Niaga UMKM',
    category: 'Web',
    year: 2025,
    role: 'Contract developer di Telkom University',
    problem:
      'Desa Banjarsari belum memiliki wadah terpusat untuk profil desa, transparansi aparatur, maupun produk dari 7.682 warganya.',
    solution:
      'Portal profil, sejarah, aparatur, berita, dan peta interaktif, bersanding dengan katalog produk dan kerajinan "Dari Banjarsari, Untukmu".',
    outcome:
      'Aktif di banjarsarigarut.id, dengan staf desa mengelola berita, galeri, dan produk secara mandiri via panel admin.',
    stack: ['PHP', 'Laravel', 'MySQL', 'JavaScript', 'Leaflet', 'Hostinger'],
    thumbnail: '/projects/village-portal.webp',
    links: {},
    featured: true,
  },
  {
    id: 'simpel-ibs',
    title: 'Simpel IBS — Layanan Surat Online Desa',
    category: 'Web',
    year: 2026,
    problem:
      'Setiap pengurusan surat administrasi di Banjarsari mengharuskan warga datang ke kantor desa tanpa kepastian status permohonan.',
    solution:
      'Layanan mandiri warga dengan registrasi NIK, pengajuan surat beserta dokumen pendukung, dan pelacakan status hingga surat siap diambil.',
    outcome:
      'Mencakup alur lengkap: pengajuan, verifikasi berkas, pelacakan status, serta notifikasi perubahan status via WhatsApp dan email.',
    stack: ['PHP', 'Laravel', 'MySQL', 'JavaScript', 'Hostinger'],
    thumbnail: '/projects/simpel-ibs.webp',
    links: {},
    featured: true,
  },
  {
    id: 'animart',
    title: 'Peramalan Permintaan dan Stok UMKM Kuliner',
    category: 'Data',
    year: 2025,
    role: 'Web developer',
    problem:
      'Pencatatan penjualan dan stok manual membuat angka kerap tidak cocok dan keputusan belanja bahan baku hanya berdasarkan perkiraan.',
    solution:
      'Sistem web POS di mana stok berkurang otomatis per menu terjual, dengan simple moving average untuk memproyeksikan kebutuhan bahan baku.',
    outcome:
      'Stok mengikuti tiap transaksi secara otomatis dan dashboard menghasilkan kuantitas restok dari riwayat data. Diterima dalam user testing.',
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
    return { ...category, name: 'AI & Temu Kembali Informasi' };
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
      'Tugas akhir: sistem pendukung keputusan LLM menggunakan RAG dan KG-RAG, meraih skor 4.73/5 dengan kesesuaian prosedur 92.9% dan 39/39 pengujian fungsional lulus.',
      'Penulis pertama publikasi ilmiah mengenai RAG dan KG-RAG untuk pemeliharaan aset terjelaskan, dipresentasikan di ICADEIS 2026 dan diterbitkan IEEE.',
    ],
    logoUrl: '/education/telkom-university.webp',
  },
];

export const sectionsId: SectionMeta[] = [
  { id: 'home', label: 'Beranda', index: 0 },
  { id: 'about', label: 'Tentang', index: 1, title: 'Siapa saya' },
  { id: 'skills', label: 'Keahlian', index: 2, title: 'Teknologi & Keahlian' },
  { id: 'experience', label: 'Pengalaman', index: 3, title: 'Riwayat pengalaman' },
  { id: 'projects', label: 'Proyek', index: 4, title: 'Karya terpilih' },
  { id: 'education', label: 'Pendidikan', index: 5, title: 'Pendidikan & sertifikasi' },
  { id: 'contact', label: 'Kontak', index: 6, title: 'Mari berdiskusi' },
];
