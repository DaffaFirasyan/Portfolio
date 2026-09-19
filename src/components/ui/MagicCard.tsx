import React from 'react';

interface MagicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

/**
 * Clean, lightweight glassmorphism card container.
 * Free of heavy cursor-tracking overhead, optimized for smooth 60fps interaction.
 */
export default function MagicCard({
  children,
  className = '',
  ...props
}: MagicCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-edge/60 bg-surface/40 backdrop-blur-xl transition-colors duration-200 ${className}`}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}
