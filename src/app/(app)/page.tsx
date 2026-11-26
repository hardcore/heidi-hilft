import Link from 'next/link';
import { getSessionContext } from '@/lib/auth/session';

const ROLLENTEXT = {
  tenant_admin: 'Kunden-Admin',
  tenant_member: 'Mitarbeiter',
} as const;

export default async function StartSeite() {
  const session = await getSessionContext();
  if (!session) return null;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-medium tracking-tight">
          {session.activeTenant
            ? session.activeTenant.name
            : 'Plattform-Verwaltung'}
        </h1>
        <p className="text-muted-foreground">
          Angemeldet als {session.email}
          {session.activeRole ? ` · ${ROLLENTEXT[session.activeRole]}` : ''}
          {session.isPlatformAdmin ? ' · AWSMD' : ''}
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-medium">Fundament steht</h2>
        <p className="mt-2 text-muted-foreground">
          Anmeldung, Mandantentrennung und Rollen sind fertig (PROJ-1). Als
          Nächstes kommen das Design-System und die Oberfläche (PROJ-2), danach
          Wissensbasis, WhatsApp-Anbindung und das Gesprächs-Postfach.
        </p>
        {session.isPlatformAdmin && (
          <p className="mt-4">
            <Link
              href="/verwaltung/betriebe"
              className="underline underline-offset-4"
            >
              Betriebe verwalten
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
