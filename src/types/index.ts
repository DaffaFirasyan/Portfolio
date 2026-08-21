export interface SectionMeta {
  id: string;
  label: string;
  index: number;
  /**
   * Heading rendered inside the section. Absent for the hero, which carries
   * the page's h1 rather than a numbered section header.
   */
  title?: string;
}

export interface SectionNavProps {
  sections: SectionMeta[];
  activeId: string;
  progress: number;
  onNavigate: (id: string) => void;
}

export interface SocialLink {
  label: string;
  url: string;
  icon: string;
}

export interface Stat {
  label: string;
  value: number;
  suffix?: string;
}

/**
 * A peer-reviewed paper, shown in About.
 *
 * `authors` is in publication order and is not decoration: printing a paper
 * without its co-authors implies sole authorship, and an invariant asserts the
 * profile's owner is the first name rather than merely present.
 *
 * `venue` is the short form a reader scans ("ICADEIS 2026") and `venueFull` the
 * registered proceedings title, which runs past a hundred characters. Both are
 * kept because the card shows one and the citation needs the other.
 *
 * The link is the DOI resolver, not the publisher's document URL. A DOI is the
 * persistent identifier — it survives the publisher reorganising their site,
 * which a `/document/11644554` path does not.
 */
export interface Publication {
  title: string;
  authors: string[];
  venue: string;
  venueFull: string;
  publisher: string;
  /** Bare DOI, no `https://doi.org/` prefix. `url` is built from it. */
  doi: string;
  url: string;
  year: number;
}

export interface Profile {
  name: string;
  shortName: string;
  roles: string[];
  tagline: string;
  bio: string[];
  location: string;
  email: string;
  cvUrl: string;
  avatarUrl: string;
  openToWork: boolean;
  socials: SocialLink[];
  stats: Stat[];
  /** Optional. About renders the card only when there is one to render. */
  publication?: Publication;
}

export type SkillLevel = 'basic' | 'intermediate' | 'advanced';

export interface Skill {
  name: string;
  icon: string;
  level?: SkillLevel;
  relatedProjectIds?: string[];
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: Skill[];
}

export type ExperienceType =
  | 'work'
  | 'internship'
  | 'organization'
  | 'freelance'
  | 'volunteer'
  | 'research';

export interface Experience {
  id: string;
  role: string;
  organization: string;
  type: ExperienceType;
  location?: string;
  startDate: string;
  endDate: string | 'present';
  summary: string;
  highlights: string[];
  stack?: string[];
  logoUrl?: string;
}

export interface ProjectLinks {
  demo?: string;
  repo?: string;
  paper?: string;
  video?: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  year: number;
  /**
   * Optional. Not every project has a role worth stating — a solo build often
   * does not — and the meta line drops it rather than printing a separator
   * with nothing after it.
   */
  role?: string;
  problem: string;
  solution: string;
  outcome?: string;
  stack: string[];
  thumbnail: string;
  images?: string[];
  links: ProjectLinks;
  featured: boolean;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number | 'present';
  gpa?: string;
  highlights?: string[];
  logoUrl?: string;
}

export type CertificateCategory =
  | 'course'
  | 'competition'
  | 'workshop'
  | 'professional'
  | 'bootcamp';

/**
 * No dates, and no `credentialId`. Both were removed on 2026-08-22 for the same
 * reason: the lightbox shows the scan at full size and the scan states them
 * itself, so the fields were reprinting the image in words. Seven of the
 * fourteen dates were still placeholders that would have contradicted the scan
 * they sat under, and `expiryDate` and `credentialId` were each set on exactly
 * one certificate and rendered nowhere at all.
 *
 * Nothing sorted by any of them; the wall groups by `category` and walks in
 * array order. `credentialUrl` stays because it is the one field of this kind
 * that does something a picture cannot — it takes a reader to the issuer to
 * verify independently.
 *
 * If a date is ever needed as *data* — for sorting, or a "valid until" badge
 * the scan cannot provide — it comes back as a field. It does not come back to
 * be printed under a picture of itself.
 */
export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  credentialUrl?: string;
  imageUrl: string;
  thumbnailUrl: string;
  category: CertificateCategory;
  skills: string[];
}

export interface Site {
  /** Origin only, no trailing slash. Every absolute URL is built from this. */
  url: string;
  title: string;
  description: string;
  /** Absolute path under public/. JPEG, because several scrapers still refuse WebP. */
  ogImage: string;
  ogImageAlt: string;
}

export interface Technology {
  /** Shown as the accessible name of the logo. */
  name: string;
  /** Stored per logo: simple-icons draws on 24 units, devicon on 128. */
  viewBox: string;
  /** A single SVG path. Filled with currentColor so the strip stays one colour. */
  path: string;
}
