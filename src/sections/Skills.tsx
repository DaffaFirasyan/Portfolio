import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import SectionShell from '@/components/layout/SectionShell';
import MagicCard from '@/components/ui/MagicCard';
import { shellPropsFrom } from '@/data/sections';
import { useLanguage } from '@/context/LanguageContext';
import { useSkillHighlight } from '@/highlight/SkillHighlight';
import { skillIcon } from '@/lib/skillIcon';
import LogoMarquee from '@/motion/LogoMarquee';
import Reveal from '@/motion/Reveal';

export default function Skills() {
  const { skillCategories, sections, language } = useLanguage();
  const { activeSkill, setActive, clear } = useSkillHighlight();
  const shell = shellPropsFrom(sections, 'skills');

  const [selectedTab, setSelectedTab] = useState<string>('all');

  const totalSkillsCount = skillCategories.reduce((acc, cat) => acc + cat.skills.length, 0);

  const tabs = [
    {
      id: 'all',
      label: language === 'id' ? 'Semua' : 'All',
      count: totalSkillsCount,
    },
    ...skillCategories.map((cat) => ({
      id: cat.id,
      label: cat.name,
      count: cat.skills.length,
    })),
  ];

  const activeCategory = skillCategories.find((cat) => cat.id === selectedTab);

  return (
    <SectionShell {...shell}>
      {/* Marquee sits above the interactive categorised cards */}
      <div className="mb-10 overflow-hidden">
        <LogoMarquee />
      </div>

      {/* Morphing Category Pill Navigation */}
      <Reveal delay={0.05}>
        <div className="mb-6 flex justify-center">
          <div
            role="tablist"
            aria-label="Skill Categories"
            className="inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-full border border-edge/60 bg-surface/50 p-1.5 backdrop-blur-md"
          >
            {tabs.map((tab) => {
              const isSelected = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`relative flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-colors duration-200 outline-none ${
                    isSelected ? 'text-accent font-semibold' : 'text-muted hover:text-primary'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeSkillTab"
                      className="absolute inset-0 rounded-full border border-accent/40 bg-accent/15 shadow-[0_0_15px_rgba(234,179,8,0.15)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                  <span
                    className={`relative z-10 rounded-full px-1.5 py-0.5 font-mono text-[10px] transition-colors ${
                      isSelected
                        ? 'bg-accent/25 text-accent font-bold'
                        : 'bg-surface/80 text-muted/80 border border-edge/40'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* MagicCard Container */}
      <Reveal delay={0.1} fill>
        <MagicCard className="p-5 sm:p-7 shadow-xl">
          <AnimatePresence mode="wait">
            {selectedTab === 'all' ? (
              <motion.div
                key="all"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
              >
                {skillCategories.map((category) => (
                  <div key={category.id} className="flex flex-col">
                    <div className="flex items-center justify-between border-b border-edge/40 pb-2 mb-3">
                      <h3 className="font-display text-xs sm:text-sm font-bold text-primary flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                        {category.name}
                      </h3>
                      <span className="rounded-full border border-edge/50 bg-surface/80 px-1.5 py-0.5 font-mono text-[10px] text-muted">
                        {category.skills.length}
                      </span>
                    </div>

                    <ul className="flex flex-col gap-1.5">
                      {category.skills.map((skill) => {
                        const Icon = skillIcon(skill.icon);
                        const isActive = activeSkill === skill.name;

                        return (
                          <li key={skill.name}>
                            <button
                              type="button"
                              onMouseEnter={() =>
                                setActive(skill.name, skill.relatedProjectIds ?? [])
                              }
                              onFocus={() => setActive(skill.name, skill.relatedProjectIds ?? [])}
                              onMouseLeave={clear}
                              onBlur={clear}
                              className={`group/skill flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs sm:text-sm leading-snug transition-all duration-150 ${
                                isActive
                                  ? 'border border-accent/40 bg-accent/10 text-accent shadow-[0_0_12px_rgba(234,179,8,0.15)] font-medium'
                                  : 'border border-transparent text-muted hover:border-edge/50 hover:bg-surface/80 hover:text-primary'
                              }`}
                            >
                              {Icon && (
                                <Icon
                                  aria-hidden="true"
                                  className={`h-3.5 w-3.5 shrink-0 transition-colors duration-150 ${
                                    isActive
                                      ? 'text-accent'
                                      : 'text-muted group-hover/skill:text-accent'
                                  }`}
                                />
                              )}
                              <span className="truncate">{skill.name}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </motion.div>
            ) : activeCategory ? (
              <motion.div
                key={activeCategory.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between border-b border-edge/40 pb-3 mb-5">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    <h3 className="font-display text-base font-bold text-primary sm:text-lg">
                      {activeCategory.name}
                    </h3>
                  </div>
                  <span className="rounded-full border border-edge/60 bg-surface/80 px-2.5 py-0.5 font-mono text-xs text-muted">
                    {activeCategory.skills.length}{' '}
                    {language === 'id' ? 'Keahlian' : 'Skills'}
                  </span>
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {activeCategory.skills.map((skill) => {
                    const Icon = skillIcon(skill.icon);
                    const isActive = activeSkill === skill.name;

                    return (
                      <li key={skill.name}>
                        <button
                          type="button"
                          onMouseEnter={() => setActive(skill.name, skill.relatedProjectIds ?? [])}
                          onFocus={() => setActive(skill.name, skill.relatedProjectIds ?? [])}
                          onMouseLeave={clear}
                          onBlur={clear}
                          className={`group/skill flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs sm:text-sm leading-snug transition-all duration-150 ${
                            isActive
                              ? 'border border-accent/40 bg-accent/10 text-accent shadow-[0_0_15px_rgba(234,179,8,0.2)] font-medium'
                              : 'border border-edge/50 bg-surface/60 text-muted hover:border-edge-bright hover:bg-surface/90 hover:text-primary'
                          }`}
                        >
                          {Icon && (
                            <Icon
                              aria-hidden="true"
                              className={`h-4 w-4 shrink-0 transition-colors duration-150 ${
                                isActive
                                  ? 'text-accent'
                                  : 'text-muted group-hover/skill:text-accent'
                              }`}
                            />
                          )}
                          <span className="truncate">{skill.name}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </MagicCard>
      </Reveal>
    </SectionShell>
  );
}
