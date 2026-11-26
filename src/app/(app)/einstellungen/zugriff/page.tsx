import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSessionContext } from '@/lib/auth/session';
import { SupportFreigabe } from '@/components/support-freigabe';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = { title: 'Zugriff · Heidi' };

const AKTION: Record<string, string> = {
  view: 'angesehen',
  export: 'exportiert',
  grant: 'Freigabe erteilt',
  revoke: 'Freigabe widerrufen',
  login: 'angemeldet',
};

export default async function ZugriffSeite() {
  const session = await getSessionContext();
  if (!session) redirect('/anmelden');

  const tenant = session.activeTenant;
  if (!tenant) redirect('/');
  if (session.activeRole !== 'tenant_admin') redirect('/');

  const supabase = await createClient();

  const [{ data: freigaben }, { data: eintraege }] = await Promise.all([
    supabase
      .from('support_grants')
      .select('id, granted_at, expires_at, revoked_at')
      .eq('tenant_id', tenant.id)
      .is('revoked_at', null)
      .order('granted_at', { ascending: false })
      .limit(1),
    supabase
      .from('access_log')
      .select('id, actor_email, as_platform_admin, area, action, occurred_at')
      .eq('tenant_id', tenant.id)
      .order('occurred_at', { ascending: false })
      .limit(200),
  ]);

  const laufend = (freigaben ?? []).find(
    (g) => new Date(g.expires_at).getTime() > Date.now(),
  );

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-medium tracking-tight">Zugriff und Protokoll</h1>
        <p className="text-muted-foreground">{tenant.name}</p>
      </div>

      <section className="rounded-xl border bg-card p-6">
        <h2 className="mb-3 text-lg font-medium">Support-Einblick für AWSMD</h2>
        <SupportFreigabe
          tenantId={tenant.id}
          laeuftBis={laufend?.expires_at ?? null}
        />
      </section>

      <section className="rounded-xl border bg-card">
        <div className="space-y-1 border-b px-6 py-4">
          <h2 className="text-lg font-medium">Zugriffsprotokoll</h2>
          <p className="text-sm text-muted-foreground">
            Nur anfügbar – Einträge lassen sich nicht ändern oder löschen, auch
            nicht von AWSMD. Höchstens die letzten 200 Einträge.
          </p>
        </div>

        {!eintraege || eintraege.length === 0 ? (
          <p className="px-6 py-10 text-center text-muted-foreground">
            Noch keine Einträge. Hier erscheint jeder Zugriff auf die Daten dieses
            Betriebs.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Wann</TableHead>
                <TableHead>Wer</TableHead>
                <TableHead>Was</TableHead>
                <TableHead>Bereich</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eintraege.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {new Date(e.occurred_at).toLocaleString('de-DE', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </TableCell>
                  <TableCell>
                    <span className="flex flex-wrap items-center gap-2">
                      {e.actor_email}
                      {e.as_platform_admin && <Badge variant="outline">AWSMD</Badge>}
                    </span>
                  </TableCell>
                  <TableCell>{AKTION[e.action] ?? e.action}</TableCell>
                  <TableCell className="text-muted-foreground">{e.area}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
