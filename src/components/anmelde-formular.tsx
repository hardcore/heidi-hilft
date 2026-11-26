'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { magicLinkSchema } from '@/lib/validation/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

type Werte = z.infer<typeof magicLinkSchema>;

export function AnmeldeFormular({ weiter }: { weiter?: string }) {
  const [verschickt, setVerschickt] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [erneutMoeglich, setErneutMoeglich] = useState(false);

  const form = useForm<Werte>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: '' },
  });

  async function absenden(werte: Werte) {
    setFehler(null);
    try {
      const antwort = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...werte, weiter }),
      });

      if (antwort.status === 429) {
        setFehler(
          'Du hast gerade mehrere Links angefordert. Bitte versuche es in einer Minute erneut.',
        );
        return;
      }

      if (!antwort.ok) {
        setFehler('Das hat nicht geklappt. Bitte versuche es erneut.');
        return;
      }

      setVerschickt(true);
      // Erneut senden erst nach 60 Sekunden – so lange greift ohnehin die
      // Versandbremse von Supabase.
      setErneutMoeglich(false);
      setTimeout(() => setErneutMoeglich(true), 60_000);
    } catch {
      setFehler(
        'Keine Verbindung zum Server. Prüfe deine Internetverbindung und versuche es erneut.',
      );
    }
  }

  if (verschickt) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-medium">Schau in dein Postfach</h2>
          <p className="text-muted-foreground">
            Wenn die Adresse bei uns hinterlegt ist, liegt dort jetzt ein Anmeldelink
            für <span className="font-medium text-foreground">{form.getValues('email')}</span>.
            Der Link gilt 60 Minuten und lässt sich einmal verwenden.
          </p>
          <p className="text-muted-foreground">
            Nichts angekommen? Dann schau bitte auch im <b>Spam-Ordner</b> nach.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={!erneutMoeglich}
            onClick={() => form.handleSubmit(absenden)()}
          >
            {erneutMoeglich ? 'Link erneut senden' : 'Erneut senden in einer Minute'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setVerschickt(false);
              setFehler(null);
            }}
          >
            Andere Adresse
          </Button>
        </div>

        {fehler && (
          <Alert variant="destructive">
            <AlertDescription>{fehler}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(absenden)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">E-Mail-Adresse</Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoFocus
          placeholder="buero@betrieb.de"
          aria-invalid={!!form.formState.errors.email}
          aria-describedby={form.formState.errors.email ? 'email-fehler' : undefined}
          className="h-11"
          {...form.register('email')}
        />
        {form.formState.errors.email && (
          <p id="email-fehler" role="alert" className="text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      {fehler && (
        <Alert variant="destructive">
          <AlertDescription>{fehler}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="h-11 w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Wird verschickt …' : 'Anmeldelink senden'}
      </Button>

      <p className="text-sm text-muted-foreground">
        Du brauchst kein Passwort. Wir schicken dir einen Link, mit dem du dich anmeldest.
      </p>
    </form>
  );
}
