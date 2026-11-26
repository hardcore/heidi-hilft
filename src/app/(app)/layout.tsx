import { redirect } from 'next/navigation';
import { getSessionContext } from '@/lib/auth/session';
import { AppShell } from '@/components/shell/app-shell';

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
    <AppShell
      daten={{
        email: session.email,
        rolle: session.activeRole,
        istPlattformAdmin: session.isPlatformAdmin,
        tenants,
        aktiverBetrieb: session.activeTenant?.id ?? null,
      }}
    >
      {children}
    </AppShell>
  );
}
