import ShinyText from '@/components/reactbits/ShinyText/ShinyText';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';

interface ShineProps {
  text: string;
  className?: string;
}

/**
 * A short label with a sheen passing over it — used sparingly, for the one
 * status line that should catch the eye without shouting.
 */
export default function Shine({ text, className }: ShineProps) {
  const { animate } = useMotionAllowed();

  if (!animate) return <span className={className}>{text}</span>;

  return <ShinyText text={text} className={className} speed={4} />;
}
