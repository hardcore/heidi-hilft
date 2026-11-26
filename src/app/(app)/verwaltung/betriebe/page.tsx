import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSessionContext } from '@/lib/auth/session';
import { BetriebAnlegenFormular } from '@/components/betrieb-anlegen-formular';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = { title: 'Betriebe · Heidi' };

/**
 * Betriebsübersicht für AWSMD.
 *
 * Gelesen wird direkt über den Supabase-Client dieser Anfrage, nicht über die
 * eigene API-Route: beides läuft durch dieselben Zugriffsregeln, aber der direkte
 * Weg spart einen HTTP-Umweg und braucht keine absolute Adresse. Schreibende
 * Vorgänge aus dem Browser gehen weiter über /api/admin/tenants.
 */
export default async function BetriebeSeite() {
  const session = await getSessionContext();
  if (!session) redirect('/anmelden');
  if (!session.isPlatformAdmin) redirect('/');

  const supabase = await createClient();
  const { data: betriebe } = await supabase
    .from('tenants')
    .select('id, name, short_name, status, created_at')
    .order('name', { ascending: true })
    .limit(500);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-medium tracking-tight">Betriebe</h1>
        <p className="text-muted-foreground">
          Du siehst hier Stammdaten und Zustand – keine Gesprächsinhalte, Namen
          oder Telefonnummern. Dafür braucht es eine Freigabe des Kunden.
        </p>
      </div>

      <section className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-medium">Neuen Betrieb anlegen</h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          Der Betrieb ist sofort aktiv, der erste Kunden-Admin bekommt eine
          Einladung per E-Mail.
        </p>
        <BetriebAnlegenFormular />
      </section>

      <section className="rounded-xl border bg-card">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-medium">
            Alle Betriebe{' '}
            <span className="font-normal text-muted-foreground">
              ({betriebe?.length ?? 0})
            </span>
          </h2>
        </div>

        {!betriebe || betriebe.length === 0 ? (
          <p className="px-6 py-10 text-center text-muted-foreground">
            Noch kein Betrieb angelegt. Fang mit dem Pilotbetrieb an.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Kürzel</TableHead>
                <TableHead>Zustand</TableHead>
                <TableHead>Angelegt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {betriebe.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {b.short_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant={b.status === 'active' ? 'secondary' : 'destructive'}>
                      {b.status === 'active' ? 'aktiv' : 'gesperrt'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(b.created_at).toLocaleDateString('de-DE')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
