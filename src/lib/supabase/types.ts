// Datenbanktypen für PROJ-1.
// Handgepflegt. Sobald die Supabase CLI eingerichtet ist, kann diese Datei
// durch `supabase gen types typescript` erzeugt werden.

export type TenantStatus = 'active' | 'suspended';
export type MembershipRole = 'tenant_admin' | 'tenant_member';
export type MembershipStatus = 'invited' | 'active';
export type AccessAction = 'view' | 'export' | 'grant' | 'revoke' | 'login';

export interface Tenant {
  id: string;
  name: string;
  short_name: string;
  status: TenantStatus;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  is_platform_admin: boolean;
  last_tenant_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  tenant_id: string;
  profile_id: string;
  role: MembershipRole;
  status: MembershipStatus;
  invited_at: string;
  first_login_at: string | null;
}

export interface SupportGrant {
  id: string;
  tenant_id: string;
  granted_by: string;
  granted_at: string;
  expires_at: string;
  revoked_at: string | null;
}

export interface AccessLogEntry {
  id: number;
  tenant_id: string;
  actor_id: string | null;
  actor_email: string;
  as_platform_admin: boolean;
  area: string;
  action: AccessAction;
  occurred_at: string;
}

/** Was der Server über den angemeldeten Nutzer weiß. */
export interface SessionContext {
  userId: string;
  email: string;
  isPlatformAdmin: boolean;
  /** Mitgliedschaften samt Betrieb, aufsteigend nach Betriebsname. */
  memberships: Array<Membership & { tenant: Tenant }>;
  /** Der aktive Betrieb. null, wenn der Nutzer keinem Betrieb zugeordnet ist. */
  activeTenant: Tenant | null;
  /** Rolle im aktiven Betrieb. null für Plattform-Admins ohne Mitgliedschaft. */
  activeRole: MembershipRole | null;
}
