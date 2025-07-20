import * as React from 'react';

import { cn } from '@/lib/utils';

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const Label = ({ ref, className, children, htmlFor, ...props }: LabelProps & { ref?: React.RefObject<HTMLLabelElement | null> }) => {
  return (
    <label
      ref={ref}
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      htmlFor={htmlFor}
      {...props}
    >
      {children}
    </label>
  );
};

Label.displayName = 'Label';

export { Label };
