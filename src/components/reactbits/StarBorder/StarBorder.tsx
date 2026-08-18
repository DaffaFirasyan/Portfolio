import React from 'react';

type StarBorderProps<T extends React.ElementType> = React.ComponentPropsWithoutRef<T> & {
  as?: T;
  className?: string;
  children?: React.ReactNode;
  color?: string;
  speed?: React.CSSProperties['animationDuration'];
  thickness?: number;
};

const StarBorder = <T extends React.ElementType = 'button'>({
  as,
  className = '',
  color = 'white',
  speed = '6s',
  thickness = 1,
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = as || 'button';

  // Upstream spreads `rest` through two `any` casts, which this project's
  // ESLint config rejects. The props of a polymorphic component cannot be
  // narrowed here, but `unknown` records carry the same information without
  // switching type checking off.
  const passthrough = rest as Record<string, unknown>;
  const inheritedStyle = (rest as { style?: React.CSSProperties }).style;

  return (
    <Component
      className={`relative inline-block overflow-hidden ${className}`}
      {...passthrough}
      style={{
        padding: `${thickness}px 0`,
        ...inheritedStyle,
      }}
    >
      <div
        className="absolute w-[300%] h-[50%] opacity-70 bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      ></div>
      <div
        className="absolute w-[300%] h-[50%] opacity-70 top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      ></div>
      {/* Appearance stripped. Upstream this div carried the whole look of a
          button — a black gradient, a gray border, white 16px text and its own
          padding and radius — which would have wrapped the real control in a
          second, differently styled box. Same objection as SpotlightCard's
          hardcoded bg-neutral-900. What is left is the stacking context that
          keeps the content above the two travelling gradients. */}
      <div className="relative z-[1]">{children}</div>
    </Component>
  );
};

export default StarBorder;

// The animate-star-movement-* utilities this renders are defined in
// src/index.css, as @keyframes plus --animate-* theme keys. Tailwind v4 is
// CSS-first; the JavaScript config block that shipped with this file was v3
// syntax and has been removed rather than left as a misleading instruction.
