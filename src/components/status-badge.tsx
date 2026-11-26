import { cn } from '@/lib/utils';

const TON = {
  aktiv: { punkt: 'bg-h-success', text: 'text-h-success-text' },
  gesperrt: { punkt: 'bg-h-danger', text: 'text-h-danger' },
  neutral: { punkt: 'bg-h-text-muted', text: 'text-h-text-soft' },
} as const;

/** Status immer als Punkt **und** Wort – nie nur über Farbe. */
export function StatusBadge({
  ton,
  children,
  className,
}: {
  ton: keyof typeof TON;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-badge border border-h-border-strong px-2 py-0.5 text-sm',
        TON[ton].text,
        className,
      )}
    >
      <span aria-hidden="true" className={cn('size-1.5 rounded-full', TON[ton].punkt)} />
      {children}
    </span>
  );
}
