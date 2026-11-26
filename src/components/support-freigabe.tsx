'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

/**
 * Freigabe und Widerruf des Support-Einblicks.
 *
 * Das Erteilen wird abgefragt, weil es fremden Menschen Einblick in
 * Kundengespräche gibt. Das Widerrufen wird nicht abgefragt – die sichere
 * Richtung braucht keine Hürde.
 */
export function SupportFreigabe({
  tenantId,
  laeuftBis,
}: {
  tenantId: string;
  laeuftBis: string | null;
}) {
  const router = useRouter();
  const [laeuft, setLaeuft] = useState(false);

  async function senden(methode: 'POST' | 'DELETE') {
    setLaeuft(true);
    try {
      const antwort = await fetch('/api/support-grants', {
        method: methode,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      });

      if (!antwort.ok) {
        const daten = await antwort.json().catch(() => ({}));
        toast.error(daten.error ?? 'Das hat nicht geklappt.');
        return;
      }

      toast.success(
        methode === 'POST'
          ? 'AWSMD hat für 24 Stunden Einblick. Du kannst das jederzeit widerrufen.'
          : 'Der Einblick ist beendet.',
      );
      router.refresh();
    } finally {
      setLaeuft(false);
    }
  }

  if (laeuftBis) {
    return (
      <div className="space-y-3">
        <p>
          AWSMD hat Einblick bis{' '}
          <b>
            {new Date(laeuftBis).toLocaleString('de-DE', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </b>
          . Jeder Zugriff steht unten im Protokoll.
        </p>
        <Button
          type="button"
          variant="destructive"
          className="h-11"
          disabled={laeuft}
          onClick={() => senden('DELETE')}
        >
          {laeuft ? 'Wird widerrufen …' : 'Einblick sofort beenden'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground">
        AWSMD sieht derzeit nur Zahlen – keine Nachrichten, keine Namen, keine
        Telefonnummern. Für einen Supportfall kannst du den Einblick befristet
        öffnen.
      </p>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" className="h-11" disabled={laeuft}>
            Für 24 Stunden freigeben
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Einblick für 24 Stunden freigeben?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  AWSMD kann dann die Gespräche dieses Betriebs lesen – mit
                  Namen und Telefonnummern deiner Kundschaft.
                </p>
                <p>
                  Die Freigabe endet nach 24 Stunden von selbst. Jeder Zugriff
                  wird protokolliert, und das Protokoll kann niemand löschen,
                  auch AWSMD nicht.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={() => senden('POST')}>
              Freigeben
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
