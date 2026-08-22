import { CometCard } from '@/components/aceternity/CometCard/CometCard';
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
 * **This is Aceternity's Comet Card as of 2026-08-22**, replacing React Bits'
 * `ProfileCard`. That component was a finished identity widget — name, title,
 * handle, status, contact button, a holographic gradient and its own tilt — of
 * which this page used the photograph and nothing else, and whose glare had
 * already been turned down once because it was bleaching a real face.
 *
 * Comet Card is a wrapper instead: tilt, lift and highlight around whatever it
 * is given. The card inside is this project's, built from its own tokens, so
 * there is no vendored styling to fight.
 *
 * **The aspect ratio is not a coincidence and should not be changed casually.**
 * The portrait is 2000×2666, a ratio of exactly 0.750, and the frame is
 * `aspect-[3/4]`. They match, so `object-cover` crops nothing at all — every
 * pixel the owner framed is the pixel that renders. `hero-avatar.test.ts`
 * fails if the file's ratio and Hero's declared one drift apart.
 *
 * The demo this came from is `saturate-0` — a greyscale card. That is a strong
 * choice to make on somebody's face and it is not made here; say the word and
 * it is one class.
 *
 * Needs a hovering pointer, not just permission to animate. The tilt follows a
 * cursor, so on a touch screen it is dead weight and the plain image ships
 * instead — which also keeps the explicit width and height that stop the
 * layout shifting while the image loads.
 */
export default function AvatarCard({ src, name, width, height, className }: AvatarCardProps) {
  const { animate, hover } = useMotionAllowed();

  const image = (
    <img
      src={src}
      alt={`${name} avatar`}
      width={width}
      height={height}
      decoding="async"
      // This is the page's largest contentful paint. Without it the browser
      // treats the avatar as an ordinary image and queues it behind the fonts
      // and the bundle, which is most of the 880ms of load delay Lighthouse
      // measured. The preload in index.html covers discovery; this covers
      // priority once discovered.
      //
      // The upstream demo carries `loading="lazy"` here. Lazy-loading the one
      // image the LCP is measured against is the case Lighthouse warns about
      // by name, and this project already shipped that bug once.
      fetchPriority="high"
      className="h-full w-full rounded-xl object-cover"
    />
  );

  if (!animate || !hover) {
    return <img src={src} alt={`${name} avatar`} width={width} height={height} className={className} decoding="async" fetchPriority="high" />;
  }

  return (
    <div className={className}>
      <CometCard>
        {/* Not the demo's `<button>`. That one carries an aria-label and no
            action — it announces itself as a control and then does nothing
            when operated. Nothing here is clickable, so nothing here claims
            to be.

            No caption either, and the first attempt at this got it wrong. The
            demo has a name-and-code row along the bottom, and putting the
            owner's name there prints it a second time directly beside the
            page's h1, which *is* his name. AvatarCard.test.tsx has asserted
            since long before this component changed that the card contributes
            no heading and no second copy of the name; it caught this the
            moment it was built. The card is the photograph. */}
        <div className="rounded-2xl border border-edge bg-elevated p-3">
          {/* The portrait is a cut-out with a transparent background, so the
              frame has to supply one or the card shows through the subject.
              A gradient rather than flat black, so it reads as a lit backdrop
              rather than a hole. */}
          <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-gradient-to-b from-surface to-void">
            {image}
          </div>
        </div>
      </CometCard>
    </div>
  );
}
