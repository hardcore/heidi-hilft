import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ALPHA, BETA, createSupabaseStub, session } from '@/test/supabase-mock';

const stubs = vi.hoisted(() => ({
  client: null as ReturnType<typeof import('@/test/supabase-mock')['createSupabaseStub']> | null,
  session: null as unknown,
}));

vi.mock('@/lib/supabase/server', () => ({ createClient: async () => stubs.client }));
vi.mock('@/lib/auth/session', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/auth/session')>();
  return {
    ...actual,
    getSessionContext: async () => stubs.session,
    // requireSession muss mitgemockt werden: die echte Funktion ruft intern ihr
    // eigenes getSessionContext auf, nicht den hier ersetzten Export.
    requireSession: async () => {
      if (!stubs.session) throw new actual.UnauthorizedError();
      return stubs.session;
    },
  };
});
vi.mock('@/lib/auth/audit', () => ({ logAccess: vi.fn(async () => undefined) }));

import { DELETE, POST } from './route';
import { logAccess } from '@/lib/auth/audit';

function request(method: string, body: unknown) {
  return new Request('http://localhost:3000/api/support-grants', {
    method,
    body: JSON.stringify(body),
  }) as never;
}

describe('POST /api/support-grants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubs.client = createSupabaseStub({
      support_grants: {
        data: { id: 'g1', granted_at: '2026-11-25T10:00:00Z', expires_at: '2026-11-26T10:00:00Z' },
        error: null,
      },
    });
    stubs.session = session();
  });

  it('erteilt die Freigabe als Kunden-Admin und protokolliert sie', async () => {
    const response = await POST(request('POST', { tenantId: ALPHA }));

    expect(response.status).toBe(201);
    expect(logAccess).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: ALPHA, action: 'grant' }),
    );
  });

  it('verweigert die Freigabe einem Mitarbeiter mit 403', async () => {
    stubs.session = session({
      activeRole: 'tenant_member',
      memberships: [
        {
          id: 'm1',
          tenant_id: ALPHA,
          profile_id: 'user',
          role: 'tenant_member',
          status: 'active',
          invited_at: '2026-11-01T00:00:00Z',
          first_login_at: null,
          tenant: {
            id: ALPHA,
            name: 'Fahrschule Alpha',
            short_name: 'FA',
            status: 'active',
            created_at: '2026-11-01T00:00:00Z',
            updated_at: '2026-11-01T00:00:00Z',
          },
        },
      ],
    });

    const response = await POST(request('POST', { tenantId: ALPHA }));

    expect(response.status).toBe(403);
    expect(logAccess).not.toHaveBeenCalled();
  });

  it('verweigert die Freigabe für einen fremden Betrieb mit 403', async () => {
    const response = await POST(request('POST', { tenantId: BETA }));
    expect(response.status).toBe(403);
  });

  it('verweigert sie einem Plattform-Admin ohne Mitgliedschaft', async () => {
    stubs.session = session({ isPlatformAdmin: true, memberships: [] });
    const response = await POST(request('POST', { tenantId: BETA }));
    expect(response.status).toBe(403);
  });

  it('meldet eine bereits laufende Freigabe mit 409', async () => {
    stubs.client = createSupabaseStub({
      support_grants: { data: null, error: { code: '23505' } },
    });
    const response = await POST(request('POST', { tenantId: ALPHA }));
    expect(response.status).toBe(409);
  });

  it('antwortet ohne Anmeldung mit 401', async () => {
    stubs.session = null;
    const response = await POST(request('POST', { tenantId: ALPHA }));
    expect(response.status).toBe(401);
  });
});

describe('DELETE /api/support-grants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubs.session = session();
  });

  it('widerruft eine laufende Freigabe und protokolliert das', async () => {
    stubs.client = createSupabaseStub({
      support_grants: { data: [{ id: 'g1' }], error: null },
    });

    const response = await DELETE(request('DELETE', { tenantId: ALPHA }));

    expect(response.status).toBe(200);
    expect(logAccess).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'revoke' }),
    );
  });

  it('meldet 404, wenn keine Freigabe läuft', async () => {
    stubs.client = createSupabaseStub({
      support_grants: { data: [], error: null },
    });

    const response = await DELETE(request('DELETE', { tenantId: ALPHA }));
    expect(response.status).toBe(404);
  });
});
