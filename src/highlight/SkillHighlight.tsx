import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface SkillHighlight {
  /** The skill currently hovered or focused, if any. */
  activeSkill: string | null;
  setActive: (skill: string, projectIds: string[]) => void;
  clear: () => void;
  /** This project used the active skill. */
  isHighlighted: (projectId: string) => boolean;
  /** Something else is highlighted, so this one should recede. */
  isDimmed: (projectId: string) => boolean;
}

const INERT: SkillHighlight = {
  activeSkill: null,
  setActive: () => {},
  clear: () => {},
  isHighlighted: () => false,
  isDimmed: () => false,
};

const Context = createContext<SkillHighlight>(INERT);

/**
 * Connects the skills list to the projects grid: point at a skill and the
 * projects that used it stay lit while the rest recede.
 *
 * It turns the skills section from a list of claims into an index of evidence,
 * which is the whole reason `relatedProjectIds` exists in the data.
 *
 * Two things this deliberately does not do:
 *
 * It does not consult `useMotionAllowed`. This is information, not decoration.
 * Someone who asked for reduced motion still benefits from seeing which
 * projects back a skill; what they asked to avoid is movement, and a change of
 * opacity is not movement.
 *
 * It does not throw outside a provider. Every section is rendered on its own
 * somewhere in the test suite, and a context that explodes when isolated makes
 * components harder to test for no gain. The default is simply inert.
 */
export function SkillHighlightProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ skill: string; projectIds: string[] } | null>(null);

  const setActive = useCallback((skill: string, projectIds: string[]) => {
    setState({ skill, projectIds });
  }, []);

  const clear = useCallback(() => setState(null), []);

  const value = useMemo<SkillHighlight>(() => {
    const related = state?.projectIds ?? [];
    // A skill with no projects behind it lights nothing and dims nothing,
    // rather than blacking out the whole grid to say "no evidence".
    const active = related.length > 0;

    return {
      activeSkill: state?.skill ?? null,
      setActive,
      clear,
      isHighlighted: (projectId) => active && related.includes(projectId),
      isDimmed: (projectId) => active && !related.includes(projectId),
    };
  }, [state, setActive, clear]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useSkillHighlight(): SkillHighlight {
  return useContext(Context);
}
