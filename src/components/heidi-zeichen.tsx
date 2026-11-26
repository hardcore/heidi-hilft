import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Marke: violettes Quadrat mit Sprechblase, daneben optional der Schriftzug. */
export function HeidiZeichen({
  mitName = true,
  className,
}: {
  mitName?: boolean;
  className?: string;
}) {
  return (
    <span className={cn('flex items-center gap-3', className)}>
      <span
        aria-hidden="true"
        className="grid size-[30px] shrink-0 place-items-center rounded-icon bg-h-accent text-h-on-accent"
      >
        <MessageCircle className="size-4" strokeWidth={2.4} />
      </span>
      {mitName && <span className="text-xl font-medium text-h-text">Heidi</span>}
    </span>
  );
}
