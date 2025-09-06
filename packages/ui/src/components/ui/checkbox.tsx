'use client';

import { Check } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../utils/cn';

interface CheckboxProperties {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProperties>(
  ({ checked = false, onCheckedChange, disabled = false, className, id }, reference) => {
    return (
      <button
        ref={reference}
        type="button"
        role="checkbox"
        aria-checked={checked}
        id={id}
        disabled={disabled}
        className={cn(
          'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          checked && 'bg-primary text-primary-foreground',
          className,
        )}
        onClick={() => onCheckedChange?.(!checked)}
      >
        {checked && (
          <Check className="h-3 w-3" strokeWidth={3} />
        )}
      </button>
    );
  },
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
