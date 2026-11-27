import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[#0D3B2E] text-white',
        secondary: 'border-[#E5E2DC] bg-[#F3F1EC] text-[#111827]',
        amber: 'border-amber-200 bg-[#FEF3C7] text-[#B45309]',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        destructive: 'border-rose-200 bg-rose-50 text-rose-800',
        outline: 'border-[#CFCAC0] bg-white text-[#4B5563]',
      },
    },
    defaultVariants: {
      variant: 'secondary',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
