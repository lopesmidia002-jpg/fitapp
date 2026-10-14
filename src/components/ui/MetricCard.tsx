import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Card, CardContent } from './Card';
import { cn } from '../../lib/utils';

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number; // e.g. +12% or -5%
  changeLabel?: string; // e.g. "vs. mês anterior"
  icon: React.ReactNode;
  variant?: 'default' | 'primary' | 'warning' | 'danger';
  className?: string;
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel = 'vs. mês passado',
  icon,
  variant = 'default',
  className,
  onClick,
}: MetricCardProps) {
  const iconVariants = {
    default: "bg-surface text-foreground border-border",
    primary: "bg-primary/10 text-primary border-primary/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200 hover:border-primary/40",
        onClick && "cursor-pointer active:scale-[0.99]",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</p>
          <div className={cn("p-2.5 rounded-xl border flex items-center justify-center", iconVariants[variant])}>
            {icon}
          </div>
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <h4 className="text-2xl font-extrabold text-foreground tracking-tight">{value}</h4>
          {change !== undefined && (
            <div
              className={cn(
                "flex items-center text-xs font-semibold px-2 py-0.5 rounded-full",
                change > 0
                  ? "text-emerald-400 bg-emerald-500/10"
                  : change < 0
                  ? "text-rose-400 bg-rose-500/10"
                  : "text-muted bg-surface border border-border/40"
              )}
            >
              {change > 0 ? (
                <ArrowUpRight className="h-3 w-3 mr-0.5" />
              ) : change < 0 ? (
                <ArrowDownRight className="h-3 w-3 mr-0.5" />
              ) : (
                <Minus className="h-3 w-3 mr-0.5" />
              )}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>

        {changeLabel && (
          <p className="text-xs text-muted/70 mt-1 font-medium">{changeLabel}</p>
        )}
      </CardContent>
    </Card>
  );
}
