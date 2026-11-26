'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import type { z } from 'zod';
import { createTenantSchema } from '@/lib/validation/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Werte = z.input<typeof createTenantSchema>;

export function BetriebAnlegenFormular() {
  const router = useRouter();
  const form = useForm<Werte>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: { name: '', shortName: '', adminEmail: '' },
  });

  async function absenden(werte: Werte) {
    const antwort = await fetch('/api/admin/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(werte),
    });

    if (!antwort.ok) {
      const daten = await antwort.json().catch(() => ({}));
      toast.error(daten.error ?? 'Der Betrieb konnte nicht angelegt werden.');
      return;
    }

    const daten = await antwort.json();
    toast.success(
      `${daten.tenant.name} angelegt. Einladung an ${daten.invitedAdmin} verschickt.`,
    );
    form.reset();
    router.refresh();
  }

  const fehler = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(absenden)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <div className="space-y-2">
          <Label htmlFor="name">Name des Betriebs</Label>
          <Input
            id="name"
            className="h-11"
            placeholder="Fahrschule Muster"
            aria-invalid={!!fehler.name}
            {...form.register('name')}
          />
          {fehler.name && (
            <p role="alert" className="text-sm text-destructive">
              {fehler.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="shortName">Kürzel</Label>
          <Input
            id="shortName"
            className="h-11"
            placeholder="FM"
            maxLength={4}
            aria-invalid={!!fehler.shortName}
            {...form.register('shortName')}
          />
          {fehler.shortName && (
            <p role="alert" className="text-sm text-destructive">
              {fehler.shortName.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="adminEmail">E-Mail des ersten Kunden-Admins</Label>
        <Input
          id="adminEmail"
          type="email"
          className="h-11"
          placeholder="buero@fahrschule-muster.de"
          aria-invalid={!!fehler.adminEmail}
          aria-describedby="adminEmail-hinweis"
          {...form.register('adminEmail')}
        />
        {fehler.adminEmail ? (
          <p role="alert" className="text-sm text-destructive">
            {fehler.adminEmail.message}
          </p>
        ) : (
          <p id="adminEmail-hinweis" className="text-sm text-muted-foreground">
            Diese Person bekommt eine Einladung und wird Kunden-Admin. Ist die
            Adresse schon bei Heidi bekannt, entsteht kein zweites Konto, sondern
            eine weitere Mitgliedschaft.
          </p>
        )}
      </div>

      <Button type="submit" className="h-11" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Wird angelegt …' : 'Betrieb anlegen'}
      </Button>
    </form>
  );
}
