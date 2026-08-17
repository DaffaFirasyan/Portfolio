import BlurText from '@/components/reactbits/BlurText/BlurText';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';

interface BlurInProps {
  text: string;
  className?: string;
  delay?: number;
}

/** A line of prose that resolves from blurred to sharp, word by word. */
export default function BlurIn({ text, className, delay = 60 }: BlurInProps) {
  const { animate } = useMotionAllowed();

  if (!animate) return <p className={className}>{text}</p>;

  return <BlurText text={text} className={className} delay={delay} animateBy="words" />;
}
