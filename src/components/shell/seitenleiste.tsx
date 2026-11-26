'use client';

import Link from 'next/link';
import { Building2, House, ShieldCheck, type LucideIcon } from 'lucide-react';
import { HeidiZeichen } from '@/components/heidi-zeichen';
import { istAktiv, type NavGruppe, type NavIcon } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import type { ShellDaten } from './app-shell';
import { Betriebskarte } from './betriebskarte';
import { Nutzermenue } from './nutzermenue';

const ICONS: Record<NavIcon, LucideIcon> = {
  start: House,
  zugriff: ShieldCheck,
  betriebe: Building2,
};

export function Seitenleiste({
  daten,
  gruppen,
  pfad,
  onNavigiert,
}: {
  daten: ShellDaten;
  gruppen: NavGruppe[];
  pfad: string;
  onNavigiert?: () => void;
}) {
  return (
    <div className="flex h-full w-full flex-col gap-6 p-4">
      <Link
        href="/"
        onClick={onNavigiert}
        className="rounded-control px-2 pt-2"
        aria-label="Heidi – zur Startseite"
      >
        <HeidiZeichen />
      </Link>

      <Betriebskarte tenants={daten.tenants} aktiv={daten.aktiverBetrieb} />

      <nav aria-label="Hauptnavigation" className="flex flex-1 flex-col gap-6 overflow-y-auto">
        {gruppen.map((g) => (
          <div key={g.titel ?? 'haupt'} className="flex flex-col gap-1">
            {g.titel && <h2 className="mono-label mb-1 px-3">{g.titel}</h2>}
            <ul className="flex flex-col gap-1">
              {g.eintraege.map((e) => {
                const aktiv = istAktiv(e.href, pfad);
                const Icon = ICONS[e.icon];
                return (
                  <li key={e.href}>
                    <Link
                      href={e.href}
                      onClick={onNavigiert}
                      aria-current={aktiv ? 'page' : undefined}
                      className={cn(
                        'flex h-11 items-center gap-3 rounded-control px-3 text-[15px] transition-colors',
                        aktiv
                          ? 'bg-h-surface-active font-medium text-h-text-strong'
                          : 'text-h-text-soft hover:bg-h-surface-hover hover:text-h-text',
                      )}
                    >
                      <Icon
                        aria-hidden="true"
                        className={cn('size-[18px]', aktiv ? 'text-h-accent-text' : 'text-h-text-muted')}
                      />
                      {e.titel}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <Nutzermenue
        email={daten.email}
        rolle={daten.rolle}
        istPlattformAdmin={daten.istPlattformAdmin}
      />
    </div>
  );
}
