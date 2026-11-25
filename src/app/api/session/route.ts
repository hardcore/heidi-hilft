import { getSessionContext } from '@/lib/auth/session';
import { handleError, ok } from '@/lib/api/respond';

/**
 * GET /api/session
 *
 * Wer ist angemeldet, in welchen Betrieben ist er Mitglied, welcher ist aktiv.
 * Grundlage für den Mandantenwechsler und die Zugangskontrolle.
 */
export async function GET() {
  try {
    const session = await getSessionContext();

    if (!session) {
      return ok({ authenticated: false }, 200);
    }

    return ok({
      authenticated: true,
      email: session.email,
      isPlatformAdmin: session.isPlatformAdmin,
      activeTenant: session.activeTenant,
      activeRole: session.activeRole,
      tenants: session.memberships.map((m) => ({
        id: m.tenant.id,
        name: m.tenant.name,
        shortName: m.tenant.short_name,
        status: m.tenant.status,
        role: m.role,
      })),
    });
  } catch (error) {
    return handleError(error);
  }
}
