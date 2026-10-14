import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, description, children, className }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-start sm:justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Box */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full max-w-lg my-auto max-h-[92vh] overflow-y-auto bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-2xl transition-all animate-in zoom-in-95 duration-200",
          className
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between mb-4">
            <div>
              {title && <h2 className="text-xl font-bold text-foreground">{title}</h2>}
              {description && <p className="text-sm text-muted mt-1">{description}</p>}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Fechar modal"
              className="text-muted hover:text-foreground h-8 w-8 -mr-2 -mt-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className={cn(title || description ? "mt-2" : "")}>{children}</div>
      </div>
    </div>
  );
}
