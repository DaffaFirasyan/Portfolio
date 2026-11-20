import type { Dictionary } from '@/data/i18n/dictionary';
import type { SectionMeta } from '@/types';
import type { SecretStampId, StampId } from './stamps';

export function stampName(id: StampId, sections: SectionMeta[], t: Dictionary): string {
  if (id === 'comet') return t.stampComet;
  if (id === 'language') return t.stampLanguage;
  if (id === 'reach') return t.stampReach;
  return sections.find((section) => section.id === id)?.label ?? id;
}

export function stampHint(id: SecretStampId, t: Dictionary): string {
  if (id === 'comet') return t.hintComet;
  if (id === 'language') return t.hintLanguage;
  return t.hintReach;
}
