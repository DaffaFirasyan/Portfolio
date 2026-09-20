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
    downloadCv: 'View / Download CV (EN)',
    alternateCvNotice: 'Also available:',
    alternateCvLabel: 'Indonesian CV (ID)',
    alternateCvUrl: '/cv/daffa-firasyan-cv-id.pdf',

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
    copyEmail: 'Copy email',
    emailCopied: 'Copied!',
    chatOnWhatsApp: 'Chat on WhatsApp',
  },
  id: {
    // Navigation & Global
    skipToContent: 'Lewati ke konten',
    menu: 'Menu',
    cv: 'CV',
    builtWith: 'Dibuat dengan React',

    // Hero
    openToWork: 'Terbuka untuk peluang baru',
    notLooking: 'Sedang tidak mencari peluang baru',
    viewProjects: 'Lihat proyek',
    downloadCv: 'Lihat / Unduh CV (ID)',
    alternateCvNotice: 'Tersedia juga:',
    alternateCvLabel: 'English Resume (EN)',
    alternateCvUrl: '/cv/daffa-firasyan-cv-en.pdf',

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
    viewCaseStudy: 'Lihat detail proyek',
    problem: 'Tantangan',
    solution: 'Solusi',
    outcome: 'Dampak',
    stack: 'Teknologi',
    liveSite: 'Kunjungi situs',
    sourceCode: 'Kode sumber',
    repository: 'Repositori',
    liveDemo: 'Demo langsung',
    close: 'Tutup',

    // Education & Certificates
    certificatesHeading: 'Sertifikat',
    verifiedScan: 'Sertifikat terverifikasi',
    verifyCredential: 'Verifikasi kredensial',
    previous: 'Sebelumnya',
    next: 'Berikutnya',
    previousCertAria: 'Sertifikat sebelumnya',
    nextCertAria: 'Sertifikat berikutnya',
    scanError: (issuer: string) =>
      `Gambar sertifikat tidak dapat dimuat. Diterbitkan oleh ${issuer}.`,
    gpaLabel: 'IPK',
    catProfessional: 'Sertifikasi profesional',
    catCourse: 'Kursus',
    catWorkshop: 'Workshop',
    catCompetition: 'Kompetisi',
    catBootcamp: 'Bootcamp',

    // Contact
    fastestWay:
      'Cara paling cepat menghubungi saya adalah melalui email. Saya rutin membaca pesan masuk dan siap berdiskusi lebih lanjut.',
    directEmailNotice:
      'Jika Anda lebih nyaman tanpa formulir, silakan kirim email langsung ke alamat di bawah ini.',
    socialLinks: 'Media sosial & profil',
    nameLabel: 'Nama',
    emailLabel: 'Email',
    messageLabel: 'Pesan',
    sendButton: 'Kirim pesan',
    sendingButton: 'Mengirim…',
    sentMessage:
      'Terima kasih — pesan Anda sudah terkirim. Saya akan membalasnya sesegera mungkin, biasanya dalam 1–2 hari kerja.',
    sendAnother: 'Kirim pesan lainnya',
    emailDirectly: 'Kirim email langsung',
    copyEmail: 'Salin email',
    emailCopied: 'Tersalin!',
    chatOnWhatsApp: 'Chat via WhatsApp',
  },
} as const;

export type Dictionary = {
  [K in keyof typeof DICTIONARY.en]: (typeof DICTIONARY.en)[K] extends (...args: infer P) => string
    ? (...args: P) => string
    : string;
};

export type DictionaryKey = keyof Dictionary;

