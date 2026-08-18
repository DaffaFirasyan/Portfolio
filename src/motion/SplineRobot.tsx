import { useMotionAllowed } from '@/hooks/useMotionAllowed';

/**
 * A Spline public-view URL, embedded directly.
 *
 * Not `@splinetool/react-spline`, and that is the point. That component needs a
 * `.splinecode` asset, which is what Spline's "Code / React" export produces;
 * this URL is the "Public URL" export instead — a self-contained 1 MB HTML
 * document with the scene compiled into it, containing no `.splinecode`
 * reference at all. Fetching it and searching confirmed that: zero occurrences.
 *
 * Embedding it as a document rather than importing a runtime deleted both
 * `@splinetool/react-spline` and `@splinetool/runtime` from this project.
 * Their chunks were 571 KB and 734 KB gzip. The scene still costs what it
 * costs, but it is now downloaded and executed by the iframe's own document
 * instead of by this page's main thread and bundle graph.
 *
 * What comes with that trade: a Spline watermark links out of the frame, and
 * the scene is a third-party document in the page. Its own background is
 * rgb(9.5, 10.7, 20) against this site's rgb(10, 12, 16), which is close
 * enough that the frame edge does not read as a seam.
 *
 * Swapping scenes is still one line: publish from Spline and paste the URL.
 */
const SCENE = 'https://my.spline.design/darkspideycopy-P1lVDG8ytTTrQA0n72QOQIcb/';

/**
 * The interactive scene at the foot of the contact column.
 *
 * No border and no background. It had both, and framing it made it read as a
 * picture of a robot hung on the page rather than something standing in it.
 *
 * It bleeds into the section's bottom padding instead, so its base meets the
 * footer's border exactly. The offset is not a tuned number: `-mb-20 md:-mb-32`
 * is precisely the `py-20 md:py-32` that `SectionShell` applies, so the two
 * cancel and the frame lands on the section's own bottom edge — measured at
 * 1280, the grid sits exactly 128px above the footer, which is that padding.
 * `overflow-hidden` means anything reaching past that line is cut at it rather
 * than pushing into the footer, which the owner asked for explicitly.
 *
 * Mounted as soon as the capability gate passes rather than on arrival, so it
 * is ready before the reader scrolls and is never torn down and rebuilt by
 * scrolling away and back.
 *
 * `webgl && hover` still gates it: a phone spends nothing on a scene it cannot
 * rotate, and reduced motion, low memory, few cores and Save-Data are honoured
 * through the same flag.
 */
export default function SplineRobot() {
  const { webgl, hover } = useMotionAllowed();

  if (!webgl || !hover) return null;

  return (
    <div
      aria-hidden="true"
      className="-mb-20 h-[32rem] w-full overflow-hidden md:-mb-32"
    >
      <iframe
        src={SCENE}
        title="Interactive 3D scene"
        loading="eager"
        // The scene's own document is what needs to be reachable; nothing is
        // sent to it and no referrer is leaked to a third party.
        referrerPolicy="no-referrer"
        className="h-full w-full border-0"
      />
    </div>
  );
}
