'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { MembershipRole, TenantStatus } from '@/lib/supabase/types';

export interface WechslerEintrag {
  id: string;
  name: string;
  shortName: string;
  status: TenantStatus;
  role: MembershipRole;
}

export const ROLLE: Record<MembershipRole, string> = {
  tenant_admin: 'Admin',
  tenant_member: 'Mitarbeiter',
};

/**
 * Wechsel des aktiven Betriebs.
 *
 * Der Wechsel geht über den Server: der aktive Betrieb steht im Profil, nicht im
 * Browser – ein Browserwert ließe sich auf eine fremde Betriebskennung ändern.
 * Scheitert er, springt die Anzeige auf den bisherigen Betrieb zurück.
 */
export function useBetriebWechsel(aktiv: string | null) {
  const router = useRouter();
  const [laeuft, starten] = useTransition();
  const [wert, setWert] = useState(aktiv ?? undefined);

  async function wechseln(tenantId: string) {
    if (tenantId === wert) return;
    const vorher = wert;
    setWert(tenantId);

    let antwort: Response | null = null;
    try {
      antwort = await fetch('/api/tenants/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      });
    } catch {
      antwort = null;
    }

    if (!antwort?.ok) {
      setWert(vorher);
      toast.error(
        antwort?.status === 403
          ? 'Auf diesen Betrieb hast du keinen Zugriff.'
          : 'Der Wechsel hat nicht geklappt. Bitte versuche es erneut.',
      );
      return;
    }

    starten(() => {
      router.refresh();
      router.push('/');
    });
  }

  return { wert, wechseln, laeuft };
}

/** Auswahlfeld für Hinweisseiten ohne Sidebar (z. B. „Betrieb gesperrt"). */
export function MandantenWechsler({
  tenants,
  aktiv,
}: {
  tenants: WechslerEintrag[];
  aktiv: string | null;
}) {
  const { wert, wechseln, laeuft } = useBetriebWechsel(aktiv);

  if (tenants.length <= 1) return null;

  return (
    <Select value={wert} onValueChange={wechseln} disabled={laeuft}>
      <SelectTrigger className="h-11 w-full" aria-label="Betrieb wechseln">
        <SelectValue placeholder="Betrieb wählen" />
      </SelectTrigger>
      <SelectContent>
        {tenants.map((t) => (
          <SelectItem key={t.id} value={t.id}>
            <span className="flex items-center gap-2">
              <span>{t.name}</span>
              <span className="text-xs text-h-text-muted">
                {ROLLE[t.role]}
                {t.status === 'suspended' ? ' · gesperrt' : ''}
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
