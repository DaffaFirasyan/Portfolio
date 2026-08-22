# Konten asli — daftar lengkap yang dibutuhkan

Semua angka di dokumen ini diambil dari kode, bukan perkiraan: batas karakter dari
`src/data/constraints.ts`, ukuran gambar dari `scripts/generate-placeholders.mjs`,
daftar nilai yang sah dari `src/types/index.ts`.

**Aturan yang dijaga proyek ini:** mengganti konten hanya menyentuh `src/data/` dan
`public/`. Tidak ada satu pun komponen yang perlu diubah. Kalau Anda merasa perlu
mengubah komponen untuk memasukkan konten, berarti ada yang salah — beri tahu.

Taruh bahan mentah Anda di `Konten_Asli/` (teks, foto, scan). Isinya nanti
dipindahkan ke `src/data/` dan `public/`; folder itu sendiri tidak dibaca aplikasi.

---

## Bagian 1 — Teks

### 1.1 Profil (`src/data/profile.ts`)

| Field | Isi | Batas |
|---|---|---|
| `name` | Nama lengkap | — |
| `shortName` | Nama untuk logo navbar | — |
| `roles` | Jabatan yang berputar di hero | **maks 4 item, tiap item ≤ 28 karakter** |
| `tagline` | Satu kalimat di bawah nama | **≤ 120 karakter** |
| `bio` | Paragraf untuk section About | **maks 4 paragraf, tiap paragraf ≤ 420 karakter** |
| `location` | Kota, Negara | — |
| `email` | Email yang benar-benar Anda baca | — |
| `openToWork` | `true` / `false` | — |
| `socials` | Daftar `{ label, url, icon }` | — |
| `stats` | Daftar `{ label, value, suffix? }` — angka yang menghitung naik di hero | `value` harus angka |

### 1.2 Skills (`src/data/skills.ts`)

**3 sampai 4 kategori**, masing-masing berisi daftar skill.

| Field | Isi | Batas |
|---|---|---|
| `name` (kategori) | Misal "Languages & Frameworks" | — |
| `name` (skill) | Nama skill | **≤ 22 karakter** — di atas itu barisnya wrap |
| `icon` | Salah satu kata kunci di bawah | wajib dari daftar |
| `level` | `basic` / `intermediate` / `advanced` | opsional, saat ini tidak ditampilkan |
| `relatedProjectIds` | `id` project yang memakai skill ini | harus cocok dengan id di `projects.ts` |

**Nilai `icon` yang tersedia** (hanya ini yang akan dirender):
`code` · `component` · `layers` · `server` · `database` · `brain` · `search` ·
`share-2` · `chart` · `eye` · `box` · `git-branch` · `triangle` · `pen` ·
`wrench` · `flask`

`relatedProjectIds` adalah yang membuat efek sorot silang bekerja: arahkan kursor ke
sebuah skill, project yang memakainya tetap terang dan sisanya meredup. Kosongkan
kalau memang tidak ada.

### 1.3 Projects (`src/data/projects.ts`)

**Minimal 4, maksimal 9 project. Maksimal 3 boleh `featured: true`.**

| Field | Isi | Batas |
|---|---|---|
| `id` | Slug unik, huruf kecil dan tanda hubung | dipakai `relatedProjectIds` |
| `title` | Judul project | **≤ 48 karakter** |
| `category` | Misal "AI/ML", "Web", "Data" | jadi tombol filter otomatis |
| `year` | Tahun, angka | — |
| `role` | Peran Anda, misal "Solo" atau "Tim 4 — backend" | **≤ 40 karakter** |
| `problem` | Masalah yang dipecahkan | **≤ 180 karakter** |
| `solution` | Cara Anda memecahkannya | **≤ 180 karakter** |
| `outcome` | Hasil terukur — angka kalau ada | **≤ 140 karakter** |
| `stack` | Teknologi yang dipakai | **maks 6 item** |
| `links` | `{ demo?, repo?, paper?, video? }` | hilangkan yang tidak ada, jangan diisi `#` |

Tautan yang tidak ada **dihilangkan saja** — komponennya tidak akan merender tombol
mati. Jangan diisi placeholder.

### 1.4 Experience (`src/data/experiences.ts`)

| Field | Isi | Batas |
|---|---|---|
| `id` | Slug unik | — |
| `role` | Jabatan | **≤ 48 karakter** |
| `organization` | Nama instansi | **≤ 40 karakter** |
| `type` | `work` `internship` `organization` `freelance` `volunteer` `research` | wajib salah satu |
| `location` | Kota | opsional |
| `startDate` | Format **`YYYY-MM`**, contoh `2025-06` | wajib format ini |
| `endDate` | `YYYY-MM` atau kata `present` | — |
| `summary` | Satu kalimat ringkas | **≤ 140 karakter** |
| `highlights` | Poin pencapaian | **maks 4 poin, tiap poin ≤ 160 karakter** |
| `stack` | Teknologi | opsional |

**Section ini hanya untuk pengalaman kerja.** Tiga peran organisasi kampus
dihapus pada 2026-08-22 atas keputusan Anda — judul sectionnya "Where I have
worked", dan staf media, rekrutmen serta hubungan eksternal bukan itu. Rekam
lengkapnya tetap ada di CV yang bisa diunduh dari halaman; portfolio adalah
versi terkurasi, CV yang versi utuh. Nilai `organization`, `volunteer`,
`freelance` dan `research` pada `type` masih tersedia kalau suatu saat
dibutuhkan.

### 1.5 Education (`src/data/education.ts`)

| Field | Isi | Batas |
|---|---|---|
| `institution` `degree` `field` | Kampus, jenjang, jurusan | — |
| `startYear` `endYear` | Angka, atau `present` untuk endYear | — |
| `gpa` | Sebagai teks, misal `"3.72 / 4.00"` | opsional |
| `highlights` | Pencapaian akademik | **maks 3 poin, tiap poin ≤ 160 karakter** |

### 1.6 Certificates (`src/data/certificates.ts`)

| Field | Isi | Batas |
|---|---|---|
| `id` | Slug unik | jadi nama file gambar |
| `title` | Nama sertifikat | **≤ 72 karakter** |
| `issuer` | Penerbit | **≤ 40 karakter** |
| `credentialUrl` | Link verifikasi resmi | opsional, tapi menaikkan kredibilitas |
| `category` | `course` `competition` `workshop` `professional` `bootcamp` | wajib salah satu |
| `skills` | Skill dari sertifikat itu | **maks 4 item** |

**Sertifikat tidak punya field tanggal sama sekali** — `issueDate` dan
`expiryDate` dihapus dari tipe `Certificate` pada 2026-08-22 atas keputusan
Anda. Alasannya: setiap scan sudah mencantumkan tanggalnya sendiri dan lightbox
menampilkan scan itu ukuran penuh, jadi caption bertanggal hanya mengulang isi
gambar — dan tujuh dari empat belas masih placeholder yang akan tampil sebagai
informasi salah tepat di bawah scan yang membantahnya. Tidak ada yang mengurut
berdasarkan tanggal; dinding sertifikat dikelompokkan per `category` dan
mengikuti urutan array.

### 1.6b Publikasi (`profile.publication`, opsional)

| Field | Isi | Catatan |
|---|---|---|
| `title` | Judul paper lengkap | ambil dari Crossref, bukan dari CV |
| `authors` | Semua penulis, urut publikasi | Anda harus jadi nama pertama — dijaga invariant |
| `venue` | Bentuk pendek, misal `ICADEIS 2026` | yang dibaca sekilas |
| `venueFull` | Nama konferensi lengkap | untuk sitasi |
| `publisher` | Misal `IEEE Xplore` | — |
| `doi` | DOI polos, **tanpa** `https://doi.org/` | dijaga format `10.xxxx/...` |
| `url` | Harus persis `https://doi.org/<doi>` | dijaga invariant |
| `year` | Tahun terbit | — |

Kalau field ini tidak ada, kartunya tidak dirender sama sekali — About tetap
jalan tanpa publikasi. Untuk mengambil metadata resmi:
`https://api.crossref.org/works/<doi>`. **IEEE Xplore menolak fetch otomatis**,
jadi jangan ambil dari sana.

### 1.7 Site (`src/data/site.ts`)

`url` (origin saja, tanpa garis miring di akhir), `title`, `description`,
`ogImage`, `ogImageAlt`. Isi `url` setelah domain final ditentukan.

---

## Bagian 2 — File dan gambar

Semua masuk ke `public/`. **Ukuran piksel harus persis** — setiap `<img>` di
halaman menuliskan `width`/`height`-nya untuk mencegah layout melompat, jadi rasio
yang berbeda akan terlihat gepeng.

| Yang dibutuhkan | Ukuran | Format | Jumlah | Lokasi |
|---|---|---|---|---|
| **Foto profil** | **800 × 800** | **WebP, latar transparan** | 1 | `public/profile/` |
| Thumbnail project | **800 × 500** | WebP | 1 per project | `public/projects/` |
| Gambar detail project | 1600 × 1000 | WebP | opsional | `public/projects/` |
| **Scan sertifikat** | **1400 × 1000** | WebP | 1 per sertifikat | `public/certificates/` |
| **Thumbnail sertifikat** | **600 × 420** | WebP | 1 per sertifikat | `public/certificates/` |
| Logo kampus | 256 × 256 | WebP | opsional | `public/education/` |
| Logo tempat kerja | 256 × 256 | WebP | opsional | `public/experience/` |
| **Gambar OG** | **1200 × 630** | **JPG**, bukan WebP | 1 | `public/og/` |
| **CV** | — | **PDF** | 1 | `public/cv/` |

### Foto profil harus dipotong latarnya

Ini bukan preferensi. `ProfileCard` di hero menempelkan foto ke dasar kartu dan
membiarkan gradiennya terlihat di sekelilingnya. Foto persegi berlatar solid akan
tampil sebagai kotak tertempel dengan garis sambungan yang jelas melintang di
kartu. **PNG/WebP dengan latar transparan**, subjek dipotong rapi.

### Gambar OG wajib JPG

Beberapa scraper media sosial masih menolak WebP. Ini satu-satunya gambar yang
formatnya berbeda dari yang lain.

---

## Bagian 3 — Privasi sertifikat (wajib, sebelum upload)

Spec §5 dan PRD §6.1 mensyaratkan hal berikut **ditutup** pada setiap scan sebelum
masuk ke `public/`:

- Nomor induk / NIM / nomor identitas
- Tanggal lahir
- Tanda tangan basah
- **QR code yang memuat data pribadi**

QR paling sering terlewat. Kode itu bisa memuat nomor identitas atau URL berisi
data pribadi Anda, dan siapa pun bisa memindainya dari halaman portfolio Anda.

**Ini diperiksa manual, bukan oleh tes.** Tidak ada satu pun test suite yang akan
menahan Anda kalau lupa. Periksa setiap file satu per satu sebelum deploy.

---

## Bagian 4 — Setelah semuanya siap

```bash
npm test
```

**Sebagian test akan gagal, dan sebagian dari kegagalan itu wajar.** Proyek ini
punya "aturan stress": beberapa field wajib mendekati 90% dari batasnya, supaya
layout teruji pada konten terpanjang. Aturan itu ada untuk konten placeholder.

Yang berlaku pada: `project.title`, `project.problem`, jumlah `stack`,
`profile.tagline`, `profile.role`, `profile.bioParagraph`, `experience.role`,
`experience.organization`, `certificate.title`, `certificate.issuer`.

Kalau konten asli Anda lebih pendek — misalnya penerbit sertifikat bernama
"Coursera" yang tidak mungkin dipanjangkan jadi 36 karakter — **assertion-nya
dihapus, bukan konten yang dipaksa panjang**. Aturan yang sama sudah dihapus untuk
`skill.name` ketika Anda memasukkan "RAG". Beri tahu saya yang mana yang gagal,
saya bereskan.

Yang **tidak boleh** gagal dan harus diperbaiki isinya:
- batas karakter terlampaui
- `relatedProjectIds` menunjuk id project yang tidak ada
- file gambar yang disebut data tidak ada di `public/`
- format tanggal bukan `YYYY-MM` (berlaku untuk `experiences`; sertifikat sudah
  tidak punya tanggal)

Lalu:

```bash
npm run lint && npm run build
```

Dan ukur ulang Lighthouse — 14 scan sertifikat plus 8 thumbnail akan menggantikan
placeholder yang sekarang hanya beberapa KB warna datar. Itu perubahan besar bagi
skor performa, dan angka sekarang (Performance 81 mobile) tidak akan bertahan
tanpa gambar yang dikompres benar.

---

## Ringkasan jumlah file gambar

Dengan asumsi 6 project dan 12 sertifikat:

| | Jumlah |
|---|---|
| Foto profil | 1 |
| Thumbnail project | 6 |
| Scan sertifikat | 12 |
| Thumbnail sertifikat | 12 |
| Gambar OG | 1 |
| CV | 1 |
| **Total** | **33 file** |

Thumbnail sertifikat adalah versi kecil dari scan yang sama — bukan gambar berbeda.
