import ProfileCard from '@/components/reactbits/ProfileCard/ProfileCard';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';

interface AvatarCardProps {
  src: string;
  name: string;
  width: number;
  height: number;
  className?: string;
}

/**
 * The photograph, as a card that tilts and catches the light.
 *
 * `showUserInfo` is off: ProfileCard renders a whole identity block — name,
 * title, handle, status, contact button — and the hero already carries every
 * one of those. What is left is the photograph.
 *
 * Needs a hovering pointer, not just permission to animate. The tilt follows a
 * cursor, so on a touch screen it is dead weight and the plain image ships
 * instead — which also keeps the explicit width and height that stop the
 * layout shifting while the image loads.
 *
 * `iconUrl` and `grainUrl` are left empty deliberately. They are texture
 * overlays this project has no assets for, and the component reads an empty
 * string as `none` rather than emitting a broken url().
 */
export default function AvatarCard({ src, name, width, height, className }: AvatarCardProps) {
  const { animate, hover } = useMotionAllowed();

  if (!animate || !hover) {
    return (
      <img
        src={src}
        alt={`${name} avatar`}
        width={width}
        height={height}
        className={className}
        decoding="async"
        // This is the page's largest contentful paint. Without it the browser
        // treats the avatar as an ordinary image and queues it behind the
        // fonts and the bundle, which is most of the 880ms of load delay
        // Lighthouse measured. The preload in index.html covers discovery;
        // this covers priority once discovered.
        fetchPriority="high"
      />
    );
  }

  return (
    <div className={className}>
      <ProfileCard
        avatarUrl={src}
        name={name}
        showUserInfo={false}
        enableTilt
        enableMobileTilt={false}
        iconUrl=""
        grainUrl=""
      />
    </div>
  );
}
