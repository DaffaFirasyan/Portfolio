import { useMotionAllowed } from '@/hooks/useMotionAllowed';

interface BorderBeamProps {
  className?: string;
  duration?: number;
  borderWidth?: number;
  colorFrom?: string;
  colorTo?: string;
}

/**
 * Lightswind-inspired BorderBeam component.
 * Renders a hardware-accelerated glowing beam that travels around the container border.
 * 100% CSS-based: zero JS mouse listeners, zero layout reflows, butter-smooth 60fps.
 */
export default function BorderBeam({
  className = '',
  duration = 8,
  borderWidth = 1.5,
  colorFrom = '#eab308',
  colorTo = 'transparent',
}: BorderBeamProps) {
  const { animate } = useMotionAllowed();

  if (!animate) return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute -inset-px rounded-[inherit] overflow-hidden ${className}`}
    >
      <div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: `${borderWidth}px`,
        }}
      >
        <div
          className="absolute aspect-square w-[300%]"
          style={{
            top: '50%',
            left: '50%',
            background: `conic-gradient(from 0deg, transparent 0 290deg, ${colorFrom} 345deg, ${colorTo} 360deg)`,
            animation: `border-beam-spin ${duration}s linear infinite`,
          }}
        />
      </div>
      <style>{`
        @keyframes border-beam-spin {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
