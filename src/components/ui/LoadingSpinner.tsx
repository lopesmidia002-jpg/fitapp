import React from 'react';
import { cn } from '../../lib/utils';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', label, className }: LoadingSpinnerProps) {
  const sizes = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center p-6 space-y-3", className)}>
      <div
        className={cn(
          "rounded-full border-border border-t-primary animate-spin",
          sizes[size]
        )}
      />
      {label && <p className="text-xs font-semibold text-muted tracking-wide uppercase">{label}</p>}
    </div>
  );
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-surface/70 border border-border/50", className)}
      {...props}
    />
  );
}
