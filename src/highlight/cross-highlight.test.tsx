import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkillHighlightProvider } from './SkillHighlight';
import Projects from '@/sections/Projects';
import Skills from '@/sections/Skills';
import { projects } from '@/data/projects';
import { skillCategories } from '@/data/skills';

const allSkills = skillCategories.flatMap((c) => c.skills);
const linked = allSkills.find((s) => (s.relatedProjectIds?.length ?? 0) > 0)!;
const unlinked = allSkills.find((s) => (s.relatedProjectIds?.length ?? 0) === 0)!;

function card(id: string) {
  const title = projects.find((p) => p.id === id)!.title;
  return screen.getByRole('heading', { level: 3, name: title }).closest('article')!;
}

function setup() {
  return render(
    <SkillHighlightProvider>
      <Skills />
      <Projects />
    </SkillHighlightProvider>,
  );
}

describe('skills and projects, wired together', () => {
  it('dims the unrelated projects when a skill is hovered', async () => {
    setup();

    const related = linked.relatedProjectIds!;
    const unrelated = projects.find((p) => !related.includes(p.id))!;

    await userEvent.hover(screen.getByRole('button', { name: linked.name }));

    for (const id of related) {
      expect(card(id), `${id} should stay lit`).not.toHaveAttribute('data-dimmed');
    }
    expect(card(unrelated.id), `${unrelated.id} should recede`).toHaveAttribute(
      'data-dimmed',
      'true',
    );
  });

  it('reaches the same state from the keyboard', async () => {
    setup();

    const button = screen.getByRole('button', { name: linked.name });
    button.focus();

    expect(button).toHaveFocus();
    for (const id of linked.relatedProjectIds!) {
      expect(card(id)).not.toHaveAttribute('data-dimmed');
    }
  });

  it('restores every project when the skill is released', async () => {
    setup();
    const button = screen.getByRole('button', { name: linked.name });

    await userEvent.hover(button);
    await userEvent.unhover(button);

    for (const project of projects) {
      expect(card(project.id)).not.toHaveAttribute('data-dimmed');
    }
  });

  it('leaves the grid alone for a skill with no projects behind it', async () => {
    setup();

    await userEvent.hover(screen.getByRole('button', { name: unlinked.name }));

    // Dimming everything would read as "no results" rather than "no link
    // recorded", which is a different and wrong claim.
    for (const project of projects) {
      expect(card(project.id)).not.toHaveAttribute('data-dimmed');
    }
  });

  it('never changes anything but opacity, so the grid cannot shift', async () => {
    setup();
    const target = card(linked.relatedProjectIds![0]);
    const other = card(projects.find((p) => !linked.relatedProjectIds!.includes(p.id))!.id);

    // jsdom computes no layout, so this checks the mechanism rather than the
    // pixels: only opacity classes may differ between the two states.
    const classesBefore = [target.className, other.className];

    await userEvent.hover(screen.getByRole('button', { name: linked.name }));

    const classesAfter = [target.className, other.className];
    for (const [before, after] of classesBefore.map((c, i) => [c, classesAfter[i]] as const)) {
      const strip = (c: string) => c.replace(/opacity-\d+/g, '').trim();
      expect(strip(after)).toBe(strip(before));
    }
  });
});
