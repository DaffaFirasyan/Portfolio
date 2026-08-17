import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkillHighlightProvider, useSkillHighlight } from './SkillHighlight';

function Source({ name, projects }: { name: string; projects: string[] }) {
  const { setActive, clear } = useSkillHighlight();
  return (
    <button
      type="button"
      onMouseEnter={() => setActive(name, projects)}
      onFocus={() => setActive(name, projects)}
      onMouseLeave={clear}
      onBlur={clear}
    >
      {name}
    </button>
  );
}

function Target({ id }: { id: string }) {
  const { isHighlighted, isDimmed, activeSkill } = useSkillHighlight();
  return (
    <div
      data-testid={id}
      data-highlighted={isHighlighted(id) ? 'true' : undefined}
      data-dimmed={isDimmed(id) ? 'true' : undefined}
    >
      {activeSkill ?? 'none'}
    </div>
  );
}

function setup() {
  return render(
    <SkillHighlightProvider>
      <Source name="Neo4j" projects={['kg-assistant']} />
      <Target id="kg-assistant" />
      <Target id="kos-finder" />
    </SkillHighlightProvider>,
  );
}

describe('SkillHighlight', () => {
  it('highlights and dims nothing until a skill is active', () => {
    setup();
    for (const id of ['kg-assistant', 'kos-finder']) {
      expect(screen.getByTestId(id)).not.toHaveAttribute('data-highlighted');
      expect(screen.getByTestId(id)).not.toHaveAttribute('data-dimmed');
    }
  });

  it('highlights only the related project on hover', async () => {
    setup();
    await userEvent.hover(screen.getByRole('button', { name: 'Neo4j' }));

    expect(screen.getByTestId('kg-assistant')).toHaveAttribute('data-highlighted', 'true');
    expect(screen.getByTestId('kg-assistant')).not.toHaveAttribute('data-dimmed');

    expect(screen.getByTestId('kos-finder')).not.toHaveAttribute('data-highlighted');
    expect(screen.getByTestId('kos-finder')).toHaveAttribute('data-dimmed', 'true');
  });

  it('works from the keyboard, not just the mouse', async () => {
    setup();
    await userEvent.tab();

    expect(screen.getByRole('button', { name: 'Neo4j' })).toHaveFocus();
    expect(screen.getByTestId('kg-assistant')).toHaveAttribute('data-highlighted', 'true');
  });

  it('clears when the pointer leaves', async () => {
    setup();
    const chip = screen.getByRole('button', { name: 'Neo4j' });

    await userEvent.hover(chip);
    await userEvent.unhover(chip);

    expect(screen.getByTestId('kg-assistant')).not.toHaveAttribute('data-highlighted');
    expect(screen.getByTestId('kos-finder')).not.toHaveAttribute('data-dimmed');
  });

  it('dims nothing when the active skill relates to no project', async () => {
    render(
      <SkillHighlightProvider>
        <Source name="Git" projects={[]} />
        <Target id="kg-assistant" />
      </SkillHighlightProvider>,
    );

    await userEvent.hover(screen.getByRole('button', { name: 'Git' }));

    // A skill with no evidence behind it should not black out the whole grid.
    expect(screen.getByTestId('kg-assistant')).not.toHaveAttribute('data-dimmed');
    expect(screen.getByTestId('kg-assistant')).not.toHaveAttribute('data-highlighted');
  });

  it('reads as inert outside a provider rather than throwing', () => {
    render(<Target id="kg-assistant" />);
    expect(screen.getByTestId('kg-assistant')).not.toHaveAttribute('data-highlighted');
    expect(screen.getByTestId('kg-assistant')).toHaveTextContent('none');
  });
});
