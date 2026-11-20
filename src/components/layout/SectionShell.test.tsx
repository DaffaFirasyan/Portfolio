import { render, screen } from '@testing-library/react';
import { PassportProvider } from '@/passport/PassportProvider';
import { STORAGE_KEY } from '@/passport/stamps';
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

  it('ends with an empty stamp slot until the section is stamped', () => {
    localStorage.clear();
    const { container } = render(
      <PassportProvider>
        <SectionShell id="about" index={1} label="About" title="Who I am">
          <p>body</p>
        </SectionShell>
      </PassportProvider>,
    );
    expect(container.querySelector('[data-stamp="about"]')).toHaveAttribute('data-earned', 'false');
    expect(screen.getByText('Not yet stamped')).toBeInTheDocument();
  });

  it('fills the slot once the section is stamped', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['about']));
    const { container } = render(
      <PassportProvider>
        <SectionShell id="about" index={1} label="About" title="Who I am">
          <p>body</p>
        </SectionShell>
      </PassportProvider>,
    );
    expect(container.querySelector('[data-stamp="about"]')).toHaveAttribute('data-earned', 'true');
    expect(screen.getByText('Stamped')).toBeInTheDocument();
    localStorage.clear();
  });

  it('prints no slot for an id that is not a stamp', () => {
    const { container } = render(
      <SectionShell id="zzz" index={9} label="Zzz" title="Nothing">
        <p>body</p>
      </SectionShell>,
    );
    expect(container.querySelector('[data-stamp]')).toBeNull();
  });
});
