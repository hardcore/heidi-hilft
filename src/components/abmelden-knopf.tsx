'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export async function abmelden() {
  try {
    await fetch('/api/auth/abmelden', { method: 'POST' });
  } finally {
    // Harte Navigation, damit kein serverseitig zwischengespeicherter
    // Sitzungszustand zurückbleibt.
    window.location.href = '/anmelden?fehler=abgemeldet';
  }
}

export function AbmeldenKnopf({
  variant = 'outline',
}: {
  variant?: 'outline' | 'ghost';
}) {
  const [laeuft, setLaeuft] = useState(false);

  return (
    <Button
      type="button"
      variant={variant}
      className="h-11 rounded-control px-4 text-[15px]"
      onClick={() => {
        setLaeuft(true);
        void abmelden();
      }}
      disabled={laeuft}
    >
      {laeuft ? 'Wird abgemeldet …' : 'Abmelden'}
    </Button>
  );
}
