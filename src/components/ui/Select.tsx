import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={generatedId} className="block text-xs font-semibold text-muted uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={generatedId}
            ref={ref}
            className={cn(
              "w-full appearance-none bg-surface text-foreground text-base sm:text-sm rounded-xl border border-border px-4 h-11 sm:h-10 pr-10 transition-all duration-200",
              "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary",
              "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
              error && "border-red-500/60 focus:border-red-500",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-card text-foreground">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
