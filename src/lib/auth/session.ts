import { createClient } from '@/lib/supabase/server';
import type {
  Membership,
  MembershipRole,
  SessionContext,
  Tenant,
} from '@/lib/supabase/types';

/**
 * Ermittelt serverseitig, wer angemeldet ist und in welchem Betrieb er gerade arbeitet.
 *
 * Der aktive Betrieb kommt aus dem Profil (`last_tenant_id`), nicht aus einem Wert
 * im Browser. Läge er im Browser, könnte man ihn auf die Kennung eines fremden
 * Betriebs ändern; die Zugriffsregeln würden das abfangen, aber es käme zu
 * halb geladenen, fremden Ansichten.
 */
export async function getSessionContext(): Promise<SessionContext | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, is_platform_admin, last_tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  const { data: rows } = await supabase
    .from('memberships')
    .select('*, tenant:tenants(*)')
    .eq('profile_id', user.id)
    .order('tenant(name)', { ascending: true });

  const memberships = (rows ?? []) as Array<Membership & { tenant: Tenant }>;

  const activeMembership =
    memberships.find((m) => m.tenant_id === profile.last_tenant_id) ??
    memberships[0] ??
    null;

  return {
    userId: user.id,
    email: profile.email,
    isPlatformAdmin: profile.is_platform_admin,
    memberships,
    activeTenant: activeMembership?.tenant ?? null,
    activeRole: (activeMembership?.role as MembershipRole | undefined) ?? null,
  };
}

/** Wirft, wenn niemand angemeldet ist. Für Route Handler. */
export async function requireSession(): Promise<SessionContext> {
  const session = await getSessionContext();
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}

export class UnauthorizedError extends Error {
  readonly status = 401;
  constructor(message = 'Nicht angemeldet') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  readonly status = 403;
  constructor(message = 'Keine Berechtigung') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/** Rolle im genannten Betrieb, oder null ohne Mitgliedschaft. */
export function roleInTenant(
  session: SessionContext,
  tenantId: string,
): MembershipRole | null {
  const membership = session.memberships.find((m) => m.tenant_id === tenantId);
  return membership?.role ?? null;
}

export function requireTenantAdmin(
  session: SessionContext,
  tenantId: string,
): void {
  if (roleInTenant(session, tenantId) !== 'tenant_admin') {
    throw new ForbiddenError(
      'Diese Aktion ist Kunden-Admins des Betriebs vorbehalten',
    );
  }
}

export function requirePlatformAdmin(session: SessionContext): void {
  if (!session.isPlatformAdmin) {
    throw new ForbiddenError('Diese Aktion ist AWSMD vorbehalten');
  }
}
