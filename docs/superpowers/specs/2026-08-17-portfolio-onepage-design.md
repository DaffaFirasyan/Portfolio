# Portfolio One-Page — Design Spec

**Tanggal:** 2026-08-17
**Status:** Disetujui, siap masuk perencanaan implementasi
**Sumber:** PRD "Website Portfolio One-Page + React Bits" (dokumen terpisah, diperlakukan sebagai spec produk)

Dokumen ini bukan pengganti PRD. PRD memegang tujuan produk, arah desain, dan spesifikasi tiap section. Dokumen ini memegang keputusan teknis yang PRD tinggalkan terbuka, resolusi kontradiksi di dalamnya, dan arsitektur yang membuat keputusan-keputusan itu bisa dijalankan.

---

## 1. Konteks

Website portfolio satu halaman, scroll-based, tanpa backend. Audiens utama recruiter yang memindai 30–60 detik; audiens sekunder engineer yang menggali detail. Repositori dimulai kosong pada 2026-08-17.

---

## 2. Keputusan Terkunci

Keputusan berikut menutup pilihan yang PRD sengaja biarkan terbuka. Semuanya sudah disepakati dan tidak dibuka lagi tanpa alasan baru.

| # | Topik | Keputusan | Menutup |
|---|---|---|---|
| D1 | Stack | Vite + React 19 + TypeScript + Tailwind v4, GSAP + Motion, Lenis, lucide-react, `ogl` | PRD §2.1 (opsi Next.js tidak diambil) |
| D2 | Bahasa situs | **English**, konsisten di seluruh halaman | PRD §3.5 |
| D3 | Urutan section | Sesuai PRD §4.1 apa adanya — Projects sebelum Education | PRD §4.1 |
| D4 | Strategi konten | **Skeleton-first**: data bertipe ketat berisi konten contoh realistis, konten asli menyusul | — |
| D5 | Slot WebGL hero | `Galaxy` sebagai latar. Foto memakai `TiltedCard` (CSS transform). **`Lanyard` dibatalkan** | PRD §7.1 vs §9.1 |
| D6 | Navigasi | `PillNav` di Fase 2 → dinaikkan ke Section-Node Navigator di Fase 9 | PRD §3.4 |
| D7 | Rasio sertifikat | Thumbnail 600×420 (10:7) letterbox. Versi penuh mengikuti rasio asli | PRD §6.1 |

### 2.1 Alasan D5

PRD §7.1 menugaskan `Galaxy` sebagai latar hero *dan* `Lanyard` sebagai visual foto. §8.2 mengklasifikasikan keduanya WebGL berat, sementara §9.1 membatasi maksimal satu komponen WebGL aktif bersamaan. Lebih jauh, `Galaxy` memakai `ogl` (~25 KB gzip) sedangkan `Lanyard` memakai `three` + physics (~150 KB+ gzip) — dua engine 3D sekaligus, terhadap target bundle awal < 250 KB gzip di §1.2. Keduanya tidak bisa hidup bersama. `Galaxy` dipertahankan karena ia melayani seluruh hero, bukan satu elemen.

**Konsekuensi:** `three` tidak pernah masuk `package.json`. Semua komponen React Bits berbasis `three` gugur otomatis (lihat §9).

### 2.2 Alasan D6

Section-Node Navigator (PRD §3.4) tetap jadi tujuan — ia satu-satunya tempat PRD mengalokasikan keberanian visual, dan ia sekaligus menggantikan progress bar generik. Tapi ia custom code tanpa padanan di React Bits, dan paling rawan pecah di lebar tablet. Membangunnya di hari pertama berarti menghabiskan waktu pada SVG rail sementara `data/*.ts` masih skeleton.

`PillNav` dipasang lebih dulu supaya navigasi berfungsi penuh sepanjang pembangunan, lalu diganti setelah konten asli masuk. Ini hanya aman kalau navigasi dirancang sebagai sambungan yang bisa dilepas sejak awal — lihat §3.1.

### 2.3 Alasan D7

PRD §6.1 menyuruh normalisasi ke "4:3" tapi menetapkan thumbnail 600×420, yang sebenarnya 10:7. Angka ini menentukan `width`/`height` eksplisit yang dipakai mencegah CLS (§6.2), jadi hanya boleh ada satu.

- **Thumbnail 600×420, tetap.** Gambar dikecilkan agar muat, sisanya diisi padding `--bg-surface` (*letterbox*). Tidak pernah di-crop — §6.1 "jangan crop isi" tetap dipatuhi.
- **Versi penuh mengikuti rasio asli.** Aturan §6.1 lainnya tetap: sisi terpanjang maksimal 1600px, target < 250 KB. Hanya diperkecil bila lebih besar; tidak diperbesar, tidak di-crop, tidak diberi padding.
- **Lightbox menyerap variasi rasio**, bukan data. Kotak tetap `max-w-[90vw] max-h-[90vh]` dengan `object-fit: contain`. Karena itu `Certificate` tidak menyimpan dimensi intrinsik.

Sebutan "4:3" di PRD §6.1 dinyatakan digantikan.

Perintah pembuatan thumbnail:

```bash
for f in *.jpg; do magick "$f" -resize 600x420 -background "#12161D" -gravity center -extent 600x420 -quality 80 "thumb-${f%.*}.webp"; done
```

---

## 3. Arsitektur

Prinsip tunggal: **file section tidak pernah meng-import React Bits.** Seluruh kontak dengan React Bits diisolasi ke dua sambungan.

### 3.1 Sambungan 1 — Navigasi

Satu kontrak, dua implementasi yang bisa ditukar.

```ts
// types/index.ts
export interface SectionMeta {
  id: string;      // "home", "about", …  — sama dengan anchor
  label: string;   // "Home", "About", …
  index: number;   // 0-based, dipakai untuk eyebrow "01 / ABOUT"
}

export interface SectionNavProps {
  sections: SectionMeta[];
  activeId: string;
  progress: number;                    // 0..1 posisi scroll seluruh halaman
  onNavigate: (id: string) => void;
}
```

- `useActiveSection(sections)` memiliki `activeId` dan `progress`. IntersectionObserver dengan threshold 0.4 (PRD §7.0), plus `history.replaceState` agar URL punya anchor tanpa menambah entri history.
- `PillNavAdapter` — implementasi v1, membungkus React Bits `PillNav` + `StaggeredMenu` untuk mobile.
- `NodeRailNav` — implementasi v2 (Fase 9), SVG kustom + GSAP ScrollTrigger.

Keduanya renderer murni: menerima props, tidak memegang state scroll. Menukar B→A adalah satu baris import di `App.tsx`.

**Kriteria terima:** mengganti `PillNavAdapter` dengan `NodeRailNav` tidak menyentuh file mana pun di `sections/`, tidak mengubah `useActiveSection`, dan tidak mengubah anchor.

### 3.2 Sambungan 2 — Motion

Section meng-import dari `src/motion/`, tidak pernah dari `src/components/reactbits/`.

| Primitive | Membungkus | Saat motion mati |
|---|---|---|
| `<Reveal>` | `AnimatedContent` | `<div>` biasa |
| `<Heading>` | `SplitText` (mount) / `ScrollFloat` (scroll) | `<h2>`/`<h3>` biasa |
| `<Surface>` | `SpotlightCard` | kartu statis berborder `--edge` |
| `<Backdrop>` | `Galaxy`, lazy | gradien statis |

```ts
// hooks/useMotionAllowed.ts
export interface MotionCapability {
  animate: boolean;  // !prefers-reduced-motion
  hover: boolean;    // (hover: hover) and (pointer: fine)
  webgl: boolean;    // animate && !saveData && bukan perangkat lemah
}
```

`webgl` bernilai false bila `navigator.connection.saveData`, atau `deviceMemory < 4`, atau `hardwareConcurrency <= 4`. Ini menyaring mayoritas ponsel kelas bawah tanpa memblokir ponsel modern.

**Kenapa dipusatkan:** PRD §1.2 menuntut reduced-motion dihormati 100%. Kalau gating disebar ke tujuh section, satu pasti terlewat. Di sini ia struktural. Efek keduanya, §8.3 melarang mencampur bahasa visual — dengan satu `<Surface>`, tidak mungkin satu section diam-diam memakai bahasa hover berbeda.

`<Backdrop>` adalah satu-satunya pemegang siklus hidup WebGL: lazy `import()` untuk `ogl`, unmount saat keluar viewport lewat IntersectionObserver (PRD §9.3 — `display: none` tidak cukup, canvas tersembunyi tetap merender), dan tidak pernah mount bila `webgl` false. Tidak ada canvas kedua di halaman ini.

**Penegakan:** aturan ESLint `no-restricted-imports` melarang pola `**/components/reactbits/**` di dalam `src/sections/**`. Pelanggaran gagal di CI, bukan bergantung pada ingatan.

### 3.3 Struktur File

Mengikuti PRD §4.2, dengan tiga penyesuaian: `src/motion/` sebagai lapisan primitive, `src/nav/` untuk kontrak navigasi beserta kedua implementasinya, dan `components/reactbits/` tetap persis seperti hasil `jsrepo` tanpa diubah strukturnya.

```
src/
├── data/          profile, skills, experiences, projects, education, certificates
├── types/         index.ts
├── motion/        Reveal, Heading, Surface, Backdrop
├── nav/           SectionNavProps, PillNavAdapter, NodeRailNav
├── sections/      Hero, About, Skills, Experience, Projects, Education, Contact
├── components/
│   ├── layout/    SectionShell, Footer
│   ├── ui/        ProjectCard, CertificateCard, TimelineItem, SkillChip, Lightbox
│   └── reactbits/ hasil jsrepo — jangan diubah
├── hooks/         useActiveSection, useMotionAllowed, useLenis
└── lib/           utils
```

`SectionShell` membungkus semua section sehingga eyebrow mono, nomor section, judul display, dan jarak vertikal konsisten. Ia yang membuat halaman terasa dirancang, bukan ditumpuk.

---

## 4. Lapisan Data

Aliran satu arah: `src/data/*.ts` → section → primitive motion. Tidak ada teks hardcoded di komponen. Konsekuensi yang bisa diuji: mengganti konten skeleton menjadi konten asli hanya menyentuh `data/`.

Bentuk tipe mengikuti PRD §5 apa adanya, ditambah `SectionMeta` dan `SectionNavProps` di §3.1.

### 4.1 Skeleton Ditulis di Batas Maksimum

Bahaya skeleton-first bukan datanya palsu — tapi layout diam-diam disetel pas untuk data yang kebetulan pendek, lalu pecah saat konten asli masuk. Karena itu data contoh ditulis mentok di batas, bukan di titik nyaman.

| Field | Batas | Skeleton |
|---|---|---|
| `profile.tagline` | 120 karakter | ~118 |
| `profile.roles` | 3–4 item, ≤ 28 karakter | 4 item, satu mentok |
| `profile.bio[]` | 2–3 paragraf, ≤ 420 karakter | 3 paragraf |
| `project.title` | 48 karakter | satu judul mentok |
| `project.problem` | 180 karakter | satu mentok |
| `project.solution` | 180 karakter | satu mentok |
| `project.outcome` | 140 karakter | satu mentok |
| `project.stack` | ≤ 6 chip | satu projek pakai 6 |
| `project.role` | 40 karakter | satu mentok |
| `experience.role` | 48 karakter | satu mentok |
| `experience.organization` | 40 karakter | satu mentok |
| `experience.summary` | 140 karakter | satu mentok |
| `experience.highlights` | 2–4 item, ≤ 160 karakter | satu item 4 bullet |
| `certificate.title` | 72 karakter | satu mentok |
| `certificate.issuer` | 40 karakter | satu mentok |
| `certificate.skills` | ≤ 4 badge | satu pakai 4 |
| `education.highlights` | ≤ 3 item, ≤ 160 karakter | 3 item |
| `skill.name` | 24 karakter | satu mentok |

Jumlah record: **8 projek** (PRD §5.1 mengizinkan 4–9), **14 sertifikat** (8 tampil awal, sisanya di balik "View all"), **5 pengalaman**, **4 kategori skill**.

Kalau grid selamat di kondisi ini, konten asli hanya bisa lebih ringan. Arah sebaliknya juga diuji manual: 1 projek, 0 sertifikat, filter tanpa hasil.

**Batas aturan stress — baca sebelum menempel konten asli.** Aturan stress bekerja untuk field yang penulisnya karang sendiri: judul projek, `problem`, `tagline`, bio. Ia tidak bekerja untuk **nama diri yang datang dari luar**, yaitu `certificate.issuer` dan `experience.organization`. "Coursera" tidak bisa dipanjangkan jadi 36 karakter; itu namanya.

Saat konten asli masuk, dua bagian assertion ini kemungkinan besar gagal:

- `certificates … stresses the layout on title, issuer and skill count` — bagian `issuer`
- `experiences … stresses the layout on role, organization and highlights` — bagian `organization`

Itu bukan tanda datanya salah. Yang benar dilakukan: **hapus dua bagian assertion tersebut**, bukan memaksa nama institusi memanjang dan bukan menurunkan plafonnya. Plafon 40 tetap berguna — ia menjamin layout selamat kalau memang ada penerbit sepanjang itu. Yang gugur hanya kewajiban membuktikannya lewat data contoh.

### 4.2 Invarian Dijaga Tes, Bukan Runtime

Validator runtime seperti Zod menambah beban bundle untuk data yang sepenuhnya statis — tidak sepadan dengan target §1.2. Diganti satu suite Vitest yang gagal keras bila:

1. Ada field melewati batas panjang atau batas jumlah di §4.1.
2. `Skill.relatedProjectIds` menunjuk `Project.id` yang tidak ada. *(Tanpa ini, cross-highlight PRD §7.3 mati diam-diam.)*
3. Ada projek dengan `problem` atau `outcome` kosong. *(PRD §5.1 mewajibkan keduanya.)*
4. Jumlah `featured: true` melebihi 3.
5. `id` tidak unik dalam satu koleksi.
6. Ada kunci di `project.links` yang ada tapi bernilai string kosong atau bukan URL valid.
7. `credentialUrl` ada tapi tidak valid. *(PRD §7.6: link verifikasi berfungsi atau tidak ditampilkan sama sekali.)*
8. Format tanggal bukan `YYYY-MM`, atau `endDate` lebih awal dari `startDate`.
9. Jumlah projek di luar rentang 4–9.
10. Ada `thumbnail`, `imageUrl`, atau `thumbnailUrl` yang menunjuk berkas yang tidak ada di `public/`.

Biayanya nol di produksi, dan ia menjadi jaring pengaman saat konten asli ditempel nanti.

---

## 5. Aset

Mengikuti PRD §6, dengan D7 menggantikan aturan rasio sertifikat.

| Aset | Dimensi | Target ukuran |
|---|---|---|
| Foto profil | 800×800, **latar dihapus, PNG/WebP beralfa** | < 150 KB |
| Thumbnail projek | 800×500 (16:10), tetap | < 120 KB |
| Thumbnail sertifikat | 600×420 (10:7), letterbox | < 60 KB |
| Sertifikat penuh | rasio asli, sisi terpanjang ≤ 1600px | < 250 KB |
| OG image | 1200×630 | < 300 KB |
| CV | PDF | < 2 MB |

Semua WebP dengan fallback JPG, `loading="lazy"` kecuali elemen LCP, `decoding="async"`, `width`/`height` eksplisit di JSX.

Skeleton memakai gambar placeholder pada dimensi persis di atas, supaya perilaku CLS yang terukur sekarang adalah perilaku yang asli nanti.

**Foto profil harus dipotong dari latarnya.** `ProfileCard` di hero menambatkan foto ke dasar kartu dan membiarkan gradiennya terlihat di sekeliling — foto persegi berlatar utuh terbaca sebagai kotak yang ditempel, dengan garis sambung melintang di tengah kartu. Ditemukan 2026-08-18 dari tangkapan layar pemilik. Placeholder-nya kini siluet transparan supaya bentuk yang salah ketahuan saat pengembangan, bukan setelah deploy.

**Privasi:** nomor induk, tanggal lahir, tanda tangan basah, dan QR yang memuat data pribadi ditutup sebelum sertifikat diunggah (PRD §6.1). Ini diperiksa manual sebelum Fase 10, bukan oleh tes.

---

## 6. Section

Spesifikasi tiap section mengikuti PRD §7 apa adanya, dengan komponen "pilihan A"/primer diambil dan alternatifnya tidak dibangun:

| Section | Komponen inti |
|---|---|
| Navbar | `PillNav` + `StaggeredMenu` (mobile) + `StarBorder` (CTA CV) → `NodeRailNav` di Fase 9 |
| Hero | `Galaxy`, `SplitText`, `RotatingText`, `BlurText`, `ShinyText`, `CountUp`, `LogoLoop`, `TiltedCard`, `Noise` |
| About | `ScrollReveal`, `SpotlightCard`, `TiltedCard`, `GlareHover`, `CountUp`, `Magnet` |
| Skills | `MagicBento`, `LogoLoop`, `GlassIcons`, `Magnet`, `AnimatedList` |
| Experience | Timeline vertikal kustom satu sisi + `AnimatedContent`, `SpotlightCard`, `ElectricBorder` (item terkini), `CountUp` |
| Projects | `Masonry`, `SpotlightCard`, `PixelTransition`, `AnimatedContent` |
| Education | `Masonry` (desktop) / `Stack` (mobile), `SpotlightCard`, `TiltedCard`, `GlareHover`, `CountUp`, `Folder` |
| Contact | `TextType`, `GlassIcons`, `StarBorder`, `Magnet`, `ClickSpark`, `CircularText` |
| Footer | `CurvedLoop`, `Squares` |
| Global | `AnimatedContent`, `Noise`, `TargetCursor` (desktop saja) |

Timeline Experience selalu satu sisi, termasuk di desktop. Pola selang-seling dua sisi rutin berantakan di lebar tablet dan tidak membayar kompleksitasnya.

Layanan form: **Web3Forms**, dipilih karena tidak memerlukan akun berbayar untuk volume portfolio dan tidak menuntut backend.

---

## 7. Penanganan Error

| Kejadian | Perilaku |
|---|---|
| Form gagal terkirim | State error + tautan `mailto:` sebagai jalan keluar (PRD §7.7) |
| Thumbnail projek gagal dimuat | Jatuh ke kartu tipografi — nama projek + stack di atas token warna, pola yang PRD §6.2 tetapkan untuk projek tanpa UI |
| Gambar sertifikat gagal dimuat di lightbox | Tampilkan judul, penerbit, dan tombol verifikasi sebagai ganti gambar |
| `demo` / `repo` / `credentialUrl` kosong | Tombol tidak dirender sama sekali, bukan dirender mati |
| Filter tidak menghasilkan apa pun | Empty state eksplisit + tombol reset (PRD §7.5) |
| WebGL gagal dibuat atau perangkat lemah | `<Backdrop>` menjadi gradien statis, tanpa pesan error |
| Lenis gagal diinisialisasi | Halaman jatuh ke scroll native; anchor tetap berfungsi |

---

## 8. Tes

Diskalakan ke yang benar-benar membayar untuk halaman statis.

**Vitest**
- Suite invarian data (§4.2) — sepuluh aturan.
- `useActiveSection` — perilaku di batas threshold, termasuk saat scroll cepat melewati beberapa section.
- `useMotionAllowed` — matriks reduced-motion × hover × saveData × deviceMemory.

**Playwright**
- Satu alur keyboard-only: nav → modal projek → lightbox sertifikat → form. Menutupi PRD §12.4.
- Satu run dengan `prefers-reduced-motion: reduce` yang memastikan tidak ada animasi tersisa dan seluruh teks terbaca.

**Lighthouse** di Fase 9 terhadap ambang PRD §12.3 (Performance ≥ 85, A11y ≥ 95, Best Practices ≥ 95, SEO ≥ 95 pada mobile).

**Tidak dites:** tampilan animasi itu sendiri. Mahal ditulis, rapuh terhadap perubahan wajar, dan penilaian mata lebih baik untuk itu.

---

## 9. Di Luar Cakupan v1

- Semua "alternatif berani" PRD §8.1: `DomeGallery`, `FlyingPosters`, `CircularGallery`, `ScrollStack`, `CardSwap`, `InfiniteMenu`, `Antigravity`, `Lanyard`, `FluidGlass`, `ModelViewer`. Slot WebGL tunggal sudah dipakai `Galaxy` (D5), dan seluruh komponen berbasis `three` gugur karena `three` tidak dipasang.
- Kategori "sangat berat" PRD §8.2: `Ballpit`, `Hyperspeed`, `PixelBlast`, `PrismaticBurst`, `GridDistortion`, `GridScan`.
- Lebih dari satu bahasa kursor — hanya `TargetCursor`, mati total di perangkat sentuh.
- CMS, blog, i18n, toggle dark/light, backend sendiri (PRD §1.3).
- Analytics opsional, dipertimbangkan di Fase 10 saja.

---

## 10. Urutan Pembangunan

| Fase | Isi | Selesai bila |
|---|---|---|
| 0 | Vite + TS + Tailwind v4, token §3.1 PRD, font, ESLint termasuk aturan `no-restricted-imports` | Halaman kosong berlatar `--bg-void`, font termuat, lint jalan |
| 1 | `types/` + `data/` skeleton di batas maksimum + suite invarian + `SectionShell` + 7 section statis | Scroll penuh, semua konten terbaca, suite invarian hijau |
| 2 | `useActiveSection` + kontrak `SectionNavProps` + `PillNavAdapter` + `StaggeredMenu` + Lenis | Semua anchor tepat, active state akurat, diuji di 375px |
| 3 | `src/motion/` primitives + Hero | Urutan masuk hero berurutan ≤ 1.2s, bukan serentak |
| 4 | `<Backdrop>` + `Galaxy` lazy/unmount | FPS stabil, canvas benar-benar unmount saat hero keluar viewport |
| 5 | About + Skills | Cross-highlight skill→projek bekerja tanpa layout shift |
| 6 | Projects — grid, filter, modal | Semua tautan hidup, modal bisa dioperasikan penuh dari keyboard |
| 7 | Experience + Education & Certificates + lightbox | Garis timeline terisi saat scroll, lightbox navigasi keyboard |
| 8 | Contact + form Web3Forms | Kirim uji coba benar-benar diterima, tiga state tampil benar |
| 9 | `NodeRailNav` + a11y, perf, meta, OG, JSON-LD | Ambang PRD §12.3 dan §12.4 terpenuhi |
| 10 | Deploy Vercel + domain | Dibuka di ponsel orang lain, dicoba dua orang |

Fase 3 mendahulukan primitives sebelum section pertama yang memakainya. Kalau dibalik, Hero akan meng-import React Bits langsung dan sambungan §3.2 bocor sejak hari pertama.

---

## 11. Kriteria Terima Arsitektural

Di luar checklist PRD §12, tiga hal berikut menguji apakah keputusan di dokumen ini benar-benar terwujud:

1. **Menukar navigasi** dari `PillNavAdapter` ke `NodeRailNav` hanya mengubah satu baris import di `App.tsx`.
2. **Tidak ada file di `src/sections/`** yang meng-import dari `src/components/reactbits/`. Ditegakkan ESLint, gagal di CI.
3. **Mengganti konten skeleton dengan konten asli** hanya menyentuh `src/data/` dan berkas di `public/`. Tidak ada satu pun komponen yang berubah.
