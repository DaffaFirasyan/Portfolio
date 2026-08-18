import TextType from '@/components/reactbits/TextType/TextType';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';

interface TypedProps {
  text: string;
  className?: string;
}

/**
 * A line that types itself once, when it arrives on screen.
 *
 * Under reduced motion it is an ordinary paragraph. Typing is not decoration
 * that can be sped up — until it finishes, the sentence is not there to read,
 * so the still version has to be the whole sentence rather than a fast one.
 *
 * `loop` is off deliberately. A sentence that erases and retypes itself while
 * someone is reading it is worse than no effect at all.
 */
export default function Typed({ text, className }: TypedProps) {
  const { animate } = useMotionAllowed();

  if (!animate) return <p className={className}>{text}</p>;

  return (
    <TextType
      as="p"
      text={text}
      className={className}
      typingSpeed={18}
      initialDelay={200}
      loop={false}
      showCursor
      cursorCharacter="_"
      startOnVisible
    />
  );
}
