import { cn } from '../../lib/utils';

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0D3B2E] text-xs font-bold text-white',
        className
      )}
    >
      {initials || 'ZC'}
    </div>
  );
}
