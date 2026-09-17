import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type {
  Education,
  Experience,
  ExperienceType,
  Profile,
  Project,
  SectionMeta,
  SkillCategory,
} from '@/types';
import { education as educationEn } from '@/data/education';
import {
  EXPERIENCE_TYPE_LABEL as experienceTypeLabelEn,
  experiences as experiencesEn,
} from '@/data/experiences';
import { profile as profileEn } from '@/data/profile';
import { projects as projectsEn } from '@/data/projects';
import { SECTIONS as sectionsEn } from '@/data/sections';
import { skillCategories as skillCategoriesEn } from '@/data/skills';

import {
  DICTIONARY,
  type Dictionary,
  type Language,
} from '@/data/i18n/dictionary';
import {
  educationId,
  EXPERIENCE_TYPE_LABEL_ID,
  experiencesId,
  profileId,
  projectsId,
  sectionsId,
  skillCategoriesId,
} from '@/data/i18n/id';

const STORAGE_KEY = 'daffa_portfolio_lang';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Dictionary;
  profile: Profile;
  experiences: Experience[];
  experienceTypeLabel: Record<ExperienceType, string>;
  projects: Project[];
  skillCategories: SkillCategory[];
  education: Education[];
  sections: SectionMeta[];
}

const defaultContextValue: LanguageContextValue = {
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: DICTIONARY.en,
  profile: profileEn,
  experiences: experiencesEn,
  experienceTypeLabel: experienceTypeLabelEn,
  projects: projectsEn,
  skillCategories: skillCategoriesEn,
  education: educationEn,
  sections: sectionsEn,
};

const LanguageContext = createContext<LanguageContextValue>(defaultContextValue);

function detectLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'id') return saved;
  } catch {
    // Ignore localStorage access errors (e.g. cookies disabled)
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => detectLanguage());

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore localStorage errors
    }
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', lang);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'id' : 'en');
  }, [language, setLanguage]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', language);
    }
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => {
    const isId = language === 'id';
    return {
      language,
      setLanguage,
      toggleLanguage,
      t: isId ? DICTIONARY.id : DICTIONARY.en,
      profile: isId ? profileId : profileEn,
      experiences: isId ? experiencesId : experiencesEn,
      experienceTypeLabel: isId ? EXPERIENCE_TYPE_LABEL_ID : experienceTypeLabelEn,
      projects: isId ? projectsId : projectsEn,
      skillCategories: isId ? skillCategoriesId : skillCategoriesEn,
      education: isId ? educationId : educationEn,
      sections: isId ? sectionsId : sectionsEn,
    };
  }, [language, setLanguage, toggleLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
