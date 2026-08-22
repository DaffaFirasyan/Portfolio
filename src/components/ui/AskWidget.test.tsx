import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AskWidget from './AskWidget';

/**
 * Focus and keyboard behaviour is asserted here rather than in the browser
 * pane, and that is deliberate: the pane never gives the document real focus,
 * so `.focus()` moves `activeElement` while `document.hasFocus()` stays false
 * and no focus event ever fires. jsdom through Testing Library has no such gap.
 */
describe('AskWidget', () => {
  it('starts closed, with the launcher saying so', async () => {
    render(<AskWidget />);
    const launcher = screen.getByRole('button', { name: /ask about my work/i });
    expect(launcher).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens on click and puts the cursor in the question box', async () => {
    const user = userEvent.setup();
    render(<AskWidget />);

    await user.click(screen.getByRole('button', { name: /ask about my work/i }));

    const panel = screen.getByRole('dialog', { name: /ask about this portfolio/i });
    expect(panel).toBeInTheDocument();
    // Non-modal on purpose: the page stays usable behind it, so it must not
    // claim modality it does not enforce.
    expect(panel).toHaveAttribute('aria-modal', 'false');
    expect(screen.getByRole('textbox', { name: /ask a question/i })).toHaveFocus();
  });

  it('answers a typed question with a quote from the data and a way to it', async () => {
    const user = userEvent.setup();
    render(<AskWidget />);
    await user.click(screen.getByRole('button', { name: /ask about my work/i }));

    await user.type(screen.getByRole('textbox', { name: /ask a question/i }), 'What did he build with Neo4j?{Enter}');

    const panel = screen.getByRole('dialog');
    // The question stays visible, so the panel reads as an exchange.
    expect(within(panel).getByText('What did he build with Neo4j?')).toBeInTheDocument();
    expect(within(panel).getByText(/AssetMind/)).toBeInTheDocument();
    expect(within(panel).getAllByRole('link', { name: /go to/i }).length).toBeGreaterThan(0);
  });

  it('says nothing matched rather than offering the nearest thing', async () => {
    const user = userEvent.setup();
    render(<AskWidget />);
    await user.click(screen.getByRole('button', { name: /ask about my work/i }));

    await user.type(screen.getByRole('textbox', { name: /ask a question/i }), 'kubernetes{Enter}');

    expect(screen.getByText(/nothing on this page mentions that/i)).toBeInTheDocument();
  });

  it('never answers with a sentence the site does not contain', async () => {
    // The reason this is retrieval and not a model. Whatever it says, the
    // owner wrote — so the blockquotes must be findable in the page's own data.
    const user = userEvent.setup();
    render(<AskWidget />);
    await user.click(screen.getByRole('button', { name: /ask about my work/i }));

    const box = screen.getByRole('textbox', { name: /ask a question/i });
    await user.type(box, 'Laravel{Enter}');

    const { projects } = await import('@/data/projects');
    const known = projects.flatMap((p) => [p.problem, p.solution, p.outcome]);
    for (const quote of screen.getByRole('dialog').querySelectorAll('blockquote')) {
      expect(known.some((s) => s === quote.textContent)).toBe(true);
    }
  });

  it('closes on Escape and hands focus back to the launcher', async () => {
    const user = userEvent.setup();
    render(<AskWidget />);
    const launcher = screen.getByRole('button', { name: /ask about my work/i });

    await user.click(launcher);
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    // Without this the keyboard reader is dropped on <body>, at the top of a
    // nine-screen document.
    expect(screen.getByRole('button', { name: /ask about my work/i })).toHaveFocus();
  });

  it('closes when the page behind it is clicked', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <button type="button">something else</button>
        <AskWidget />
      </div>,
    );

    await user.click(screen.getByRole('button', { name: /ask about my work/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'something else' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('offers suggestions that ask themselves', async () => {
    const user = userEvent.setup();
    render(<AskWidget />);
    await user.click(screen.getByRole('button', { name: /ask about my work/i }));

    const suggestion = screen.getByRole('button', { name: /who is he/i });
    await user.click(suggestion);

    // Once asked, the empty state is gone and the exchange has replaced it.
    expect(screen.queryByText(/try one of these/i)).not.toBeInTheDocument();
    expect(screen.getByRole('dialog').querySelectorAll('blockquote').length).toBeGreaterThan(0);
  });
});
