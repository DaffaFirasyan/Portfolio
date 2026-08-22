import { render, screen } from '@testing-library/react';

import { profile } from '@/data/profile';
import Contact from './Contact';

describe('Contact', () => {
  it('renders the form inside the section', () => {
    render(<Contact />);
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('keeps the direct email address reachable without using the form', () => {
    render(<Contact />);
    expect(screen.getByRole('link', { name: profile.email })).toHaveAttribute(
      'href',
      `mailto:${profile.email}`,
    );
  });

  it('still lists every social link', () => {
    render(<Contact />);
    for (const social of profile.socials) {
      expect(screen.getByRole('link', { name: social.label })).toHaveAttribute('href', social.url);
    }
  });
});
