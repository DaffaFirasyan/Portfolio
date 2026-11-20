import { render, screen } from '@testing-library/react';
import SectionShell from './SectionShell';

describe('SectionShell', () => {
  it('renders the anchor id, the title as an h2 and the body', () => {
    render(
      <SectionShell id="about" index={1} label="About" title="Who I am">
        <p>body</p>
      </SectionShell>,
    );

    expect(document.getElementById('about')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Who I am' })).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();
  });

  it('prints no eyebrow and no section number', () => {
    render(
      <SectionShell id="about" index={1} label="About" title="Who I am">
        <p>body</p>
      </SectionShell>,
    );

    // `index` and `label` are still accepted, because the section metadata
    // supplies them, but a kicker above a heading is a ban, and the number says
    // nothing the rail's index does not already say.
    expect(screen.queryByText('01 / About')).not.toBeInTheDocument();
    expect(screen.queryByText(/^01/)).not.toBeInTheDocument();
  });

  it('sets an optional aside under the title, in the same column', () => {
    render(
      <SectionShell id="projects" index={4} label="Projects" title="Selected work" aside={<button type="button">Filter</button>}>
        <p>body</p>
      </SectionShell>,
    );

    const heading = screen.getByRole('heading', { level: 2, name: 'Selected work' });
    const filter = screen.getByRole('button', { name: 'Filter' });
    expect(heading.parentElement).toContainElement(filter);
  });
});
