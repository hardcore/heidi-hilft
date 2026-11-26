import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getSessionContext } from '@/lib/auth/session';
import { StatusBadge } from '@/components/status-badge';

const ROLLENTEXT = {
  tenant_admin: 'Kunden-Admin',
  tenant_member: 'Mitarbeiter',
} as const;

export default async function StartSeite() {
  const session = await getSessionContext();
  if (!session) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="mono-label">Start</p>
        <h1 className="text-seitentitel text-h-text">
          {session.activeTenant ? session.activeTenant.name : 'Plattform-Verwaltung'}
        </h1>
        <p className="text-beschreibung text-h-text-muted">
          Angemeldet als {session.email}
          {session.activeRole ? ` · ${ROLLENTEXT[session.activeRole]}` : ''}
          {session.isPlatformAdmin ? ' · AWSMD' : ''}
        </p>
      </div>

      <section className="rounded-panel border border-h-border bg-h-surface-2 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-kartentitel text-h-text">Fundament steht</h2>
          <StatusBadge ton="aktiv">Bereit</StatusBadge>
        </div>
        <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-h-text-soft">
          Anmeldung, Mandantentrennung, Rollen und die Oberfläche sind fertig. Als Nächstes
          kommen Wissensbasis, WhatsApp-Anbindung und das Gesprächs-Postfach.
        </p>
        {session.isPlatformAdmin && (
          <Link
            href="/verwaltung/betriebe"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-control bg-h-accent px-4 text-[15px] font-medium text-h-on-accent transition-colors hover:bg-h-accent-soft"
          >
            Betriebe verwalten
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        )}
      </section>
    </div>
  );
}
