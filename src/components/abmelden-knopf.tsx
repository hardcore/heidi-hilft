'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function AbmeldenKnopf({
  variant = 'outline',
}: {
  variant?: 'outline' | 'ghost';
}) {
  const router = useRouter();
  const [laeuft, setLaeuft] = useState(false);

  async function abmelden() {
    setLaeuft(true);
    try {
      await fetch('/api/auth/abmelden', { method: 'POST' });
    } finally {
      // Harte Navigation, damit kein serverseitig zwischengespeicherter
      // Sitzungszustand zurückbleibt.
      window.location.href = '/anmelden?fehler=abgemeldet';
    }
    router.refresh();
  }

  return (
    <Button type="button" variant={variant} onClick={abmelden} disabled={laeuft}>
      {laeuft ? 'Wird abgemeldet …' : 'Abmelden'}
    </Button>
  );
}
