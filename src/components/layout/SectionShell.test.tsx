import { render, screen } from '@testing-library/react';
import SectionShell from './SectionShell';

describe('SectionShell', () => {
  it('renders the anchor id, zero-padded number, label and title', () => {
    render(
      <SectionShell id="about" index={1} label="About" title="Who I am">
        <p>body</p>
      </SectionShell>,
    );

    const section = document.getElementById('about');
    expect(section).toBeInTheDocument();
    expect(screen.getByText('01 / About')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Who I am' })).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();
  });
});
