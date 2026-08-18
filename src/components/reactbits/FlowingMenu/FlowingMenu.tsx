import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

interface MenuItemData {
  /**
   * Replaces upstream's `link`. These rows open a dialog rather than navigate,
   * so the row is a button; an anchor with no destination would be a lie about
   * what happens on click, and would break middle-click and copy-link.
   */
  onSelect: () => void;
  text: string;
  image: string;
  /** Used by the caller as a React key; the row itself never reads it. */
  id: string;
  /**
   * Added for the skill cross-highlight. Upstream has no per-item state, which
   * would have cost this project its most interesting interaction: hovering a
   * skill dims the projects that do not use it, one by one.
   */
  dimmed?: boolean;
}

interface FlowingMenuProps {
  items?: MenuItemData[];
  speed?: number;
  textColor?: string;
  bgColor?: string;
  marqueeBgColor?: string;
  marqueeTextColor?: string;
  borderColor?: string;
}

interface MenuItemProps extends MenuItemData {
  speed: number;
  textColor: string;
  marqueeBgColor: string;
  marqueeTextColor: string;
  borderColor: string;
  isFirst: boolean;
}

const FlowingMenu: React.FC<FlowingMenuProps> = ({
  items = [],
  speed = 15,
  textColor = '#fff',
  bgColor = '#120F17',
  marqueeBgColor = '#fff',
  marqueeTextColor = '#120F17',
  borderColor = '#fff'
}) => {
  return (
    <div className="w-full h-full overflow-hidden" style={{ backgroundColor: bgColor }}>
      {/* A div, not a nav. These are the page's projects, not site
          navigation, and an unnamed nav landmark shows up in a screen
          reader's landmark list as a second, anonymous "navigation" next to
          the real one. The articles inside carry the semantics. */}
      <div className="flex flex-col h-full m-0 p-0">
        {items.map((item, idx) => (
          <MenuItem
            key={idx}
            {...item}
            speed={speed}
            textColor={textColor}
            marqueeBgColor={marqueeBgColor}
            marqueeTextColor={marqueeTextColor}
            borderColor={borderColor}
            isFirst={idx === 0}
          />
        ))}
      </div>
    </div>
  );
};

const MenuItem: React.FC<MenuItemProps> = ({
  onSelect,
  dimmed,
  text,
  image,
  speed,
  textColor,
  marqueeBgColor,
  marqueeTextColor,
  borderColor,
  isFirst
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeInnerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const [repetitions, setRepetitions] = useState(4);

  const animationDefaults = { duration: 0.6, ease: 'expo' };

  const findClosestEdge = (mouseX: number, mouseY: number, width: number, height: number): 'top' | 'bottom' => {
    const topEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY, 2);
    const bottomEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY - height, 2);
    return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
  };

  useEffect(() => {
    const calculateRepetitions = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector('.marquee-part') as HTMLElement;
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      const viewportWidth = window.innerWidth;

      // Upstream divides by this width unguarded. Before layout settles it is
      // zero, so the count becomes Infinity and Array(Infinity) throws
      // RangeError — which is how this crashed the whole page render in a test.
      // A browser hits the same window while fonts load or inside a hidden
      // ancestor. Keep the default until something has actually been measured,
      // and cap it so a one-pixel measurement cannot mint thousands of nodes.
      if (!contentWidth || !Number.isFinite(contentWidth)) return;

      const needed = Math.ceil(viewportWidth / contentWidth) + 2;
      setRepetitions(Math.min(24, Math.max(4, needed)));
    };

    calculateRepetitions();
    window.addEventListener('resize', calculateRepetitions);
    return () => window.removeEventListener('resize', calculateRepetitions);
  }, [text, image]);

  useEffect(() => {
    const setupMarquee = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector('.marquee-part') as HTMLElement;
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      if (contentWidth === 0) return;

      if (animationRef.current) {
        animationRef.current.kill();
      }

      animationRef.current = gsap.to(marqueeInnerRef.current, {
        x: -contentWidth,
        duration: speed,
        ease: 'none',
        repeat: -1
      });
    };

    const timer = setTimeout(setupMarquee, 50);
    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [text, image, repetitions, speed]);

  const reveal = (clientX: number, clientY: number) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(clientX - rect.left, clientY - rect.top, rect.width, rect.height);

    gsap
      .timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' }, 0);
  };

  const conceal = (clientX: number, clientY: number) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(clientX - rect.left, clientY - rect.top, rect.width, rect.height);

    gsap
      .timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0);
  };

  /**
   * Focus reveals it too. Upstream binds the effect to the mouse alone, which
   * left a keyboard reader tabbing through rows that never showed them
   * anything. The centre of the row is used as the entry point, since a
   * keyboard has no cursor position.
   */
  const edgeFromCentre = (): [number, number] => {
    const rect = itemRef.current?.getBoundingClientRect();
    return rect ? [rect.left + rect.width / 2, rect.top] : [0, 0];
  };

  return (
    // An article with a heading inside, not a bare div with a link. These rows
    // are the page's projects: a screen reader navigates them by heading, and
    // the cross-highlight finds them by article. Upstream is built for a menu,
    // where neither matters.
    <article
      data-dimmed={dimmed ? 'true' : undefined}
      className={`flex-1 relative overflow-hidden text-center transition-opacity duration-150 ${
        dimmed ? 'opacity-40' : 'opacity-100'
      }`}
      ref={itemRef}
      style={{ borderTop: isFirst ? 'none' : `1px solid ${borderColor}` }}
    >
      <h3 className="h-full">
      <button
        type="button"
        // text-[4vh] replaced: type that scales with viewport height means the
        // same row is a different size on a laptop and a monitor for no reason
        // a reader could name.
        className="flex h-full w-full items-center justify-center relative cursor-pointer uppercase font-semibold text-xl md:text-3xl"
        onClick={onSelect}
        onMouseEnter={(ev) => reveal(ev.clientX, ev.clientY)}
        onMouseLeave={(ev) => conceal(ev.clientX, ev.clientY)}
        onFocus={() => reveal(...edgeFromCentre())}
        onBlur={() => conceal(...edgeFromCentre())}
        style={{ color: textColor }}
      >
        {text}
      </button>
      </h3>
      <div
        className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none translate-y-[101%]"
        ref={marqueeRef}
        style={{ backgroundColor: marqueeBgColor }}
      >
        <div className="h-full w-fit flex" ref={marqueeInnerRef}>
          {[...Array(repetitions)].map((_, idx) => (
            <div className="marquee-part flex items-center flex-shrink-0" key={idx} style={{ color: marqueeTextColor }}>
              <span className="whitespace-nowrap uppercase font-normal text-xl md:text-3xl leading-[1] px-4">{text}</span>
              <div
                className="w-[160px] h-16 my-4 mx-6 rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url(${image})` }}
              />
            </div>
          ))}
        </div>
      </div>
    </article>
  );
};

export default FlowingMenu;
