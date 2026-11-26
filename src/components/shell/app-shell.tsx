'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet';
import { HeidiZeichen } from '@/components/heidi-zeichen';
import type { WechslerEintrag } from '@/components/mandanten-wechsler';
import { navigationFuer, seiteFuer } from '@/lib/navigation';
import type { MembershipRole } from '@/lib/supabase/types';
import { Seitenleiste } from './seitenleiste';

export interface ShellDaten {
  email: string;
  rolle: MembershipRole | null;
  istPlattformAdmin: boolean;
  tenants: WechslerEintrag[];
  aktiverBetrieb: string | null;
}

export function AppShell({
  daten,
  children,
}: {
  daten: ShellDaten;
  children: React.ReactNode;
}) {
  const pfad = usePathname();
  const [mobilOffen, setMobilOffen] = useState(false);
  const gruppen = navigationFuer({
    rolle: daten.rolle,
    istPlattformAdmin: daten.istPlattformAdmin,
  });
  const seite = seiteFuer(gruppen, pfad);

  return (
    <div className="min-h-dvh bg-h-canvas lg:p-6">
      <div className="mx-auto flex min-h-dvh max-w-shell overflow-hidden bg-h-shell lg:min-h-[calc(100dvh-3rem)] lg:rounded-shell lg:border lg:border-h-border lg:shadow-shell">
        <aside className="hidden w-[272px] shrink-0 border-r border-h-border lg:flex">
          <Seitenleiste daten={daten} gruppen={gruppen} pfad={pfad} />
        </aside>

        <Sheet open={mobilOffen} onOpenChange={setMobilOffen}>
          <SheetContent
            side="left"
            className="w-[288px] border-h-border bg-h-shell p-0 text-h-text"
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SheetDescription className="sr-only">
              Hauptnavigation und Betriebsauswahl
            </SheetDescription>
            <Seitenleiste
              daten={daten}
              gruppen={gruppen}
              pfad={pfad}
              onNavigiert={() => setMobilOffen(false)}
            />
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center gap-3 border-b border-h-border px-4 sm:px-6 lg:h-[72px] lg:px-8">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-11 rounded-control text-h-text-soft lg:hidden"
              onClick={() => setMobilOffen(true)}
              aria-label="Navigation öffnen"
            >
              <Menu className="size-5" />
            </Button>
            <HeidiZeichen mitName={false} className="lg:hidden" />
            {seite && (
              <p className="flex min-w-0 items-center gap-2 text-[15px]">
                {seite.gruppe && (
                  <>
                    <span className="hidden text-h-text-muted sm:inline">{seite.gruppe}</span>
                    <span aria-hidden="true" className="hidden text-h-text-muted sm:inline">
                      /
                    </span>
                  </>
                )}
                <span className="truncate font-medium text-h-text">{seite.titel}</span>
              </p>
            )}
          </header>

          <main id="inhalt" className="flex-1 overflow-y-auto bg-h-surface">
            <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
