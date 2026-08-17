import TiltedCard from '@/components/reactbits/TiltedCard/TiltedCard';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';

interface TiltImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

/**
 * A photograph that tilts towards the cursor.
 *
 * Needs a hovering pointer, not just permission to animate — on a touch screen
 * the effect has nothing to follow, so the plain image ships instead. That also
 * keeps the explicit width and height, which the tilted version does not carry
 * and which are what stop the layout shifting while the image loads.
 */
export default function TiltImage({ src, alt, width, height, className }: TiltImageProps) {
  const { animate, hover } = useMotionAllowed();

  if (!animate || !hover) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        decoding="async"
      />
    );
  }

  return (
    <div className={className} style={{ aspectRatio: `${width} / ${height}` }}>
      <TiltedCard
        imageSrc={src}
        altText={alt}
        containerWidth="100%"
        containerHeight="100%"
        imageWidth="100%"
        imageHeight="100%"
        rotateAmplitude={9}
        scaleOnHover={1.04}
        showMobileWarning={false}
        showTooltip={false}
      />
    </div>
  );
}
