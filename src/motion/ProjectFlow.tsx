import FlowingMenu from '@/components/reactbits/FlowingMenu/FlowingMenu';
import { useMotionAllowed } from '@/hooks/useMotionAllowed';

export interface FlowItem {
  id: string;
  title: string;
  image: string;
  dimmed: boolean;
  onSelect: () => void;
}

/** Row height. Five rows at 76px is 380px for what took 1425px as tiles. */
const ROW = 76;

/**
 * The quieter projects, as rows that show their screenshot on hover.
 *
 * Curiosity by construction: the names are all readable at once, and the thing
 * a reader wonders — what does it look like — arrives when they reach for it.
 * The full story is a click away in the dialog, as before.
 *
 * Needs a hovering pointer as well as permission to animate. On a touch screen
 * the reveal has nothing to trigger it, so the plain list ships instead — and
 * the plain list is not a degraded version, it is the same names and the same
 * controls without a decoration nobody could see.
 *
 * Colours are passed as tokens rather than resolved values: these land in CSS,
 * not on a canvas, so `var()` works. The canvas components in this project need
 * `cssToken` for exactly the opposite reason.
 */
export default function ProjectFlow({ items }: { items: FlowItem[] }) {
  const { animate, hover } = useMotionAllowed();

  if (!animate || !hover) {
    return (
      <ul className="divide-y divide-edge border-y border-edge">
        {items.map((item) => (
          <li key={item.id}>
            <article
              data-dimmed={item.dimmed ? 'true' : undefined}
              className={`transition-opacity duration-150 ${
                item.dimmed ? 'opacity-40' : 'opacity-100'
              }`}
            >
              <h3>
                <button
                  type="button"
                  onClick={item.onSelect}
                  className="flex min-h-[76px] w-full items-center justify-center text-xl font-semibold uppercase text-primary md:text-3xl"
                >
                  {item.title}
                </button>
              </h3>
            </article>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div style={{ height: items.length * ROW }}>
      <FlowingMenu
        items={items.map((item) => ({
          id: item.id,
          text: item.title,
          image: item.image,
          dimmed: item.dimmed,
          onSelect: item.onSelect,
        }))}
        speed={18}
        bgColor="transparent"
        textColor="var(--color-primary)"
        marqueeBgColor="var(--color-accent)"
        marqueeTextColor="var(--color-void)"
        borderColor="var(--color-edge)"
      />
    </div>
  );
}
