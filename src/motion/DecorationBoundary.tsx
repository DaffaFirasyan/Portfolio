import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  /** Named in the console so a failure says which decoration failed. */
  name: string;
  children: ReactNode;
}

interface State {
  failed: boolean;
}

/**
 * Stops a decoration from taking the page down with it.
 *
 * This exists because the page went blank and unresponsive when the globe
 * landed, and because until now **nothing in this project caught an error at
 * all** — a throw anywhere unmounted the whole tree.
 *
 * Be careful about what that does and does not explain. The confirmed cause of
 * that failure was a rebuild loop, fixed at its source and pinned by
 * `Globe.test.tsx`: the globe was torn down and re-created on every scroll
 * tick, re-sampling a 60,000 point map each time, which is enough to lock the
 * main thread on its own. A theory that it also exhausted the browser's WebGL
 * context limit was measured and **not** supported — this browser handed out 24
 * live contexts without complaint.
 *
 * So this boundary is defence in depth rather than the fix. It is worth having
 * regardless: a decoration should never be able to take a portfolio down, and
 * before this one could.
 *
 * **Nothing under here is content.** Every caller is `aria-hidden` — a
 * starfield, a globe, a cursor effect. Losing one costs a visual flourish and
 * costs the reader nothing else, so the fallback is deliberately `null` rather
 * than an apology box: a reader who never knew the globe existed should not be
 * told it is broken.
 *
 * It does not retry. A WebGL context that failed once fails the same way a
 * moment later, and a retry loop around a crashing render is how a stutter
 * becomes a hang.
 *
 * Do not wrap anything a reader came for. A contact form that silently renders
 * nothing is worse than one that throws loudly in development.
 */
export default class DecorationBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Kept, not swallowed. Silent degradation is how a decoration stays broken
    // for months — the page survives, so nobody finds out.
    console.error(`[decoration: ${this.props.name}] disabled after an error`, error, info);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
