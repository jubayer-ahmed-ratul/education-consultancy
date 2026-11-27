import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-teal-600 text-white shadow-xs hover:bg-teal-700',
        secondary: 'bg-white text-gray-900 ring-1 ring-inset ring-gray-300 shadow-xs hover:bg-gray-50',
        accent: 'bg-teal-600 text-white shadow-xs hover:bg-teal-700',
        destructive: 'bg-rose-600 text-white shadow-xs hover:bg-rose-700',
        ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-950',
        outline: 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50',
        link: 'text-teal-600 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-10 rounded-lg px-6',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
);
Button.displayName = 'Button';
