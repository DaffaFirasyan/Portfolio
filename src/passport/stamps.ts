export const SECTION_STAMPS = [
  'home',
  'about',
  'skills',
  'experience',
  'projects',
  'education',
  'contact',
] as const;
export const SECRET_STAMPS = ['comet', 'language', 'reach'] as const;
export const ALL_STAMPS = [...SECTION_STAMPS, ...SECRET_STAMPS] as const;

export type StampId = (typeof ALL_STAMPS)[number];
export type SecretStampId = (typeof SECRET_STAMPS)[number];

export const TOTAL = ALL_STAMPS.length;
/** Time a section must spend near the middle of the screen before it can be stamped. */
export const DWELL_MS = 5000;

export const STORAGE_KEY = 'daffa_passport';
export const SOUND_KEY = 'daffa_passport_sound';

export function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export function isStampId(value: unknown): value is StampId {
  return typeof value === 'string' && (ALL_STAMPS as readonly string[]).includes(value);
}

export function isSecret(id: StampId): id is SecretStampId {
  return (SECRET_STAMPS as readonly string[]).includes(id);
}

/** Every section stamp is in. The secrets are a bonus and never required. */
export function sectionsComplete(ids: readonly StampId[]): boolean {
  return SECTION_STAMPS.every((id) => ids.includes(id));
}

export function loadStamps(): StampId[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? [...new Set(parsed.filter(isStampId))] : [];
  } catch {
    return [];
  }
}

export function saveStamps(ids: readonly StampId[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage is blocked: progress lasts for this visit and the page is unaffected.
  }
}

export function loadSound(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) === 'true';
  } catch {
    return false;
  }
}

export function saveSound(on: boolean): void {
  try {
    localStorage.setItem(SOUND_KEY, String(on));
  } catch {
    // Same as above: the choice lasts for this visit.
  }
}
