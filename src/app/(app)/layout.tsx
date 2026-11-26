import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionContext } from '@/lib/auth/session';
import { AbmeldenKnopf } from '@/components/abmelden-knopf';
import { MandantenWechsler } from '@/components/mandanten-wechsler';

/**
 * Zugangskontrolle für den gesamten geschützten Bereich.
 *
 * Die Middleware schickt Nicht-Angemeldete schon vorher zur Anmeldung. Diese
 * Prüfung ist die zweite Schicht und entscheidet zusätzlich über Mitgliedschaft
 * und Zustand des Betriebs. Die dritte und eigentliche Schicht sind die
 * Zugriffsregeln der Datenbank – ohne Mitgliedschaft gäbe es ohnehin keine Daten.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionContext();

  if (!session) redirect('/anmelden');

  if (session.memberships.length === 0 && !session.isPlatformAdmin) {
    redirect('/kein-betrieb');
  }

  if (session.activeTenant?.status === 'suspended') {
    redirect('/betrieb-gesperrt');
  }

  const tenants = session.memberships.map((m) => ({
    id: m.tenant.id,
    name: m.tenant.name,
    shortName: m.tenant.short_name,
    status: m.tenant.status,
    role: m.role,
  }));

  return (
    <div className="min-h-dvh bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <span
              aria-hidden="true"
              className="grid size-7 place-items-center rounded-md bg-[#7356F1] text-xs font-semibold text-white"
            >
              H
            </span>
            Heidi
          </Link>

          {session.activeTenant && (
            <span className="text-muted-foreground">
              <span aria-hidden="true" className="mx-1">
                ·
              </span>
              {session.activeTenant.name}
            </span>
          )}

          <div className="ml-auto flex flex-wrap items-center gap-3">
            <MandantenWechsler
              tenants={tenants}
              aktiv={session.activeTenant?.id ?? null}
            />
            {session.activeRole === 'tenant_admin' && (
              <Link
                href="/einstellungen/zugriff"
                className="text-sm underline-offset-4 hover:underline"
              >
                Zugriff
              </Link>
            )}
            {session.isPlatformAdmin && (
              <Link
                href="/verwaltung/betriebe"
                className="text-sm underline-offset-4 hover:underline"
              >
                Betriebe
              </Link>
            )}
            <AbmeldenKnopf variant="ghost" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
