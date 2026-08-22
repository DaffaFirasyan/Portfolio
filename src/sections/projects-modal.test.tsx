import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Projects from './Projects';
import { projects } from '@/data/projects';

const withOutcome = projects.find((p) => p.outcome)!;
const withoutDemo = projects.find((p) => !p.links.demo)!;

async function open(title: string) {
  await userEvent.click(screen.getByRole('button', { name: title }));
  return screen.getByRole('dialog', { name: title });
}

describe('project detail modal', () => {
  it('gives every project a control that opens it', () => {
    render(<Projects />);
    for (const project of projects) {
      expect(screen.getByRole('button', { name: project.title })).toBeInTheDocument();
    }
  });

  it('stays shut until asked', () => {
    render(<Projects />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows the solution and outcome, which the card never had room for', async () => {
    render(<Projects />);
    const dialog = await open(withOutcome.title);

    // The card shows only `problem`. These two are required by the data
    // contract and until now appeared nowhere on the page at all.
    expect(within(dialog).getByText(withOutcome.solution)).toBeInTheDocument();
    expect(within(dialog).getByText(withOutcome.outcome!)).toBeInTheDocument();
    expect(within(dialog).getByText(withOutcome.problem)).toBeInTheDocument();
  });

  it('lists the whole stack', async () => {
    render(<Projects />);
    const dialog = await open(withOutcome.title);

    for (const tech of withOutcome.stack) {
      expect(within(dialog).getByText(tech)).toBeInTheDocument();
    }
  });

  it('renders a link for each one the project has, and nothing for the rest', async () => {
    render(<Projects />);
    const dialog = await open(withoutDemo.title);

    if (withoutDemo.links.repo) {
      expect(within(dialog).getByRole('link', { name: /repository/i })).toHaveAttribute(
        'href',
        withoutDemo.links.repo,
      );
    }
    // A missing link is absent, not disabled.
    expect(within(dialog).queryByRole('link', { name: /live demo/i })).toBeNull();
  });

  it('opens external links safely', async () => {
    render(<Projects />);
    const dialog = await open(withOutcome.title);

    // queryAll rather than getAll, which throws on an empty result: no real
    // project carries a repo or demo URL yet, and "every link present is safe"
    // is still the claim being made.
    for (const link of within(dialog).queryAllByRole('link')) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    }
  });

  it('returns focus to the card control that opened it', async () => {
    render(<Projects />);
    const trigger = screen.getByRole('button', { name: withOutcome.title });

    trigger.focus();
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('button', { name: /close/i }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it('keeps the card heading a heading, not just a button', () => {
    render(<Projects />);
    // The title has to stay reachable to a screen reader's heading navigation
    // even though it is also the control that opens the detail.
    for (const project of projects) {
      expect(
        screen.getByRole('heading', { level: 3, name: project.title }),
      ).toBeInTheDocument();
    }
  });
});
