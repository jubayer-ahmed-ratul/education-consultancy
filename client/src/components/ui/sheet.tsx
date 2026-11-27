import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export function SheetContent({
  side = 'right',
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { side?: 'left' | 'right' }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px]" />
      <DialogPrimitive.Content
        className={cn(
          'fixed inset-y-0 z-50 flex w-full flex-col bg-white shadow-2xl border-[#E5E2DC] focus:outline-none',
          side === 'right' ? 'right-0 max-w-xl border-l' : 'left-0 max-w-xs border-r',
          className
        )}
        {...props}
      >
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-md p-1 text-[#6B7280] hover:bg-[#F3F1EC] hover:text-[#111827]">
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border-b border-[#E5E2DC] px-6 py-4 pr-12', className)} {...props} />;
}

export function SheetTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn('font-display text-base font-bold text-[#111827]', className)} {...props} />;
}
