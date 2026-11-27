import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D3B2E] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-[#0D3B2E] text-white hover:bg-[#092A20]',
        secondary: 'border border-[#CFCAC0] bg-white text-[#111827] hover:bg-[#F3F1EC]',
        accent: 'bg-[#D97706] text-white hover:bg-amber-700',
        destructive: 'bg-rose-700 text-white hover:bg-rose-800',
        ghost: 'text-[#4B5563] hover:bg-[#F3F1EC] hover:text-[#111827]',
        outline: 'border border-[#E5E2DC] bg-transparent text-[#111827] hover:bg-[#F3F1EC]',
        link: 'text-[#0D3B2E] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-6',
        icon: 'h-9 w-9',
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
