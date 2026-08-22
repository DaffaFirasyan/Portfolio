import BlurText from '@/components/reactbits/BlurText/BlurText';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';

interface BlurInProps {
  text: string;
  className?: string;
  delay?: number;
}

/**
 * A line of prose that arrives word by word.
 *
 * It used to resolve from blurred to sharp, and the name still says so. Both
 * halves of the component's default animation were measured and dropped:
 *
 * The blur was every one of the twelve non-composited animations Lighthouse
 * reported on this page — one per word of the hero line, each flagged
 * "filter-related property may move pixels". A filter cannot be handed to the
 * compositor, so all of it lands on the main thread during the busiest moment
 * of the page's life.
 *
 * The fade from `opacity: 0` is the same defect that cost this page an
 * accessibility point through `Reveal`: text below its own contrast ratio for
 * the length of the animation. It is prose, and it is the first sentence
 * anybody reads.
 *
 * A staggered rise carries the entrance on its own, composites, and never
 * makes a word unreadable on the way in.
 */
export default function BlurIn({ text, className, delay = 60 }: BlurInProps) {
  const { animate } = useMotionAllowed();

  if (!animate) return <p className={className}>{text}</p>;

  return (
    <BlurText
      text={text}
      className={className}
      delay={delay}
      animateBy="words"
      animationFrom={{ y: 16 }}
      animationTo={[{ y: 0 }]}
    />
  );
}
