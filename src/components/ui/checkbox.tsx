import * as React from 'react';

import { cn } from '@/lib/utils';

type CheckboxProps = {} & React.InputHTMLAttributes<HTMLInputElement>;

const Checkbox = ({ ref, className, ...props }: CheckboxProps & { ref?: React.RefObject<HTMLInputElement | null> }) => {
  return (
    <input
      type="checkbox"
      ref={ref}
      className={cn(
        'peer h-4 w-4 shrink-0 rounded-sm border border-input bg-transparent shadow-sm transition-all',
        'checked:bg-primary checked:text-primary-foreground',
        'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
};

Checkbox.displayName = 'Checkbox';

export { Checkbox };
