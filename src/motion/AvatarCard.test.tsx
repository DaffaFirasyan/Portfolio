import { render, screen } from '@testing-library/react';

import AvatarCard from './AvatarCard';

function setCapability({ animate, hover }: { animate: boolean; hover: boolean }) {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? !animate : hover,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

const props = {
  src: '/profile/avatar.webp',
  name: 'Daffa Firasyan',
  width: 800,
  height: 800,
};

describe('AvatarCard', () => {
  it('names the photograph however it is rendered', () => {
    setCapability({ animate: true, hover: true });
    expect(screen.queryByAltText(/daffa firasyan/i)).toBeNull();
    render(<AvatarCard {...props} />);
    expect(screen.getByAltText(/daffa firasyan/i)).toBeInTheDocument();
  });

  it('ships a plain image under reduced motion, with its dimensions intact', () => {
    setCapability({ animate: false, hover: true });
    render(<AvatarCard {...props} />);

    const img = screen.getByAltText(/daffa firasyan/i);
    // Explicit width and height are what stop the layout shifting while the
    // image loads; the card does not carry them.
    expect(img).toHaveAttribute('width', '800');
    expect(img).toHaveAttribute('height', '800');
  });

  it('ships a plain image on a screen that cannot hover', () => {
    setCapability({ animate: true, hover: false });
    render(<AvatarCard {...props} />);

    // The tilt follows a pointer. With nothing to follow it is dead weight.
    expect(screen.getByAltText(/daffa firasyan/i)).toHaveAttribute('width', '800');
  });

  it('never renders the card its own name, title or contact button', () => {
    setCapability({ animate: true, hover: true });
    render(<AvatarCard {...props} />);

    // The hero already carries all of these; the card is the photograph only.
    expect(screen.queryByRole('button', { name: /contact/i })).toBeNull();
    expect(screen.queryByText('Software Engineer')).toBeNull();
    expect(screen.queryByText(/^@/)).toBeNull();
  });

  it('contributes no heading, and prints the name only as alt text', () => {
    setCapability({ animate: true, hover: true });
    const { container } = render(<AvatarCard {...props} />);

    // Upstream renders the name as an h3 outside the showUserInfo gate. In the
    // hero that would sit between the page h1 and the first h2, and print the
    // name a second time right beside it.
    expect(container.querySelectorAll('h1, h2, h3, h4, h5, h6')).toHaveLength(0);
    expect(screen.queryByText('Daffa Firasyan')).toBeNull();
    expect(screen.getByAltText('Daffa Firasyan avatar')).toBeInTheDocument();
  });
});
