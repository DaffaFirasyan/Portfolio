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
 * No dates. Every scan carries its own issue and expiry date, legible in the
 * lightbox at full size, so repeating them in the caption was duplicating the
 * image — and seven of the fourteen were placeholders that would have shipped
 * as confident misinformation next to a scan that contradicted them. The one
 * `expiryDate` in the data was never rendered anywhere at all.
 *
 * Nothing sorted by them either; the wall groups by `category` and walks in
 * array order. If a date is ever needed as *data* — for sorting, or a "valid
 * until" badge the scan cannot provide — it comes back as a field. It does not
 * come back to be printed under a picture of itself.
 */
export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  credentialId?: string;
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
