import SplitText from '@/components/reactbits/SplitText/SplitText';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';

interface HeadingProps {
  level: 1 | 2 | 3;
  children: string;
  className?: string;
}

/**
 * A heading that animates in per character when motion is welcome, and is
 * ordinary text when it is not.
 *
 * That distinction is not cosmetic. SplitText wraps every character in its own
 * element, which changes what assistive technology announces and how the text
 * wraps at narrow widths — so under reduced motion this has to be a plain text
 * node, not a fast animation.
 *
 * `children` is a string rather than ReactNode because splitting only works on
 * text; accepting elements would fail at runtime instead of here.
 */
export default function Heading({ level, children, className }: HeadingProps) {
  const { animate } = useMotionAllowed();
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3';

  if (!animate) {
    return <Tag className={className}>{children}</Tag>;
  }

  // SplitText renders the heading element itself via `tag`. Wrapping it in
  // another Tag would nest a heading inside a heading.
  //
  // textAlign is passed explicitly because SplitText defaults it to 'center'
  // and writes it as an inline style, which no class can override.
  return (
    <SplitText
      text={children}
      tag={Tag}
      className={className}
      splitType="chars"
      duration={0.6}
      delay={20}
      textAlign="inherit"
    />
  );
}
