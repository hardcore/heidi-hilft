'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ROLLE,
  useBetriebWechsel,
  type WechslerEintrag,
} from '@/components/mandanten-wechsler';
import { kuerzelVon } from '@/lib/navigation';
import { cn } from '@/lib/utils';

function Kuerzel({ eintrag }: { eintrag: WechslerEintrag }) {
  return (
    <span
      aria-hidden="true"
      className="grid size-10 shrink-0 place-items-center rounded-avatar bg-h-accent/15 font-mono text-sm font-medium text-h-accent-text"
    >
      {kuerzelVon(eintrag.name, eintrag.shortName)}
    </span>
  );
}

/** Aktiver Betrieb oben in der Sidebar; bei mehreren zugleich der Wechsler. */
export function Betriebskarte({
  tenants,
  aktiv,
}: {
  tenants: WechslerEintrag[];
  aktiv: string | null;
}) {
  const { wert, wechseln, laeuft } = useBetriebWechsel(aktiv);
  const aktuell = tenants.find((t) => t.id === wert);

  if (!aktuell) {
    return (
      <div className="flex items-center gap-3 rounded-card border border-h-border bg-h-surface-2 p-3">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-avatar bg-h-surface-3 font-mono text-sm text-h-text-muted"
        >
          AW
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-medium text-h-text">
            Plattform-Verwaltung
          </span>
          <span className="block text-sm text-h-text-muted">Kein Betrieb aktiv</span>
        </span>
      </div>
    );
  }

  const inhalt = (
    <>
      <Kuerzel eintrag={aktuell} />
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-[15px] font-medium text-h-text">{aktuell.name}</span>
        <span className="block text-sm text-h-text-muted">
          {ROLLE[aktuell.role]}
          {aktuell.status === 'suspended' ? ' · gesperrt' : ''}
        </span>
      </span>
    </>
  );

  if (tenants.length <= 1) {
    return (
      <div className="flex items-center gap-3 rounded-card border border-h-border bg-h-surface-2 p-3">
        {inhalt}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={laeuft}
        aria-label={`Betrieb wechseln, aktuell ${aktuell.name}`}
        className="flex w-full items-center gap-3 rounded-card border border-h-border bg-h-surface-2 p-3 transition-colors hover:bg-h-surface-hover disabled:opacity-60"
      >
        {inhalt}
        <ChevronsUpDown aria-hidden="true" className="size-4 shrink-0 text-h-text-muted" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px] rounded-control">
        <DropdownMenuLabel className="mono-label text-xs">Betrieb wechseln</DropdownMenuLabel>
        {tenants.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onSelect={() => void wechseln(t.id)}
            className="gap-3 py-2"
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate">{t.name}</span>
              <span className="block text-xs text-h-text-muted">
                {ROLLE[t.role]}
                {t.status === 'suspended' ? ' · gesperrt' : ''}
              </span>
            </span>
            <Check
              aria-hidden="true"
              className={cn('size-4 text-h-accent-text', t.id === wert ? 'opacity-100' : 'opacity-0')}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
