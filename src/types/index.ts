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
  role: string;
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

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  imageUrl: string;
  thumbnailUrl: string;
  category: CertificateCategory;
  skills: string[];
}
