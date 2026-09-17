export type Language = 'en' | 'id';

export const DICTIONARY = {
  en: {
    // Navigation & Global
    skipToContent: 'Skip to content',
    menu: 'Menu',
    cv: 'CV',
    builtWith: 'Built with React',

    // Hero
    openToWork: 'Open to work',
    notLooking: 'Not looking right now',
    viewProjects: 'View projects',
    downloadCv: 'Download CV',

    // About
    publishedResearch: 'Published research',
    venue: 'Venue',
    publishedIn: 'Published in',
    location: 'Location',
    status: 'Status',

    // Experience
    present: 'Present',

    // Projects
    all: 'All',
    noProjectsYet: (cat: string) => `No projects in ${cat} yet.`,
    showAllProjects: 'Show all projects',
    viewCaseStudy: 'View case study',
    problem: 'Problem',
    solution: 'Solution',
    outcome: 'Outcome',
    stack: 'Stack',
    liveSite: 'Live site',
    sourceCode: 'Source code',
    repository: 'Repository',
    liveDemo: 'Live demo',
    close: 'Close',

    // Education & Certificates
    certificatesHeading: 'Certificates',
    verifiedScan: 'Verified certificate scan',
    verifyCredential: 'Verify credential',
    previous: 'Previous',
    next: 'Next',
    previousCertAria: 'Previous certificate',
    nextCertAria: 'Next certificate',
    scanError: (issuer: string) =>
      `The scan of this certificate could not be loaded. It was issued by ${issuer}.`,
    gpaLabel: 'GPA',
    catProfessional: 'Professional certifications',
    catCourse: 'Courses',
    catWorkshop: 'Workshops',
    catCompetition: 'Competitions',
    catBootcamp: 'Bootcamps',

    // Contact
    fastestWay:
      'The fastest way to reach me is email. I read everything and reply to anything specific.',
    directEmailNotice: 'If you would rather not use the form, the address is right here.',
    socialLinks: 'Social links',
    nameLabel: 'Name',
    emailLabel: 'Email',
    messageLabel: 'Message',
    sendButton: 'Send message',
    sendingButton: 'Sending…',
    sentMessage:
      'Thanks — your message is on its way. I reply to anything specific, usually within a couple of days.',
    sendAnother: 'Send another message',
    emailDirectly: 'Email me directly instead',
  },
  id: {
    // Navigation & Global
    skipToContent: 'Lewati ke konten',
    menu: 'Menu',
    cv: 'CV',
    builtWith: 'Dibuat dengan React',

    // Hero
    openToWork: 'Terbuka untuk kerja',
    notLooking: 'Sedang tidak mencari kerja',
    viewProjects: 'Lihat proyek',
    downloadCv: 'Unduh CV',

    // About
    publishedResearch: 'Publikasi Ilmiah',
    venue: 'Konferensi',
    publishedIn: 'Diterbitkan oleh',
    location: 'Lokasi',
    status: 'Status',

    // Experience
    present: 'Sekarang',

    // Projects
    all: 'Semua',
    noProjectsYet: (cat: string) => `Belum ada proyek di kategori ${cat} saat ini.`,
    showAllProjects: 'Tampilkan semua proyek',
    viewCaseStudy: 'Lihat studi kasus',
    problem: 'Masalah',
    solution: 'Solusi',
    outcome: 'Hasil',
    stack: 'Teknologi',
    liveSite: 'Kunjungi situs',
    sourceCode: 'Kode sumber',
    repository: 'Repositori',
    liveDemo: 'Demo langsung',
    close: 'Tutup',

    // Education & Certificates
    certificatesHeading: 'Sertifikat',
    verifiedScan: 'Scan sertifikat terverifikasi',
    verifyCredential: 'Verifikasi kredensial',
    previous: 'Sebelumnya',
    next: 'Berikutnya',
    previousCertAria: 'Sertifikat sebelumnya',
    nextCertAria: 'Sertifikat berikutnya',
    scanError: (issuer: string) =>
      `Scan sertifikat ini tidak dapat dimuat. Diterbitkan oleh ${issuer}.`,
    gpaLabel: 'IPK',
    catProfessional: 'Sertifikasi profesional',
    catCourse: 'Kursus',
    catWorkshop: 'Pelatihan',
    catCompetition: 'Kompetisi',
    catBootcamp: 'Bootcamp',

    // Contact
    fastestWay:
      'Cara tercepat menghubungi saya adalah melalui email. Saya membaca setiap pesan dan membalas pesan yang spesifik.',
    directEmailNotice:
      'Jika Anda memilih untuk tidak menggunakan formulir, alamat email tertera langsung di sini.',
    socialLinks: 'Tautan sosial',
    nameLabel: 'Nama',
    emailLabel: 'Email',
    messageLabel: 'Pesan',
    sendButton: 'Kirim pesan',
    sendingButton: 'Mengirim…',
    sentMessage:
      'Terima kasih — pesan Anda sedang dikirim. Saya membalas setiap pesan spesifik, biasanya dalam 1-2 hari kerja.',
    sendAnother: 'Kirim pesan lainnya',
    emailDirectly: 'Kirim email langsung kepada saya',
  },
} as const;

export type Dictionary = {
  [K in keyof typeof DICTIONARY.en]: (typeof DICTIONARY.en)[K] extends (...args: infer P) => string
    ? (...args: P) => string
    : string;
};

export type DictionaryKey = keyof Dictionary;

