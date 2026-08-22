export {
  FocusGrid as default,
  FocusItem,
} from '@/components/aceternity/FocusCards/FocusCards';

/**
 * The seam for Aceternity's Focus Cards.
 *
 * Sections may not import `src/components/aceternity/` directly — ESLint fails
 * the build on it — so this is the one file that names it. The component needed
 * no behavioural wrapper of its own: it takes no capability decision, runs no
 * render loop, and its only animation is a CSS transition, which
 * `motion-reduce:transition-none` already answers inside it.
 *
 * That makes this a re-export rather than a wrapper, and it is worth saying so
 * plainly instead of inventing a component to justify the file.
 */
